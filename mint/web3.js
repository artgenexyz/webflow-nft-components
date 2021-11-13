import {getWalletAddress, web3} from "../wallet.js";
import { formatValue, parseTxError } from "../utils.js";
import { NFTContract } from "../contract.js"

const getMintTx = ({ numberOfTokens, ref, tier }) => {
    if (tier !== undefined) {
        return NFTContract.methods.mint(tier, numberOfTokens, ref ?? wallet);
    }
    return NFTContract.methods.mint(numberOfTokens);
}

const getMintPrice = async (tier) => {
    return tier ?
        await NFTContract.methods.getPrice(tier).call() :
        await NFTContract.methods.getPrice().call();
}

export const mint = async (nTokens, ref, tier) => {
    const wallet = await getWalletAddress();
    const numberOfTokens = nTokens ?? 1;
    const mintPrice = await getMintPrice();

    const txParams = {
        from: wallet,
        value: formatValue(Number(mintPrice) * numberOfTokens),
    }
    const estimatedGas = await getMintTx({ numberOfTokens, ref, tier })
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

    return getMintTx({ numberOfTokens, ref, tier })
        .send({...txParams, gasLimit: estimatedGas + 5000, maxFeePerGas: formatValue(maxGasPrice) })
}
