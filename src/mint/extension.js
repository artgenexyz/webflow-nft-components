// TODO: use Moralis API to speed this up
import { ExtensionContract, NFTContract } from "../contract";

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

export const getExtensionMintTx = async ({ numberOfTokens }) => {
    return ExtensionContract.methods.mint(numberOfTokens);
}