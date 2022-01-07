import React, { useEffect, useImperativeHandle, useState } from "react";
import { Box, CircularProgress, Dialog, Typography } from "@mui/material";
import { getWalletAddressOrConnect } from '../wallet';
import { BUILDSHIP_API_BASE } from '../constants';
import { showAlert } from '../index';

export const JoinWhitelistModal = (props, ref) => {
    const [isOpen, setIsOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [whitelistStatus, setWhitelistStatus] = useState(undefined)
    const [walletAddress, setWalletAddress] = useState(undefined)

    const addToWhitelist = (address) => {
        return fetch(`${BUILDSHIP_API_BASE}/extensions/whitelist/${window.WHITELIST_ID}/add`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ address })
        }).then(r => r.json())
    }

    const renderLoading = () => (
        <>
        <CircularProgress />
        <Typography sx={{mt: 3}} variant="subtitle1">
            Whitelisting ⏳
        </Typography>
        </>
    )

    const getEmoji = () => {
        return whitelistStatus === "joined" ? "✅" : (
            whitelistStatus === "already_added" ? "👌" : "❌"
        )
    }

    const getMessage = () => (
        <>
            {whitelistStatus === "joined" && <>Joined the whitelist with {walletAddress}</>}
            {whitelistStatus === "already_added" && <>You're already in the whitelist</>}
            {whitelistStatus === "full" && <>Whitelist is already full</>}
            {whitelistStatus === "error" && <>Error adding to whitelist</>}
        </>
    )

    useEffect(() => {
        if (isOpen && !walletAddress) {
            getWalletAddressOrConnect(true)
                .then((address) => {
                    setIsLoading(true)
                    setWalletAddress(address)
                    return addToWhitelist(address)
                })
                .then(({ error }) => {
                    setIsLoading(false)
                    if (error?.message?.includes("Whitelist is full")) {
                        setWhitelistStatus("full")
                        return
                    }
                    if (error?.message?.includes("This address is already whitelisted")) {
                        setWhitelistStatus("already_added")
                        return
                    }
                    if (error) {
                        showAlert(error.message, "error")
                        setWhitelistStatus("error")
                        return
                    }
                    setWhitelistStatus("joined")
                })
        }
    }, [isOpen, walletAddress])

    const handleClose = () => {
        setIsOpen(false)
    }

    useImperativeHandle(ref, () => ({
            setIsOpen
        })
    )

    return (
        <Dialog
            open={isOpen}
            onClose={handleClose}>
            <Box sx={styles.modalContent}>
                {isLoading && renderLoading()}
                {whitelistStatus && <>
                    <span style={{
                        fontSize: 60,
                        lineHeight: 1,
                        margin: 0
                    }}>
                        {getEmoji()}
                    </span>
                    <Typography sx={{mt: 3}} variant="subtitle1">
                        {getMessage()}
                    </Typography>
                </>}
                </Box>
        </Dialog>
    )
}

export const joinWhitelistRef = React.createRef();

export const showJoinWhitelistModal = () => {
    joinWhitelistRef.current?.setIsOpen(true);
}

const styles = {
    modalContent: {
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        width: 300,
        height: 300,
        maxWidth: "50vw"
    }
}

export default React.forwardRef(JoinWhitelistModal);
