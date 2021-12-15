import { formatValue } from '../../utils';
import { getWalletAddressOrConnect, web3 } from '../../wallet';
import { fetchABI } from '../../contract';
import { WHITELIST } from './index';
import { sendTx } from '../../tx';
import { getMerkleProofURL } from './constants';
import { showMintModal } from '../../components/MintModal';

const getMintPrice = async (wallet) => {
    return getUserWhitelist(wallet).price * 1e18
}

const getMintContract = async (wallet) => {
    console.log(getUserWhitelist(wallet))
    const address = getUserWhitelist(wallet).contract
    console.log("ADDRESS CONTACT", address)
    const abi = await fetchABI(address, window.NETWORK_ID)
    console.log("ABI", abi)
    return new web3.eth.Contract(abi, address)
}

const getUserWhitelist = (wallet) => {
    console.log(WHITELIST)
    const wl = Object.values(WHITELIST)
        .filter(l =>
            l.wallets?.map(w => w.toLowerCase())
            ?.includes(wallet.toLowerCase())
        )
    return wl.length ? wl : Object.values(WHITELIST).slice(-1)[0]
}

const getMerkleProof = async (wallet) => {
    const merkleID = getUserWhitelist(wallet).merkleID
    return fetch(getMerkleProofURL(merkleID, wallet))
        .then(r => r.json())
        .then(r => r.proof)
}

const getMintTx = async ({ wallet, contract, quantity }) => {
    const proof = await getMerkleProof(wallet)
    return contract.methods.mint(quantity, proof)
}

export const mint = async (nTokens) => {
    const wallet = await getWalletAddressOrConnect(true);
    const quantity = nTokens ?? 1;
    const mintPrice = await getMintPrice(wallet)
    const contract = await getMintContract(wallet)
    const isWhitelist = getUserWhitelist(wallet).merkleID !== undefined
    if (!isWhitelist) {
        showMintModal()
        return Promise.reject()
    }

    const txParams = {
        from: wallet,
        value: formatValue(Number(mintPrice) * quantity),
    }
    const mintTx = await getMintTx({contract, wallet, quantity})
    return sendTx(mintTx, txParams)
}
