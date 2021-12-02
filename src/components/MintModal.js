import React, {useState} from "react";
import {Box, Dialog, DialogContent, DialogTitle, IconButton, Typography} from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';
import { parseTxError } from "../utils.js";
import { showAlert } from "./AutoHideAlert.js";
import { mint } from "../mint/web3.js";
import { mintViaWebill } from "../mint/bridge.js";

const DialogTitleWithClose = ({ children, onClose }) => {
    return <DialogTitle>
        {children}
        {onClose ? (
            <IconButton
                aria-label="close"
                onClick={onClose}
                sx={{
                    position: 'absolute',
                    right: 16,
                    top: 16,
                    color: (theme) => theme.palette.grey[500],
                }}
            >
            <CloseIcon />
        </IconButton>) : null}
    </DialogTitle>
}

const MintModalContent = (props) => {
    const paymentOptions = [{
        title: "ETH",
        subtitle: "Via Webill",
        fee: "1% fee",
        image: "images/eth-logo.svg",
        onClick: async () => {
            await mintViaWebill(1)
        }
    }, {
        title: "MATIC",
        subtitle: "Via Polygon",
        fee: "",
        image: "images/polygon-logo.svg",
        onClick: async () => {
            await mint(1).then((r) => {
                console.log(r);
                showAlert(`Successfully minted ${1} NFTs`, "success")
            }).catch((e) => {
                const { code, message } = parseTxError(e);
                if (code !== 4001) {
                    showAlert(`Minting error: ${message}. Please try again or contact us`, "error");
                }
            })
        }
    }]
    return <DialogContent style={styles.mintModalContent}>
        {paymentOptions.map((option) =>
            <Box sx={styles.mintOption} onClick={option.onClick}>
                <img width="128" src={option.image} />
                <Typography sx={{ mt: 2 }} variant="h6">{option.title}</Typography>
                <Typography variant="subtitle2">{option.subtitle}</Typography>
                <Typography variant="subtitle2">{option.fee}</Typography>
            </Box>
        )}
    </DialogContent>
}

export const MintModal = (props, ref) => {
    const [isOpen, setIsOpen] = useState(true);
    const handleClose = () => {
        setIsOpen(false);
    }

    return (
        <Dialog
            open={isOpen}
            onClose={handleClose}>
            <DialogTitleWithClose onClose={handleClose}>
                <Typography variant="h4">Pay with</Typography>
            </DialogTitleWithClose>
            <MintModalContent />
        </Dialog>
    )
}

const styles = {
    mintModalContent: {
        paddingTop: "8px",
        display: "flex",
        flexWrap: "wrap",
        flexDirection: "row"
    },
    mintOption: {
        padding: "16px",
        marginLeft: "12px",
        marginRight: "12px",
        textAlign: "center",

        ":hover": {
            cursor: "pointer",
            backgroundColor: "rgba(0, 0, 0, 0.04)",
            borderRadius: "16px"
        }
    },
}
