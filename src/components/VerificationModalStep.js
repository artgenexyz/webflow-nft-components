import { Button, DialogContent, Typography } from "@mui/material";
import { DialogTitleWithClose } from "./MintModal";
import AwaitingButton, { LoadingState } from "./AwaitingButton";
import { getBaseURL } from "../constants";
import React, { useEffect, useState } from "react";
import { getIsDarkTheme } from "../styles/theme";
import { VerifyAPI } from "../services/VerifyAPI";
import { showAlert } from "./AutoHideAlert";
import { useIsDiscordConnected } from "../hooks/useIsDiscordConnected";
import { useIsTwitterConnected } from "../hooks/useIsTwitterConnected";
import { SignInWithEth } from "../services/SIWE";

export const VerificationModalStep = ({ onClose }) => {
    const [discordConnectState, setDiscordConnectState] = useState(LoadingState.NOT_STARTED)
    const [twitterConnectState, setTwitterConnectState] = useState(LoadingState.NOT_STARTED)
    const isDiscordConnected = useIsDiscordConnected()
    const isTwitterConnected = useIsTwitterConnected()

    useEffect(() => {
        if (isDiscordConnected) {
            setDiscordConnectState(LoadingState.SUCCESS)
        }
        if (isTwitterConnected) {
            setTwitterConnectState(LoadingState.SUCCESS)
        }
    }, [isDiscordConnected, isTwitterConnected])

    const submitAndSign = async () => {
        const { signature, encodedMessage, error: signError } = await SignInWithEth.signMessage()
        if (signError) {
            showAlert(`Ethereum sign-in error: ${signError.message}`, "error")
            return
        }
        console.log("signature", signature, encodedMessage)
        const { data, error } = await VerifyAPI.getMintSignature({
            signature,
            encodedMessage
        })
        if (error) {
            showAlert(`Mint verification error: ${error}`, "error")
            return
        }
        console.log("Returned in submitAndSign: ", data)
    }

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
                disabled={discordConnectState === LoadingState.SUCCESS}
                variant="contained"
                sx={{ mt: 2, borderRadius: "10px" }}
                loadingState={discordConnectState}
                setLoadingState={setDiscordConnectState}
                onClick={() => {
                    VerifyAPI.loginToDiscord().then(({ data, error }) => {
                        if (!data?.authUrl || error) {
                            showAlert(`Error connecting to Discord: ${error ?? "unknown error"}`, "error")
                        }
                        window.location.href = data.authUrl
                    })
                }}>
                {discordConnectState === LoadingState.SUCCESS ? <>
                    <img src={`${getBaseURL()}/images/checkmark${getIsDarkTheme() ? "-white" : "-black"}.svg`} style={{ width: 20, marginRight: 6 }} />
                    Discord connected
                </> : <>
                    <img src={`${getBaseURL()}/images/discord${getIsDarkTheme() ? "-white" : "-black"}.svg`} style={{ width: 20, marginRight: 6 }} />
                    Connect Discord
                </>}
            </AwaitingButton>
            <AwaitingButton
                color="grey"
                disabled={twitterConnectState === LoadingState.SUCCESS}
                variant="contained"
                sx={{ mt: 2, borderRadius: "10px" }}
                loadingState={twitterConnectState}
                setLoadingState={setTwitterConnectState}
                onClick={() => {
                    VerifyAPI.loginToTwitter().then(({ data, error }) => {
                        if (!data?.authUrl || error) {
                            showAlert(`Error connecting to Twitter: ${error ?? "unknown error"}`, "error")
                        }
                        window.location.href = data.authUrl
                    })
                }}>
                {twitterConnectState === LoadingState.SUCCESS ? <>
                    <img src={`${getBaseURL()}/images/checkmark${getIsDarkTheme() ? "-white" : "-black"}.svg`} style={{ width: 20, marginRight: 6 }} />
                    Twitter connected
                </> : <>
                    <img src={`${getBaseURL()}/images/twitter${getIsDarkTheme() ? "-white" : "-black"}.svg`} style={{ width: 20, marginRight: 6 }} />
                    Connect Twitter
                </>}
            </AwaitingButton>
            <Button
                disabled={!isDiscordConnected || !isTwitterConnected}
                variant="contained"
                sx={{ mt: "auto", borderRadius: "10px" }}
                onClick={submitAndSign}>
                Continue to mint
            </Button>
        </DialogContent>
    </>
}