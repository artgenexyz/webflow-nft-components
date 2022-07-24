import { formatValue } from '../../utils';
import { getWalletAddressOrConnect, web3 } from '../../wallet';
import { fetchABI, getConfigChainID } from '../../contract';
import { buildTx } from '../../tx';
import { getFindWhitelistURL, getMerkleProofURL } from './constants';
import { sendEvent } from '../../analytics';
import { getDefaultMaxTokensPerMint } from '../web3';
import { supabase } from "./supabase";

let whitelistCache = {}
let presaleContract

const getMintPrice = async (contract) => {
    return contract.methods.price().call()
}

const fetchPresaleContract = async (whitelist) => {
    if (presaleContract)
        return presaleContract
    const address = whitelist.whitelist_address
    console.log("WHITELIST ADDRESS", address)
    const abi = await fetchABI(address, getConfigChainID())
    console.log("ABI", abi)
    presaleContract = new web3.eth.Contract(abi, address)
    return presaleContract
}

export const getPresaleMaxPerAddress = async () => {
    const wallet = await getWalletAddressOrConnect(true)
    const contract = await fetchPresaleContract(whitelistCache[wallet])

    if (contract?.methods?.maxPerAddress) {
        console.log(await contract.methods.maxPerAddress().call())
        return await contract.methods.maxPerAddress().call()
    }
    return getDefaultMaxTokensPerMint()
}

export const checkWhitelistEligibility = async () => {
    const wallet = await getWalletAddressOrConnect(true)
    sendEvent(window.analytics, 'connect-wallet-success', { wallet });
    const whitelist = await fetchUserWhitelist(wallet)
    return whitelist !== undefined
}

export const findWhitelistForAddress = async (address, nft_address) => {
    const { data, error } = await supabase
        .from('MerkleTreeAirdropAddress')
        .select('proof,airdrop_id!inner(id,token_address,whitelist_address)')
        .ilike('address', address)
        .eq('airdrop_id.token_address', nft_address.toLowerCase())
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()
    if (data) {
        const { airdrop_id: { whitelist_address }, proof } = data
        const whitelist = { whitelist_address, proof }
        whitelistCache = {
            ...whitelistCache,
            [address]: whitelist
        }
        return whitelist
    }
    return undefined
}

export const fetchUserWhitelist = async (wallet) => {
    if (whitelistCache[wallet]) {
        return whitelistCache[wallet]
    }

    const contractAddress = window.CONTRACT_ADDRESS?.toLowerCase()
    // optimized version for huge drops
    const useOptimized = window.DEFAULTS?.presale?.useOptimized
    if (useOptimized) {
        return findWhitelistForAddress(wallet, contractAddress, whitelistCache)
    }

    const wlAddress = window.WHITELIST_ADDRESS?.toLowerCase()
    const r = await fetch(getFindWhitelistURL(wallet))
    const { airdrops } = await r.json()

    const validLists = airdrops
        .filter(a =>
            a.is_valid
            && a.nft_address.toLowerCase() === contractAddress
            && (!wlAddress || a.whitelist_address.toLowerCase() === wlAddress)
        )
        .sort((a,b) => a.created_at > b.created_at)

    // sorted by creation date, newest last
    // we take newest whitelist

    const newestList = validLists.pop()

    whitelistCache = {
        ...whitelistCache,
        [wallet]: newestList
    }

    return newestList
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
    const contract = await fetchPresaleContract(whitelist)
    const mintPrice = await getMintPrice(contract)

    const txParams = {
        from: wallet,
        value: formatValue(Number(mintPrice) * quantity),
    }
    const mintTx = await getMintTx({contract, whitelist, quantity})
    const tx = mintTx.send(await buildTx(mintTx, txParams, 160000))
    return Promise.resolve({ tx })
}
