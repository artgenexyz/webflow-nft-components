import React, { useEffect, useImperativeHandle, useState } from "react";
import { Box, Dialog, DialogContent, DialogTitle, IconButton, Typography } from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';
import { QuantityModalStep } from './QuantityModalStep';
import { PaymentModalStep } from './PaymentModalStep';

const DialogTitleWithClose = ({ children, onClose }) => {
    return <DialogTitle>
        <Box sx={{ mr: 4 }}>{children}</Box>
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
    const [isOpen, setIsOpen] = useState(false);
    const [step, setStep] = useState(1)
    const [quantity, setQuantity] = useState(1);

    useEffect(() => {
        // TODO: Remove this after merging to main
        if (window.location.href.includes("ameegos.io")) {
            setStep(2)
        }
    }, [])

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
            <DialogTitleWithClose onClose={handleClose}>
                {step === 1 ? "Choose how many to mint" : "Pay with"}
            </DialogTitleWithClose>
            <DialogContent style={styles.mintModalContent}>
                {step === 1 && <QuantityModalStep setQuantity={setQuantity} setStep={setStep} />}
                {step === 2 && <PaymentModalStep quantity={quantity} />}
            </DialogContent>
        </Dialog>
    )
}

export const modalRef = React.createRef();

export const showMintModal = (quantity) => {
    modalRef.current?.setQuantity(quantity)
    modalRef.current?.setIsOpen(true);
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

export default React.forwardRef(MintModal);
