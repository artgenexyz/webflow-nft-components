import { Button, DialogContent, Typography } from "@mui/material";
import { DialogTitleWithClose } from "./MintModal";
import AwaitingButton, { LoadingState } from "./AwaitingButton";
import { getBaseURL } from "../constants";
import React, { useEffect, useState } from "react";
import { getIsDarkTheme } from "../styles/theme";
import { VerifyAPI } from "../services/VerifyAPI";
import { showAlert } from "./AutoHideAlert";
import { useIsDiscordConnected } from "../hooks/useIsDiscordConnected";

export const VerificationModalStep = ({ onClose }) => {
    const [discordConnectState, setDiscordConnectState] = useState(LoadingState.NOT_STARTED)
    const [twitterConnectState, setTwitterConnectState] = useState(LoadingState.NOT_STARTED)
    const isDiscordConnected = useIsDiscordConnected()

    useEffect(() => {
        if (isDiscordConnected) {
            setDiscordConnectState(LoadingState.SUCCESS)
        }
    }, [isDiscordConnected])

    return <>
        <DialogTitleWithClose onClose={onClose}>
            <Typography variant="h1">Connect profiles to mint</Typography>
            <Typography variant="subtitle2" sx={{ mt: 2 }}>Connect your Twitter and Discord to mint</Typography>
        </DialogTitleWithClose>
        <DialogContent sx={{
            mt: 0,
            display: "flex",
            flexDirection: "column",
            textAlign: "center",
            height: 200,
        }}>
            <AwaitingButton
                color="grey"
                variant="contained"
                sx={{ mt: 2, borderRadius: "10px" }}
                loadingState={discordConnectState}
                setLoadingState={setDiscordConnectState}
                onClick={() => {
                    if (isDiscordConnected)
                        return
                    VerifyAPI.loginToDiscord().then(({ data, error }) => {
                        if (!data?.authUrl || error) {
                            showAlert(`Error connecting to Discord: ${error ?? "unknown error"}`, "error")
                        }
                        window.location.href = data.authUrl
                    })
                }}>
                {discordConnectState === LoadingState.SUCCESS ? <>
                    <img src={`${getBaseURL()}/images/checkmark${getIsDarkTheme ? "-black" : "-white"}.svg`} style={{ width: 20, marginRight: 6 }} />
                    Discord connected
                </> : <>
                    <img src={`${getBaseURL()}/images/discord${getIsDarkTheme ? "-black" : "-white"}.svg`} style={{ width: 20, marginRight: 6 }} />
                    Connect Discord
                </>}
            </AwaitingButton>
            <AwaitingButton
                color="grey"
                variant="contained"
                sx={{ mt: 2, borderRadius: "10px" }}>
                <img src={`${getBaseURL()}/images/twitter${getIsDarkTheme ? "-black" : "-white"}.svg`} style={{ width: 20, marginRight: 6 }} /> Connect Twitter
            </AwaitingButton>
            <Button
                disabled={true}
                variant="contained"
                sx={{ mt: "auto", borderRadius: "10px" }}>
                Continue to mint
            </Button>
        </DialogContent>
    </>
}