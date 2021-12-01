import React, {useImperativeHandle, useState} from "react";
import {Alert, Snackbar} from "@mui/material";


const AutoHideAlert = (props, ref) => {
    const [isOpen, setIsOpen] = useState(false);
    const [text, setText] = useState("");
    const [type, setType] = useState("success");

    useImperativeHandle(ref, () => ({
            setIsOpen, setText, setType
        })
    )
    return (
        <Snackbar
            open={isOpen}
            autoHideDuration={10000}
            onClose={(event, reason) => {
                if (reason === 'clickaway') {
                    return;
                }
                setIsOpen(false);
            }}>
            <Alert
                severity={type}
                style={styles}>
                {text}
            </Alert>
        </Snackbar>
    )
}

export const alertRef = React.createRef();

export const showAlert = (text, type) => {
    alertRef.current?.setText(text);
    alertRef.current?.setType(type);
    alertRef.current?.setIsOpen(true);
}

const styles = {
    position: "fixed",
    top: "32px",
    left: "32px",
    zIndex: 1000
}

export default React.forwardRef(AutoHideAlert);
