import { createContext, useEffect, useState } from "react";
import { currentAddress, getWalletAddressOrConnect, provider, web3 } from "../wallet";
import { useWeb3 } from "../hooks/useWeb3";

const defaultContext = {
    wallet: undefined,
    chainID: undefined,
}

export const Web3Context = createContext([defaultContext, () => defaultContext]);

export const Web3ContextProvider = (props) => {
    const [state, setState] = useState(defaultContext)
    const [web3, provider] = useWeb3([state.wallet, state.chainID])

    useEffect(() => {
        if (!provider)
            return

        // if (provider.chainId) {
        //     currentAddress().then((address) => {
        //         setState({
        //             ...state,
        //             wallet: address,
        //             chainID: provider.chainId
        //                 ? Number(String(provider.chainId).replace("0x", ""))
        //                 : undefined
        //         })
        //     })
        // }

        provider.on("chainChanged", (chainId) => {
            console.log("chainChanged", chainId)
            setState({
                ...state,
                chainID: Number(String(provider.chainId).replace("0x", ""))
            })
        })
    }, [provider])

    return <Web3Context.Provider value={[state, setState]}>
        {props.children}
    </Web3Context.Provider>
}