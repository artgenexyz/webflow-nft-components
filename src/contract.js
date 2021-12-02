import {getCurrentNetwork, switchNetwork, web3, isWeb3Initialized} from './wallet.js';
import {normalizeURL} from "./utils.js";
import {NETWORKS} from "./constants.js";

export let NFTContract;

export const initContract = async (contract, shouldSwitchNetwork=true) => {
    const host = normalizeURL(window.location.href);
    const allowedURLs = contract?.allowedURLs?.map(u => normalizeURL(u));
    if (allowedURLs && !allowedURLs?.some(v => v.includes(host))) {
        console.log("HAHA")
        return undefined;
    }
    let currentNetwork = await getCurrentNetwork();
    if (shouldSwitchNetwork && !contract.allowedNetworks.includes(currentNetwork)) {
        await switchNetwork(contract.allowedNetworks[0])
        currentNetwork = await getCurrentNetwork();
    }
    const address = contract.address[contract.allowedNetworks[0]];
    const abi = contract.abi;
    console.log((new web3.eth.Contract(abi, address)))
    return new web3.eth.Contract(abi, address);
}

const initContractGlobalObject = () => {
    // Default to Ethereum
    const networkID = window.NETWORK_ID ?? 1;
    const chainID = window.IS_TESTNET ? NETWORKS[networkID].testnetID : networkID;
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

export const setContracts = async (shouldSwitchNetwork=true) => {
    initContractGlobalObject();
    if (!isWeb3Initialized()) {
        return
    }
    if (NFTContract) {
        return
    }
    NFTContract = await initContract(window.CONTRACT.nft, shouldSwitchNetwork);
    console.log("NFTContract", NFTContract)
}
