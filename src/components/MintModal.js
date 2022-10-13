import React, { useContext, useImperativeHandle, useState } from "react";
import { Box, Dialog, DialogContent, DialogTitle, IconButton, Typography } from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';
import { QuantityModalStep } from './QuantityModalStep';
import { ConfirmTxStep } from "./ConfirmTxStep";
import { Web3Context } from "./Web3Context";

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
    // TODO: migrate to hooks and global state / Context
    // this is a hack
    const [state, setState] = useContext(Web3Context)
    const { wallet, chainID } = state

    const handleClose = () => {
        setIsOpen(false)
        setIsLoading(false)
    }

    useImperativeHandle(ref, () => ({
            setIsOpen, setQuantity
        })
    )

    return (
        <Dialog
            open={isOpen}
            onClose={handleClose}>
            {isLoading && <ConfirmTxStep
                wallet={wallet}
                chainID={chainID}
                txHash={txHash}
                quantity={quantity}
                setIsLoading={setIsLoading}
            />}
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
                        state={state}
                        setState={setState}
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
