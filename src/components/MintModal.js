import React, { useImperativeHandle, useState } from "react";
import { Box, CircularProgress, Dialog, DialogContent, DialogTitle, IconButton, Typography } from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';
import { QuantityModalStep } from './QuantityModalStep';
import { isMobile } from "../utils";

const DialogTitleWithClose = ({ children, onClose }) => {
    return <DialogTitle>
        <Box sx={{ textAlign: "center" }}>
            {children}
        </Box>
        {onClose ? (
            <IconButton
                aria-label="close"
                onClick={onClose}
                sx={{
                    position: 'absolute',
                    right: 16,
                    top: 16,
                    ml: 4,
                    color: (theme) => theme.palette.grey[500],
                }}
            >
            <CloseIcon />
        </IconButton>) : null}
    </DialogTitle>
}

export const MintModal = (props, ref) => {
    const [isOpen, setIsOpen] = useState(false)
    const [txHash, setTxHash] = useState(undefined)
    const [isLoading, setIsLoading] = useState(false)
    const [step, setStep] = useState(1)
    const [quantity, setQuantity] = useState(1)

    const handleClose = () => {
        setIsOpen(false);
    }

    useImperativeHandle(ref, () => ({
            setIsOpen, setQuantity
        })
    )

    return (
        <Dialog
            open={isOpen}
            onClose={handleClose}>
            {isLoading &&
                <Box sx={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    width: 300,
                    height: 300,
                }}>
                    {txHash ? <CircularProgress /> : <span style={{
                        fontSize: 60,
                        lineHeight: 1,
                        margin: 0
                    }}>
                        👀
                    </span>}
                    <Typography
                        sx={{ mt: 3, textAlign: "center" }}
                        variant="h4">
                        {txHash
                            ? `Minting ${quantity} NFT...`
                            : 'Confirm the transaction in your wallet'}
                    </Typography>
                    {!txHash && <Typography sx={{
                        mt: 3,
                        pl: 3,
                        pr: 3,
                        color: "#757575",
                        textAlign: "center"
                    }} variant="subtitle2">
                        Wait up to 2-3 sec until the transaction appears in your wallet
                        <br/><br/>
                        {!isMobile() && "If you don't see the Confirm button, scroll down ⬇️"}</Typography>}
                </Box>
            }
            {!isLoading && <>
            <DialogTitleWithClose onClose={handleClose}>
                <Typography variant="h1">Mint now</Typography>
            </DialogTitleWithClose>
            <DialogContent className="mintModal-content">
                {step === 1 && <QuantityModalStep
                    setTxHash={setTxHash}
                    setQuantity={setQuantity}
                    setStep={setStep}
                    setIsLoading={setIsLoading}
                />}
            </DialogContent>
            </>}
        </Dialog>
    )
}

export const modalRef = React.createRef();

export const showMintModal = (quantity) => {
    if (quantity) {
        modalRef.current?.setQuantity(quantity)
    }
    modalRef.current?.setIsOpen(true);
}

const styles = {
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

export default React.forwardRef(MintModal);
