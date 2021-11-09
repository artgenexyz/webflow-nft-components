const {
    Snackbar,
    Alert
} = MaterialUI;

const alertRef = React.createRef();

const createDOMElement = () => {
    const body = document.getElementsByTagName('body')[0];
    const div = Object.assign(document.createElement('div'), {
        id: "root",
    });
    body.appendChild(div);
    return div;
}

const AutoHideAlert = (props, ref) => {
    const [isOpen, setIsOpen] = React.useState(false);
    const [text, setText] = React.useState("");
    const [type, setType] = React.useState("success");

    React.useImperativeHandle(ref, () => ({
            setIsOpen, setText, setType
        })
    )

    const alert = React.createElement(Alert, {
        severity: type,
        style: styles
    }, text)
    return React.createElement(Snackbar, {
            open: isOpen,
            autoHideDuration: 6000,
            onClose: (event, reason) => {
                if (reason === 'clickaway') {
                    return;
                }
                setIsOpen(false);
            }
        }, alert
    )
}


export const renderAlertContainer = () => {
    const elem = createDOMElement();
    ReactDOM.render(
        React.createElement(React.forwardRef(AutoHideAlert), {
            ref: alertRef
        }),
        elem
    )
}

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
