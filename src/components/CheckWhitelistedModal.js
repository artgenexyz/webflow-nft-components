import React, { useEffect, useImperativeHandle, useState } from "react";
import { Box, CircularProgress, Dialog, Typography } from "@mui/material";
import { getWalletAddressOrConnect } from '../wallet';
import { BUILDSHIP_API_BASE } from '../constants';
import { showAlert } from '../index';

export const CheckWhitelistedModal = (props, ref) => {
    const [isOpen, setIsOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const [whitelistStatus, setWhitelistStatus] = useState(undefined)
    const [walletAddress, setWalletAddress] = useState(undefined)

    const checkWhitelistEligibility = (address) => {
        return fetch(`${BUILDSHIP_API_BASE}/extensions/whitelist/${window.JOIN_WHITELIST_ID}/check/${address}`, {
            method: "GET"
        }).then(async r => ({ status: r.status, ...(await r.json()) }))
    }

    const renderLoading = () => (
        <>
        <CircularProgress />
        <Typography sx={{mt: 3}} variant="subtitle1">
            Checking eligibility ⏳
        </Typography>
        </>
    )

    const getEmoji = () => {
        return whitelistStatus === "joined" ? "✅" : (
            whitelistStatus === "not_joined" ? "🛑" : "❌"
        )
    }

    const getMessage = () => (
        <>
            {whitelistStatus === "joined" && <>Wallet {walletAddress.slice(0, 6)}... is in the presale list</>}
            {whitelistStatus === "not_joined" && <>Wallet {walletAddress.slice(0, 6)}... is not in the presale list</>}
            {whitelistStatus === "error" && <>Error checking presale eligibility</>}
        </>
    )

    useEffect(() => {
        if (isOpen && !walletAddress) {
            getWalletAddressOrConnect(false)
                .then((_address) => {
                    let address = _address
                    if (address === undefined) {
                        address = prompt("Failed to read your wallet address. Please enter it manually to check eligibilty", undefined)
                    }
                    setIsLoading(true)
                    setWalletAddress(address)
                    return checkWhitelistEligibility(address)
                })
                .then(({ status, error, message }) => {
                    setIsLoading(false)
                    if (status === 200 && message?.includes("This address is whitelisted")) {
                        setWhitelistStatus("joined")
                        return
                    }
                    if (error?.includes("This address is not whitelisted")) {
                        setWhitelistStatus("not_joined")
                        return
                    }
                    if (error) {
                        showAlert(error, "error")
                        setWhitelistStatus("error")
                    }
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
                        fontSize: 66,
                        lineHeight: 1,
                        margin: 0
                    }}>
                        {getEmoji()}
                    </span>
                    <Typography sx={{
                        mt: 3,
                        textAlign: "center"
                    }} variant="subtitle1">
                        {getMessage()}
                    </Typography>
                </>}
                </Box>
        </Dialog>
    )
}

export const checkWhitelistedModalRef = React.createRef();

export const showCheckWhitelistModal = () => {
    checkWhitelistedModalRef.current?.setIsOpen(true);
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

export default React.forwardRef(CheckWhitelistedModal);
