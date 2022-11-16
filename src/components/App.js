import React, { useEffect } from "react";
import AutoHideAlert, {alertRef} from "./AutoHideAlert.js";
import MintModal, { modalRef, showMintModal } from "./MintModal.js";
import {ThemeProvider} from "@mui/material";
import {theme} from "../styles/theme.js";
import JoinWhitelistModal, { joinWhitelistRef } from './JoinWhitelistModal';
import { useIsDiscordConnected } from "../hooks/useIsDiscordConnected";
import { useIsTwitterConnected } from "../hooks/useIsTwitterConnected";

export const App = () => {
    const isDiscordConnected = useIsDiscordConnected()
    const isTwitterConnected = useIsTwitterConnected()

    useEffect(() => {
        if (isDiscordConnected || isTwitterConnected) {
            showMintModal()
        }
    }, [isDiscordConnected, isTwitterConnected])

    return <ThemeProvider theme={theme}>
        <div>
            <AutoHideAlert ref={alertRef} />
            <MintModal ref={modalRef} />
            <JoinWhitelistModal ref={joinWhitelistRef} />
        </div>
    </ThemeProvider>
}
