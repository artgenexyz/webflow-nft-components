import { estimateGasLimit, estimateMaxGasFee, estimateMaxPriorityFeePerGas, sendTx } from '../../tx';
import { getWalletAddressOrConnect } from '../../wallet';
import { getMintPrice } from '../web3';
import { NFTContract } from '../../contract';
import { formatValue } from '../../utils';

let cachedPasses

const getNFTsOfOwner = async (wallet, nft_address) => {
    const moralisApiKey = window.DEFAULTS?.apiKeys?.moralis
    // TODO: support multichain
    if (![1,4].includes(window.NETWORK_ID)) {
        alert("Mint pass is not supported for this network")
        return
    }
    const chain = window.NETWORK_ID === 4 ? "rinkeby" : "mainnet"
    const walletNFTs = await fetch(`https://deep-index.moralis.io/api/v2/${wallet}/nft/${nft_address}?chain=${chain}`, {
        headers: {
            "Accept": "application/json",
            "X-API-Key": moralisApiKey
        }
    }).then(r => r.json())
    console.log(walletNFTs)
    return walletNFTs
}

const getPassesOwnedIds = async (wallet, pass_address) => {
    const passes = getNFTsOfOwner(wallet, pass_address)
    return passes.then(r => r.result.map(t => Number(t.token_id)))
}

export const getMaxPerMintForPass = async (wallet, passAddress) => {
    cachedPasses = await getPassesOwnedIds(wallet, passAddress)
    return cachedPasses?.length
}

export const mintWithPass = async (nTokens) => {
    const wallet = await getWalletAddressOrConnect(true)
    const mintPrice = await getMintPrice()
    const passAddress = await NFTContract.methods.mintPassAddress().call()
    console.log("PASS", passAddress)
    const ownedPasses = cachedPasses ? cachedPasses : await getPassesOwnedIds(wallet, passAddress)
    if (!ownedPasses?.length) {
        alert("You don't have any mint passes. Please wait for public mint to start")
        return Promise.reject()
    }
    const numberOfTokens = nTokens ?? 1
    const passesToUse = ownedPasses.slice(0, numberOfTokens)
    const txData = {
        from: wallet,
        value: formatValue(Number(mintPrice) * numberOfTokens),
    }
    const tx = NFTContract.methods.mint(passesToUse)
    const estimatedGas = await estimateGasLimit(tx, txData, 200000);
    if (!estimatedGas) {
        return Promise.reject()
    }
    const maxFeePerGas = await estimateMaxGasFee(tx);
    const maxPriorityFeePerGas = await estimateMaxPriorityFeePerGas();
    const sentTx = tx.send({...txData, gasLimit: estimatedGas + 5000, maxFeePerGas, maxPriorityFeePerGas });
    return Promise.resolve({ tx: sentTx })
}
