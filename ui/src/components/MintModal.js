import React, {useState} from "react";
import {Dialog, DialogContent, DialogTitle, IconButton, Typography} from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';

const DialogTitleWithClose = ({ children, onClose }) => {
    return <DialogTitle>
        {children}
        {onClose ? (
            <IconButton
                aria-label="close"
                onClick={onClose}
                sx={{
                    position: 'absolute',
                    right: 8,
                    top: 8,
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
        image_url: ""
    }, {
        title: "MATIC",
        subtitle: "Via Polygon",
        fee: "",
        image_url: ""
    }]
    return <DialogContent>
        {props.children}
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
