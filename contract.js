import {getCurrentNetwork, switchNetwork, web3, isWeb3Initialized} from './wallet.js';
import {normalizeURL} from "./utils.js";
import {NETWORKS} from "./constants.js";

export let NFTContract;

const initContract = async (contract) => {
    const host = normalizeURL(window.location.href);
    const allowedURLs = contract?.allowedURLs?.map(u => normalizeURL(u));
    if (allowedURLs && !allowedURLs?.some(v => v.includes(host))) {
        return undefined;
    }
    let currentNetwork = await getCurrentNetwork();
    if (!contract.allowedNetworks.includes(currentNetwork)) {
        await switchNetwork(contract.allowedNetworks[0])
        currentNetwork = await getCurrentNetwork();
    }
    const address = contract.address[currentNetwork];
    const abi = contract.abi ?? await fetchABI(address, currentNetwork);
    return new web3.eth.Contract(abi, address);
}

const initContractGlobalObject = async () => {
    if (window.CONTRACT_ADDRESS === "<your contract address here>") {
        alert("You forgot to insert your NFT contract address in your Webflow Embed code. Insert your contract address, publish the website and try again. If you don't have it, contact https://buildship.dev")
        return
    }
    // Default to Ethereum
    const networkID = window.NETWORK_ID ?? 1;
    const chainID = window.IS_TESTNET ? NETWORKS[networkID].testnetID : networkID;
    window.CONTRACT = {
        nft: {
            address: {
                [chainID]: window.CONTRACT_ADDRESS,
            },
            abi: await fetchABI(window.CONTRACT_ADDRESS, chainID),
            allowedNetworks: [chainID]
        }
    }
}

const fetchABI = async (address, chainID) => {
    const abi = await fetch(`https://metadata.buildship.dev/api/info/${address}?network_id=${chainID}`)
        .then(r => r.json())
        .then(r => r.abi)
    if (!abi) {
        console.log("No ABI returned from https://metadata.buildship.dev")
        return typeof window.CONTRACT_ABI === 'string'
            ? JSON.parse(window.CONTRACT_ABI)
            : window.CONTRACT_ABI
    }
    return abi;
}

export const setContracts = async () => {
    await initContractGlobalObject();
    if (!isWeb3Initialized()) {
        return
    }
    if (NFTContract) {
        return
    }
    NFTContract = await initContract(window.CONTRACT.nft);
    // for debug purposes
    window.NFTContract = NFTContract;
}
