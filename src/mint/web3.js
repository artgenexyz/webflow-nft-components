import {getWalletAddressOrConnect, web3} from "../wallet.js";
import { formatValue, parseTxError } from "../utils.js";
import {NFTContract} from "../contract.js"

const getMintTx = ({ numberOfTokens, ref, tier, wallet }) => {
    if (tier !== undefined) {
        return NFTContract.methods.mint(tier, numberOfTokens, ref ?? wallet);
    }
    return NFTContract.methods.mint(numberOfTokens);
}

const getMintPrice = async (tier) => {
    if (NFTContract.methods.price)
        return NFTContract.methods.price().call();
    if (NFTContract.methods.cost)
        return NFTContract.methods.cost().call();
    return tier ?
        await NFTContract.methods.getPrice(tier).call() :
        await NFTContract.methods.getPrice().call();
}

export const getMintedNumber = async () => {
    if (!NFTContract)
        return undefined
    if (NFTContract.methods.totalSupply)
        return await NFTContract.methods.totalSupply().call()
    // temporary solution, works only for buildship.dev contracts
    // totalSupply was removed to save gas when minting
    // but number minted still accessible in the contract as a private variable
    // TODO: remove this in NFTFactory v1.1
    const minted = await web3.eth.getStorageAt(
        NFTContract._address,
        '0x00000000000000000000000000000000000000000000000000000000000000fb'
    )
    return web3.utils.hexToNumber(minted)
}

export const getMaxSupply = async () => {
    if (!NFTContract)
        return undefined
    if (NFTContract.methods.maxSupply)
        return await NFTContract.methods.maxSupply().call()
    if (NFTContract.methods.MAX_SUPPLY)
        return await NFTContract.methods.MAX_SUPPLY().call()
    alert("Widget doesn't know how to fetch maxSupply from your contract. Contact https://buildship.dev to resolve this.")
    return undefined
}

export const getDefaultMaxTokensPerMint = () => {
    return window.MAX_PER_MINT ?? 20
}

export const getMaxTokensPerMint = async () => {
    if (NFTContract?.methods?.maxPerMint) {
        return Number(await NFTContract.methods.maxPerMint().call())
    }
    if (NFTContract?.methods?.maxMintAmount) {
        return Number(await NFTContract.methods.maxMintAmount().call())
    }
    if (NFTContract?.methods?.MAX_TOKENS_PER_MINT) {
        return Number(await NFTContract.methods.MAX_TOKENS_PER_MINT().call())
    }
    return getDefaultMaxTokensPerMint()
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
                return 100000 * numberOfTokens;
            }
            alert(`Error ${message}. Please try refreshing page, check your MetaMask connection or contact us to resolve`);
            console.log(e);
        })
    const gasPrice = await web3.eth.getGasPrice();
    // Math.max is for Rinkeby (low gas price), 2.5 Gwei is Metamask default for maxPriorityFeePerGas
    const maxGasPrice = Math.max(Math.round(Number(gasPrice) * 1.2), 2e9);
    const chainID = await web3.eth.getChainId();
    const maxFeePerGas = [1, 4].includes(chainID) ? formatValue(maxGasPrice) : undefined;
    const maxPriorityFeePerGas =  [1, 4].includes(chainID) ? 2e9 : undefined;

    const tx = getMintTx({ numberOfTokens, ref, tier, wallet })
        .send({
            ...txParams,
            gasLimit: estimatedGas + 5000,
            maxPriorityFeePerGas,
            maxFeePerGas
        })
    // https://github.com/ChainSafe/web3.js/issues/1547
    return Promise.resolve({ tx })
}
