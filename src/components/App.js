import React from "react";
import AutoHideAlert, {alertRef} from "./AutoHideAlert.js";
import MintModal, {modalRef} from "./MintModal.js";
import {ThemeProvider} from "@mui/material";
import {theme} from "../styles/theme.js";
import { Web3ContextProvider } from "./Web3Context";

export const App = () => {
    return <ThemeProvider theme={theme}>
        <Web3ContextProvider>
            <div>
                <AutoHideAlert ref={alertRef} />
                <MintModal ref={modalRef} />
            </div>
        </Web3ContextProvider>
    </ThemeProvider>
}
