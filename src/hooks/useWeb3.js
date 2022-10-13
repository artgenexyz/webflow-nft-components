import { useEffect, useState } from "react";
import { provider, web3 } from "../wallet";

export const useWeb3 = (dependencies) => {
    const [state, setState] = useState([])

    useEffect(() => {
        if (!provider)
            return
        setState([web3, provider])
    }, [...dependencies, web3, provider])

    return state
}