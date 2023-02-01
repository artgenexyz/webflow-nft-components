import { useEffect, useState } from "react";
import API from "../services/API";

export const useEmbed = () => {
    const [embed, setEmbed] = useState()
    const id = window.EMBED_ID

    useEffect(() => {
        if (id) {
            API.getEmbedInfo(id).then(({ data, error }) => {
                if (error) {
                    console.error("Error fetching embed info", error)
                    return
                }
                setEmbed(data)
            })
        }
    }, [id])

    return embed
}