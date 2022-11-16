import React from "react";
import AutoHideAlert, {alertRef} from "./AutoHideAlert.js";
import MintModal, { modalRef } from "./MintModal.js";
import {ThemeProvider} from "@mui/material";
import {theme} from "../styles/theme.js";
import JoinWhitelistModal, { joinWhitelistRef } from './JoinWhitelistModal';
import { useIsDiscordConnected } from "../hooks/useIsDiscordConnected";

export const App = () => {
    const connectedDiscord = useIsDiscordConnected()

    return <ThemeProvider theme={theme}>
        <div>
            <AutoHideAlert ref={alertRef} />
            <MintModal ref={modalRef} />
            <JoinWhitelistModal ref={joinWhitelistRef} />
        </div>
    </ThemeProvider>
}
