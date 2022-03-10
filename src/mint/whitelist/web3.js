import { formatValue } from '../../utils';
import { getWalletAddressOrConnect, web3 } from '../../wallet';
import { fetchABI, getConfigChainID } from '../../contract';
import { sendTx } from '../../tx';
import { getFindWhitelistURL } from './constants';
import { sendEvent } from '../../analytics';

const getMintPrice = async (contract) => {
    return contract.methods.price().call()
}

const getMintContract = async (whitelist) => {
    const address = whitelist.whitelist_address
    console.log("WHITELIST ADDRESS", address)
    const abi = await fetchABI(address, getConfigChainID())
    console.log("ABI", abi)
    return new web3.eth.Contract(abi, address)
}

export const fetchUserWhitelist = async (wallet) => {
    const contractAddress = window.CONTRACT_ADDRESS?.toLowerCase()
    const wlAddress = window.WHITELIST_ADDRESS?.toLowerCase()
    const r = await fetch(getFindWhitelistURL(wallet))
    
    const { airdrops } = await r.json()
    
    const valid = airdrops
        .filter(a =>
            a.is_valid
            && a.nft_address.toLowerCase() === contractAddress
            && (!wlAddress || a.whitelist_address.toLowerCase() === wlAddress)
        )
        .sort((a,b) => a.created_at > b.created_at)
    
    return valid.shift() // take first

}

const getMerkleProof = async (whitelist) => {
    return whitelist.proof
}

const getMintTx = async ({ whitelist, contract, quantity }) => {
    const proof = await getMerkleProof(whitelist)
    return contract.methods.mint(quantity, proof)
}

export const mint = async (nTokens) => {
    const wallet = await getWalletAddressOrConnect(true)

    sendEvent(window.analytics, 'connect-wallet-success', { wallet });

    const whitelist = await fetchUserWhitelist(wallet)
    console.log("WHITELIST", whitelist)
    if (!whitelist) {
        return Promise.reject("Your wallet is not whitelisted. If this is a mistake, contact our support in Discord")
    }
    const quantity = nTokens ?? 1
    const contract = await getMintContract(whitelist)
    const mintPrice = await getMintPrice(contract)

    const txParams = {
        from: wallet,
        value: formatValue(Number(mintPrice) * quantity),
    }
    const mintTx = await getMintTx({contract, whitelist, quantity})
    return sendTx(mintTx, txParams, 160000)
}
