import { useEffect, useState } from "react";
import { showMintModal } from "../components/MintModal";

export const useIsDiscordConnected = () => {
    const [isDiscordConnected, setIsDiscordConnected] = useState(false)

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search)
        const connectedDiscord = urlParams.get('connect_discord') === "true"
        if (connectedDiscord) {
            setIsDiscordConnected(true)
            showMintModal()
        }
    }, [])

    return isDiscordConnected
}