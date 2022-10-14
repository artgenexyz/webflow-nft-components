import Web3 from "web3";
import { NETWORKS } from "./constants";
import { toHex } from "./utils";
import { isWeb3Initialized, provider, web3 } from "./wallet";

export const getConfigChainID = () => {
    // Default to Ethereum
    const networkID = window.NETWORK_ID ?? 1;
    return window.IS_TESTNET ? NETWORKS[networkID].testnetID : networkID;
}

export const isCorrectNetwork = (provider) => {
    if (!provider?.chainId) {
        return null
    }
    const isHex = String(provider?.chainId)?.startsWith("0x")
    const configChain = isHex ? toHex(getConfigChainID()) : getConfigChainID()
    return String(configChain) === String(provider?.chainId)
}

export const getWeb3Instance = () =>
    isWeb3Initialized() ? (
        isCorrectNetwork(provider) ? web3 : readOnlyWeb3
    ) : readOnlyWeb3

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