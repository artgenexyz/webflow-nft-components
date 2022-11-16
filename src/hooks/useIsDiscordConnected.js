import { useEffect, useState } from "react";

export const useIsDiscordConnected = () => {
    const [isDiscordConnected, setIsDiscordConnected] = useState(false)

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search)
        const connectedDiscord = urlParams.get('connected_discord') === "true"
        if (connectedDiscord) {
            setIsDiscordConnected(true)
        }
    }, [])

    return isDiscordConnected
}