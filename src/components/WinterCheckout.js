import { useEffect, useState } from "react";
import { WinterCheckout } from '@usewinter/checkout';
import { getConfigChainID, isEthereumContract } from "../contract";

export const isWinterCheckoutEnabled = (launchType) => {
    return !!window.WINTER_PROJECT_ID && isEthereumContract() && launchType !== "whitelist"
}

export const WinterModal = ({ mintQuantity, showWinter, setShowWinter }) => {
    const winterProjectID = window.WINTER_PROJECT_ID
    const configChainID = getConfigChainID()

    const handleWindowEvent = (event) => {
        if (event.data.name === "closeWinterCheckoutModal") {
            setShowWinter(false)
        } else if (event.data.name === 'successfulWinterCheckout') {
            if (window.DEFAULTS?.redirectURL) {
                setTimeout(() => {
                    window.location.href = window.DEFAULTS?.redirectURL
                }, 800)
            }
        }
    }

    useEffect(() => {
        window.addEventListener("message", handleWindowEvent)
        return () => window.removeEventListener("message", handleWindowEvent)
    }, [])

    return <WinterCheckout
                projectId={winterProjectID}
                production={configChainID === 1 || configChainID === 137}
                showModal={showWinter}
                testnet={configChainID === 5 ? 'goerli' : 'rinkeby'}
                onClose={() => setShowWinter(false)}
                extraMintParams={{ data: '0x' }}
                mintQuantity={mintQuantity}
    />
}

export default WinterModal