import { getWalletAddressOrConnect, web3 } from "../wallet.js";
import { formatValue, parseTxError } from "../utils.js";
import { NFTContract } from "../contract.js"

const findMethodByName = (methodName) =>
    Object.keys(NFTContract.methods)
        .find(key => key.toLowerCase() === methodName.toLowerCase())

const getMethodWithCustomName = (methodName) => {
    const method = window.DEFAULTS?.contractMethods ? window.DEFAULTS?.contractMethods[methodName] : undefined
    if (method) {
        console.log(`Using custom ${methodName} method name: `, method)
        if (NFTContract.methods[method]) {
            return NFTContract.methods[method]
        } else {
            alert(`Custom ${methodName} name isn't present in the ABI, using default name`)
            console.log(`Custom ${methodName} name isn't present in the ABI, using default name`)
        }
    }
    return undefined
}

const getMintTx = ({ numberOfTokens }) => {
    return NFTContract.methods.mint(numberOfTokens);
}

const getDefaultMintPrice = () => {
    // for contracts without exported price variable or method
    const defaultPrice = window.DEFAULTS?.publicMint?.price
    if (defaultPrice) {
        const priceNumber = typeof defaultPrice === "string" ? Number(defaultPrice) : defaultPrice
        if (isNaN(priceNumber)) {
            alert("Wrong publicMintPrice format, should be a number in ETH (or native token)")
            return undefined
        }
        console.warn("Using DEFAULTS.publicMint.price as price not found in the smart-contract")
        return (priceNumber * 1e18).toString()
    }
    return undefined
}

export const getMintPrice = async () => {
    return 1e18.toString()
}

export const getMintedNumber = async () => {
    if (!NFTContract)
        return undefined

    const customTotalSupplyMethod = getMethodWithCustomName('totalSupply')
    if (customTotalSupplyMethod)
        return await customTotalSupplyMethod().call()

    if (NFTContract.methods.totalSupply)
        return await NFTContract.methods.totalSupply().call()
    // temporary solution, works only for buildship.xyz contracts
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
    return 1000
}

export const getDefaultMaxTokensPerMint = () => {
    return window.MAX_PER_MINT ?? 10
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

export const mint = async (nTokens) => {
    const wallet = await getWalletAddressOrConnect(true);
    const numberOfTokens = nTokens ?? 1;
    const mintPrice = await getMintPrice();
    if (mintPrice === undefined)
        return { tx: undefined }

    const txParams = {
        from: wallet,
        value: formatValue(Number(mintPrice) * numberOfTokens),
    }
    const estimatedGas = await getMintTx({ numberOfTokens })
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

    const tx = getMintTx({ numberOfTokens })
        .send({
            ...txParams,
            gasLimit: estimatedGas + 5000,
            maxPriorityFeePerGas,
            maxFeePerGas
        })
    // https://github.com/ChainSafe/web3.js/issues/1547
    return Promise.resolve({ tx })
}
