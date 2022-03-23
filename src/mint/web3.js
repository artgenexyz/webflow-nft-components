import {getWalletAddressOrConnect, web3} from "../wallet.js";
import { formatValue, parseTxError } from "../utils.js";
import {NFTContract} from "../contract.js"

const findMethodByName = (methodName) =>
    Object.keys(NFTContract.methods)
        .find(key => key.toLowerCase() === methodName.toLowerCase())

const getCustomMintTx = (numberOfTokens) => {
    if (window.DEFAULTS.contractMethods.mint) {
        console.log("Using custom mint method name: ", window.DEFAULTS.contractMethods.mint)
        if (NFTContract.methods[window.DEFAULTS.contractMethods.mint]) {
            return NFTContract.methods[window.DEFAULTS.contractMethods.mint](numberOfTokens)
        } else {
            alert("Custom mint method name isn't present in the ABI, using default parser")
            console.log("Custom mint method name isn't present in the ABI, using default parser")
        }
    }
    return undefined
}

const getMintTx = ({ numberOfTokens, ref, tier, wallet }) => {
    const customMintTx = getCustomMintTx(numberOfTokens)
    if (customMintTx)
        return customMintTx

    if (tier !== undefined) {
        return NFTContract.methods.mint(tier, numberOfTokens, ref ?? wallet);
    }
    console.log("Using hardcoded mint method detection")
    const methodNameVariants = ['mint', 'publicMint']
    const name = methodNameVariants.find(n => findMethodByName(n) !== undefined)
    if (!name) {
        alert("Buildship widget doesn't know how to mint from your contract. Contact https://buildship.xyz in Discord to resolve this.")
        return undefined
    }
    return NFTContract.methods[findMethodByName(name)](numberOfTokens);
}

const getMintPrice = async (tier) => {
    if (tier)
        return NFTContract.methods.getPrice(tier).call()

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
                alert("Buildship widget doesn't know how to fetch price from your contract. Contact https://buildship.xyz in Discord to resolve this.")
                return undefined
            }
            return NFTContract.methods[findMethodByName(name)]().call();
    }
}

export const getMintedNumber = async () => {
    if (!NFTContract)
        return undefined
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
    if (NFTContract.methods.maxSupply)
        return await NFTContract.methods.maxSupply().call()
    if (NFTContract.methods.MAX_SUPPLY)
        return await NFTContract.methods.MAX_SUPPLY().call()
    alert("Widget doesn't know how to fetch maxSupply from your contract. Contact https://buildship.xyz to resolve this.")
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
