// TODO: use Moralis API to speed this up
import { ExtensionContract, NFTContract } from "../contract";
import { MintPassExtensionHandler } from "./mint-pass";
import { getWalletAddressOrConnect } from "../wallet";
import { modalRef } from "../components/MintModal";

export const checkIfExtensionSoldOut = async () => {
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

export const canMintViaExtension = async () => {
    if (MintPassExtensionHandler.isExtensionMintPass()) {
        const wallet = await getWalletAddressOrConnect(true)
        return MintPassExtensionHandler.hasMintPasses(wallet)
    }
    return !(await checkIfExtensionSoldOut())
}

export const getExtensionMintTx = async ({ wallet, numberOfTokens }) => {
    if (MintPassExtensionHandler.isExtensionMintPass()) {
        return MintPassExtensionHandler.getMintTx({ wallet, numberOfTokens })
    }
    return ExtensionContract.methods.mint(numberOfTokens)
}

export const getExtensionMaxPerTx = async () => {
    if (MintPassExtensionHandler.isExtensionMintPass()) {
        const wallet = await getWalletAddressOrConnect(true)
        if (!wallet) {
            modalRef.current.setIsOpen(false)
            return null
        }
        return MintPassExtensionHandler.getMaxPerTx(wallet)
    }
    if (ExtensionContract?.methods?.maxPerMint) {
        return Number(await ExtensionContract.methods.maxPerMint().call())
    }
    return null
}