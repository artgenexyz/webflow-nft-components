import { Box, Button, DialogContent, Typography } from "@mui/material";
import { DialogTitleWithClose } from "./MintModal";
import AwaitingButton from "./AwaitingButton";
import { getBaseURL } from "../constants";
import React from "react";
import { getIsDarkTheme } from "../styles/theme";

export const VerificationModalStep = ({ onClose }) => {
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
                sx={{ mt: 2, borderRadius: "10px" }}>
                <img src={`${getBaseURL()}/images/discord${getIsDarkTheme ? "-black" : "-white"}.svg`} style={{ width: 20, marginRight: 8 }} /> Connect Discord
            </AwaitingButton>
            <AwaitingButton
                color="grey"
                variant="contained"
                sx={{ mt: 2, borderRadius: "10px" }}>
                <img src={`${getBaseURL()}/images/twitter${getIsDarkTheme ? "-black" : "-white"}.svg`} style={{ width: 20, marginRight: 8 }} /> Connect Twitter
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