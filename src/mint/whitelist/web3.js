import { formatValue } from '../../utils';
import { getWalletAddressOrConnect, web3 } from '../../wallet';
import { fetchABI } from '../../contract';
import { sendTx } from '../../tx';
import { getFindWhitelistURL } from './constants';

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
    return fetch(getFindWhitelistURL(wallet))
        .then(r => r.json())
        .then(r =>
            r.airdrops.filter(a =>
                a.is_valid && a.nft_address === window.CONTRACT_ADDRESS
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
    return sendTx(mintTx, txParams)
}
