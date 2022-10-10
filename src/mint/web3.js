import { getWalletAddressOrConnect, web3 } from "../wallet.js";
import { formatValue, parseTxError } from "../utils.js";
import { isEthereum, NFTContract, ExtensionContract } from "../contract.js"

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

// TODO: use Moralis API to speed this up
const checkIfExtensionSoldOut = async () => {
    // use extensionSupply() method, if it's not there the method is either called maxSupply, or extension supply is unlimited
    const extensionSupplyMethod = ExtensionContract?.methods?.extensionSupply
        ?? ExtensionContract?.methods?.maxSupply
    if (!ExtensionContract?.methods?.totalMinted || !extensionSupplyMethod) {
        return undefined
    }

    const extensionMinted = await ExtensionContract.methods.totalMinted().call()
    // use cache if already fetched isSoldOut and nothing new was minted
    const {
        isSoldOut: isSoldOutCached,
        extensionMinted: extensionMintedCached,
        maxSupply: maxSupplyCached
    } = window.CONTRACT?.extension?.values ?? {}
    if (isSoldOutCached && extensionMinted === extensionMintedCached) {
        return isSoldOutCached
    }

    let reservedLeft
    try {
        reservedLeft = await NFTContract.methods.reserved().call()
    } catch (e) {
        reservedLeft = 0
    }

    const extensionTotal = maxSupplyCached
        ?? await extensionSupplyMethod().call()
    const isSoldOut = Number(extensionMinted) + Number(reservedLeft) === Number(extensionTotal)
    if (window.CONTRACT.extension) {
        window.CONTRACT.extension.values = {
            totalMinted: extensionMinted,
            maxSupply: extensionTotal,
            isSoldOut
        }
    }
    console.log("is extension sold out", isSoldOut)
    return isSoldOut
}

const getExtensionMintTx = async ({ numberOfTokens }) => {
    return ExtensionContract.methods.mint(numberOfTokens);
}

const getPublicMintTx = ({ numberOfTokens }) => {
    const customMintMethod = getMethodWithCustomName('mint')
    if (customMintMethod)
        return customMintMethod(numberOfTokens)

    console.log("Using hardcoded mint method detection")
    const methodNameVariants = ['mint', 'publicMint', 'mintNFTs', 'mintPublic', 'mintSale']
    const name = methodNameVariants.find(n => findMethodByName(n) !== undefined)
    if (!name) {
        alert("Buildship widget doesn't know how to mint from your contract. Contact https://buildship.xyz in Discord to resolve this.")
        return undefined
    }
    return NFTContract.methods[findMethodByName(name)](numberOfTokens);
}

const getMintTx = async ({ numberOfTokens }) => {
    if (ExtensionContract) {
        if (!await checkIfExtensionSoldOut()) {
            return await getExtensionMintTx({ numberOfTokens })
        }
    }

    return getPublicMintTx({ numberOfTokens })
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
    if (ExtensionContract?.methods?.price && !await checkIfExtensionSoldOut())
        return await ExtensionContract.methods.price().call()

    const matches = Object.keys(NFTContract.methods).filter(key =>
        !key.includes("()") && (key.toLowerCase().includes('price') || key.toLowerCase().includes('cost'))
    )
    switch (matches.length) {
        // Use auto-detection only when sure
        // Otherwise this code might accidentally use presale price instead of public minting price
        case 1:
            console.log("Using price method auto-detection")
            return NFTContract.methods[matches[0]]().call()
        case 0:
            alert("Buildship widget doesn't know how to fetch price from your contract. Contact https://buildship.xyz in Discord to resolve this.")
            return undefined
        default:
            console.log("Using hardcoded price detection")
            const methodNameVariants = ['price', 'cost', 'public_sale_price', 'getPrice']
            const name = methodNameVariants.find(n => findMethodByName(n) !== undefined)
            if (!name) {
                const defaultMintPrice = getDefaultMintPrice()
                console.log("defaultMintPrice", defaultMintPrice)
                if (defaultMintPrice === undefined) {
                    alert("Buildship widget doesn't know how to fetch price from your contract. Contact https://buildship.xyz in Discord to resolve this.")
                }
                return defaultMintPrice
            }
            return NFTContract.methods[findMethodByName(name)]().call();
    }
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
    if (!NFTContract)
        return undefined
    // TODO: decide if this is needed or not
    // if (ExtensionContract?.methods?.maxSupply)
    //     return await ExtensionContract.methods.maxSupply().call()

    const customMaxSupplyMethod = getMethodWithCustomName('maxSupply')
    if (customMaxSupplyMethod)
        return await customMaxSupplyMethod().call()

    if (NFTContract.methods.maxSupply)
        return await NFTContract.methods.maxSupply().call()
    if (NFTContract.methods.MAX_SUPPLY)
        return await NFTContract.methods.MAX_SUPPLY().call()
    alert("Widget doesn't know how to fetch maxSupply from your contract. Contact https://buildship.xyz to resolve this.")
    return undefined
}

export const getDefaultMaxTokensPerMint = () => {
    return window.MAX_PER_MINT ?? 10
}

export const getMaxTokensPerMint = async () => {
    if (ExtensionContract?.methods?.maxPerMint && !await checkIfExtensionSoldOut()) {
        return Number(await ExtensionContract.methods.maxPerMint().call())
    }
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
    const txBase = await getMintTx({ numberOfTokens })
    console.log("txbase", txBase, txParams)
    const estimatedGas = await txBase.estimateGas(txParams).catch((e) => {
            const { code, message } = parseTxError(e);
            if (code === -32000) {
                // TODO: support default gasLimit estimation for non-ERC721A contracts
                return 100000
                // return 100000 * numberOfTokens;
            }
            alert(`${message}. Please try refreshing page, check your MetaMask connection or contact us to resolve`);
            console.log(e);
            return null
        })
    if (estimatedGas === null) {
        return { tx: undefined }
    }
    const gasPrice = await web3.eth.getGasPrice();
    // Math.max is for Goerli (low gas price), 2.5 Gwei is Metamask default for maxPriorityFeePerGas
    const maxGasPrice = Math.max(Math.round(Number(gasPrice) * 1.2), 5e9);
    const chainID = await web3.eth.getChainId();
    const maxFeePerGas = isEthereum(chainID) ? formatValue(maxGasPrice) : undefined;
    const maxPriorityFeePerGas =  isEthereum(chainID) ? 2e9 : undefined;
    const minGasLimit = window.DEFAULTS?.presale?.minGasLimit
    const gasLimitSlippage = window.DEFAULTS?.presale?.gasLimitSlippage ?? 5000
    const gasLimit = minGasLimit ? Math.max(minGasLimit, estimatedGas + gasLimitSlippage) : estimatedGas + gasLimitSlippage
    console.log('minGasLimit', minGasLimit)
    console.log('gasLimit', gasLimit)
    const tx = txBase
        .send({
            ...txParams,
            gasLimit,
            maxPriorityFeePerGas,
            maxFeePerGas
        })
    // https://github.com/ChainSafe/web3.js/issues/1547
    return Promise.resolve({ tx })
}
