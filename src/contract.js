import { getCurrentNetwork, isWeb3Initialized, switchNetwork, web3 } from './wallet.js';
import { NETWORKS } from "./constants.js";
import { getConfigChainID, readOnlyWeb3 } from "./web3";

export let NFTContract;

const abiMemoryCache = {};

export const initContract = async (_web3, contract, shouldSwitchNetwork=true) => {
    let currentNetwork = await getCurrentNetwork();
    if (shouldSwitchNetwork && !contract.allowedNetworks.includes(currentNetwork)) {
        await switchNetwork(contract.allowedNetworks[0])
        currentNetwork = await getCurrentNetwork();
    }
    const address = contract.address[contract.allowedNetworks[0]];
    const abi = contract.abi;
    return new _web3.eth.Contract(abi, address);
}

const initContractGlobalObject = async () => {
    if (!window.CONTRACT_ADDRESS?.length || window.CONTRACT_ADDRESS === "YOUR CONTRACT ADDRESS HERE") {
        alert("You forgot to insert your NFT contract address in your embed code. Insert your contract address, publish the website and try again. If you don't have it, create it at https://app.buildship.xyz")
        return
    }
    const chainID = getConfigChainID()
    const implementationAddress = window.IMPLEMENTATION_ADDRESS ?? window.CONTRACT_ADDRESS
    window.CONTRACT = {
        nft: {
            address: {
                [chainID]: window.CONTRACT_ADDRESS,
            },
            abi: await fetchABI(implementationAddress, chainID),
            allowedNetworks: [chainID]
        }
    }
}

export const fetchABI = async (address, chainID) => {
    if (abiMemoryCache[address])
        return abiMemoryCache[address]

    const remoteABI = await fetchRemoteCachedABI(address)
    console.log("REMOTE CACHED ABI", remoteABI)
    if (remoteABI)
        return remoteABI

    const abi = await fetch(`https://metadata.buildship.xyz/api/v1.1/contract/${address}?network_id=${chainID}`)
        .then(r => r.json())
        .then(async ({ abi, isProxy, implementation }) => {
            if (isProxy) {
                if (implementation) {
                    return await fetchABI(implementation, chainID)
                } else {
                    console.error("Couldn't fetch ABI for proxy with undefined implementation address ")
                    return null
                }
            }
            return abi
        })
        .catch(e => null)

    if (!abi) {
        console.log("No ABI returned from https://metadata.buildship.xyz")
        const embeddedMainABI = getEmbeddedMainABI(address)
        if (!embeddedMainABI) {
            alert(`Error: no ABI loaded for ${address}. Please contact support`)
        }
        return embeddedMainABI;
    }
    abiMemoryCache[address] = abi;
    return abi;
}

const fetchRemoteCachedABI = async (address) => {
    if (!window.DEFAULTS?.abiCacheURL) {
        return null
    }

    console.log("Trying to load ABI from cache URL", address)
    try {
        return await fetch(window.DEFAULTS?.abiCacheURL)
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

const getEmbeddedMainABI = (address) => {
    if (address?.toLowerCase() === window.CONTRACT_ADDRESS?.toLowerCase()) {
        console.log("Trying to load embedded main contract ABI")
        return typeof window.CONTRACT_ABI === 'string'
            ? JSON.parse(window.CONTRACT_ABI)
            : window.CONTRACT_ABI
    }
    return undefined
}

export const setContracts = async (shouldSwitchNetwork=true) => {
    await initContractGlobalObject();
    const _web3 = isWeb3Initialized() ? web3 : readOnlyWeb3
    if (shouldSwitchNetwork) {
        await switchNetwork(window.CONTRACT.nft.allowedNetworks[0]);
    }
    NFTContract = await initContract(_web3, window.CONTRACT.nft, false);
    console.log("NFTContract", NFTContract)
}

export const isEthereumContract = () => isEthereum(getConfigChainID())

export const isEthereum = (chainID) => NETWORKS[chainID] && NETWORKS[chainID].chain === "ethereum"
