import { useEffect, useState } from "react";

export const useIsTwitterConnected = () => {
    const [isTwitterConnected, setIsTwitterConnected] = useState(false)

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search)
        const connectedTwitter = urlParams.get('connected_twitter') === "true"
        if (connectedTwitter) {
            setIsTwitterConnected(true)
        }
    }, [])

    return isTwitterConnected
}