import { formatValue } from '../../utils';
import { getWalletAddressOrConnect, web3 } from '../../wallet';
import { fetchABI } from '../../contract';
import { sendTx } from '../../tx';
import { getFindWhitelistURL, getMerkleProofURL } from './constants';
import { sendEvent } from '../../analytics';

const getMintPrice = async (contract) => {
    return contract.methods.price().call()
}

const getMintContract = async (whitelist) => {
    const address = whitelist.whitelist_address
    console.log("WHITELIST ADDRESS", address)
    const abi = await fetchABI(address, window.NETWORK_ID)
    console.log("ABI", abi)
    return new web3.eth.Contract(abi, address)
}

export const fetchUserWhitelist = (wallet) => {
    if (window.AIRDROP_ID) {
        return fetch(getMerkleProofURL(window.AIRDROP_ID, wallet))
            .then(r => r.json())
            .then(r => {
                if (r.is_valid &&
                    r.nft_address.toLowerCase() !== window.CONTRACT_ADDRESS.toLowerCase()) {
                        alert("NFT contract addresses don't match between widget config and db")
                        return undefined
                }
                return r.is_valid ? r : undefined
            })
    }

    return fetch(getFindWhitelistURL(wallet))
        .then(r => r.json())
        .then(r =>
            r.airdrops.filter(a =>
                a.is_valid && a.nft_address.toLowerCase() === window.CONTRACT_ADDRESS.toLowerCase()
            )[0]
        )
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
