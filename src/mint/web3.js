import {getWalletAddressOrConnect, web3} from "../wallet.js";
import { formatValue, parseTxError } from "../utils.js";
import {NFTContract, setContracts} from "../contract.js"

const getMintTx = ({ numberOfTokens, ref, tier, wallet }) => {
    if (tier !== undefined) {
        return NFTContract.methods.mint(tier, numberOfTokens, ref ?? wallet);
    }
    return NFTContract.methods.mint(numberOfTokens);
}

const getMintPrice = async (tier) => {
    if (NFTContract.methods.price)
        return NFTContract.methods.price().call();
    return tier ?
        await NFTContract.methods.getPrice(tier).call() :
        await NFTContract.methods.getPrice().call();
}

export const getDefaultMaxTokensPerMint = () => {
    return window.MAX_PER_MINT ?? 20
}

export const getMaxTokensPerMint = async () => {
    if (!NFTContract) return getDefaultMaxTokensPerMint()
    if (NFTContract.methods.maxPerMint) {
        return Number(await NFTContract.methods.maxPerMint().call())
    }
    return Number(await NFTContract.methods.MAX_TOKENS_PER_MINT().call());
}

export const mint = async (nTokens, ref, tier) => {
    const wallet = await getWalletAddressOrConnect(true);
    const numberOfTokens = nTokens ?? 1;
    const mintPrice = await getMintPrice(tier);

    const txParams = {
        from: wallet,
        value: formatValue(Number(mintPrice) * numberOfTokens),
    }
    const estimatedGas = await getMintTx({ numberOfTokens, ref, tier, wallet })
        .estimateGas(txParams).catch((e) => {
            const { code, message } = parseTxError(e);
            if (code === -32000) {
                return 300000;
            }
            alert(`Error ${message}. Please try refreshing page, check your MetaMask connection or contact us to resolve`);
            console.log(e);
        })
    const gasPrice = await web3.eth.getGasPrice();
    // Math.max is for Rinkeby (low gas price), 2.5 Gwei is Metamask default for maxPriorityFeePerGas
    const maxGasPrice = Math.max(Math.round(Number(gasPrice) * 1.2), 2.5e9);
    const chainID = await web3.eth.getChainId();
    const maxFeePerGas = [1, 4].includes(chainID) ? formatValue(maxGasPrice) : undefined;

    return getMintTx({ numberOfTokens, ref, tier, wallet })
        .send({...txParams, gasLimit: estimatedGas + 5000, maxFeePerGas })
}
