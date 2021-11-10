import {getCurrentNetwork, switchNetwork, web3, isWeb3Initialized} from './wallet.js';
import {normalizeURL} from "./utils.js";

export let NFTContract;

const initContract = async (contract) => {
    const host = normalizeURL(window.location.href);
    const allowedURLs = contract?.allowedURLs?.map(u => normalizeURL(u));
    if (!allowedURLs?.some(v => v.includes(host))) {
        return undefined;
    }
    let currentNetwork = await getCurrentNetwork();
    if (!contract.allowedNetworks.includes(currentNetwork)) {
        await switchNetwork(contract.allowedNetworks[0])
        currentNetwork = await getCurrentNetwork();
    }
    const address = contract.address[currentNetwork];
    const abi = contract.abi;
    return new web3.eth.Contract(abi, address);
}

const initContractGlobalObject = () => {
    const chainID = window.IS_TESTNET ? 4 : 1;
    window.CONTRACT = {
        nft: {
            address: {
                [chainID]: window.CONTRACT_ADDRESS,
            },
            abi: typeof window.CONTRACT_ABI === 'string'
                ? JSON.parse(window.CONTRACT_ABI)
                : window.CONTRACT_ABI,
            allowedNetworks: [chainID],
            allowedURLs: [window.WEBSITE_URL]
        }
    }
}

export const setContracts = async () => {
    if (!isWeb3Initialized()) {
        return
    }
    if (NFTContract) {
        return
    }
    initContractGlobalObject()
    NFTContract = await initContract(window.CONTRACT.nft);
    // for debug purposes
    window.NFTContract = NFTContract;
}
