import { getWalletAddressOrConnect, web3 } from "../wallet.js";
import { formatValue} from "../utils.js";
import { ExtensionContract, NFTContract } from "../contract.js"
import { buildTx } from "../tx";
import { checkIfExtensionSoldOut, getExtensionMintTx } from "./extension";

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
            const defaultMintPrice = getDefaultMintPrice()
            if (defaultMintPrice === undefined) {
                alert("Buildship widget doesn't know how to fetch price from your contract. Contact https://buildship.xyz in Discord to resolve this.")
            }
            return defaultMintPrice
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
    const defaultMaxPerMintConfig = window.DEFAULTS?.publicMint?.maxPerMint || window.MAX_PER_MINT
    if (!defaultMaxPerMintConfig || isNaN(Number(defaultMaxPerMintConfig))) {
        console.error("Can't read maxPerMint from your contract & config, using default value: 10")
        return 10
    }
    return Number(defaultMaxPerMintConfig)
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
    if (!wallet) {
        return { tx: undefined }
    }
    const numberOfTokens = nTokens ?? 1;
    const mintPrice = await getMintPrice();
    if (mintPrice === undefined)
        return { tx: undefined }

    const txParams = {
        from: wallet,
        value: formatValue(Number(mintPrice) * numberOfTokens),
    }
    const mintTx = await getMintTx({ numberOfTokens })
    if (!mintTx) {
        return { tx: undefined }
    }
    const txBuilder = await buildTx(
        mintTx,
        txParams,
        // TODO: use different limits for ERC721A / ERC721
        window.DEFAULTS?.publicMint?.defaultGasLimit ?? (100000),
        window.DEFAULTS?.publicMint?.gasLimitSlippage ?? 5000
    )
    if (!txBuilder) {
        return { tx: undefined }
    }
    const tx = mintTx.send(txBuilder)
    // https://github.com/ChainSafe/web3.js/issues/1547
    return Promise.resolve({ tx })
}
