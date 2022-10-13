import Web3 from "web3";
import { NETWORKS } from "./constants";

export const getConfigChainID = () => {
    // Default to Ethereum
    const networkID = window.NETWORK_ID ?? 1;
    return window.IS_TESTNET ? NETWORKS[networkID].testnetID : networkID;
}

const initReadOnlyWeb3 = () => {
    const configChainID = getConfigChainID()
    const rpcURL = NETWORKS[configChainID]?.rpcURL
    console.log("rpcURL", rpcURL)
    if (!rpcURL) {
        console.error("No RPC URL for chain ID, can't initReadOnlyWeb3", configChainID)
        return undefined
    }
    return new Web3(new Web3.providers.HttpProvider(rpcURL))
}

export const readOnlyWeb3 = initReadOnlyWeb3()