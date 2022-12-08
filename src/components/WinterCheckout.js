import { useEffect } from "react";
import { WinterCheckout } from '@usewinter/checkout';
import { isEthereumContract, isTestnet } from "../contract";
import { getConfigChainID } from "../web3";

const getWinterProjectID = (project) => {
    if (!project) {
        return undefined
    }
    const configChainID = getConfigChainID()
    return isTestnet(configChainID) ? project?.winter_project_id_testnet : project?.winter_project_id
}

export const isWinterCheckoutEnabled = (project, launchType) => {
    const isEnabled = !!project?.winter_enabled || project?.winter_enabled === null
    return isEnabled && getWinterProjectID(project) && isEthereumContract() && launchType !== "whitelist"
}

export const WinterModal = ({ project, mintQuantity, showWinter, setShowWinter, onClose }) => {
    const configChainID = getConfigChainID()
    const winterProjectID = getWinterProjectID(project)

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
                onClose={() => {
                    if (onClose) onClose()
                    setShowWinter(false)
                }}
                extraMintParams={{ data: '0x' }}
                mintQuantity={mintQuantity}
    />
}

export default WinterModal