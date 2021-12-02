import React from "react";
import {alertRef} from "./AutoHideAlert.js";
import {MintModal} from "./MintModal.js";
import AutoHideAlert from "./AutoHideAlert.js";
import {ThemeProvider} from "@mui/material";
import {theme} from "../styles/theme.js";

export const App = () => {
    return <ThemeProvider theme={theme}>
        <div>
            <AutoHideAlert ref={alertRef} />
            <MintModal />
        </div>
    </ThemeProvider>
}
