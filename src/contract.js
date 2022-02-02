import { getCurrentNetwork, isWeb3Initialized, switchNetwork, web3 } from './wallet.js';
import { normalizeURL } from "./utils.js";
import { NETWORKS } from "./constants.js";

export let NFTContract;

export const initContract = async (contract, shouldSwitchNetwork=true) => {
    const host = normalizeURL(window.location.href);
    const allowedURLs = contract?.allowedURLs?.map(u => normalizeURL(u));
    if (allowedURLs && !allowedURLs?.some(v => v.includes(host))) {
        return undefined;
    }
    let currentNetwork = await getCurrentNetwork();
    if (shouldSwitchNetwork && !contract.allowedNetworks.includes(currentNetwork)) {
        await switchNetwork(contract.allowedNetworks[0])
        currentNetwork = await getCurrentNetwork();
    }
    const address = contract.address[contract.allowedNetworks[0]];
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

export const fetchABI = async (address, chainID) => {
    const cachedABI = await fetchCachedABI(address)
    console.log("CACHED ABI", cachedABI)
    if (cachedABI)
        return cachedABI

    const abi = await fetch(`https://metadata.buildship.dev/api/info/${address}?network_id=${chainID}`)
        .then(r => r.json())
        .then(r => r.abi)
    if (!abi) {
        console.log("No ABI returned from https://metadata.buildship.dev")
        const savedMainABI = getSavedMainABI(address)
        if (!savedMainABI) {
            alert(`Error: no ABI loaded for ${address}. Please contact support`)
        }
    }
    return abi;
}

const fetchCachedABI = async (address) => {
    if (window.DEFAULTS?.abiCacheURL) {
        console.log("Trying to load ABI from cache URL", address)
        try {
            return fetch(window.DEFAULTS?.abiCacheURL)
                .then(r => r.json())
                .then(r => Object.keys(r).reduce((acc, key) => {
                    acc[key.toLowerCase()] = r[key]
                    return acc
                }, {}))
                .then(r => r[address.toLowerCase()])
        } catch (e) {
            alert("Wrong format for ABI cache. Should be a URL to .json file. Fix or remove ABI cache URL to resolve")
            console.log("Wrong format for ABI cache", e)
        }
    }
    return undefined
}

const getSavedMainABI = (address) => {
    if (address.toLowerCase() === window.CONTRACT_ADDRESS?.toLowerCase()) {
        console.log("Trying to load saved main contract ABI")
        return typeof window.CONTRACT_ABI === 'string'
            ? JSON.parse(window.CONTRACT_ABI)
            : window.CONTRACT_ABI
    }
    return undefined
}

export const setContracts = async (shouldSwitchNetwork=true) => {
    await initContractGlobalObject();
    if (!isWeb3Initialized()) {
        return
    }
    if (shouldSwitchNetwork) {
        await switchNetwork(window.CONTRACT.nft.allowedNetworks[0]);
    }
    if (NFTContract) {
        return
    }
    NFTContract = await initContract(window.CONTRACT.nft, false);
    console.log("NFTContract", NFTContract)
}
