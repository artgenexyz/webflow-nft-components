import * as React from 'react';
import ReactDOM from 'react-dom';
import Alert from '@mui/material/Alert';

export const renderErrorAlert = (text) => (
    ReactDOM.render(
        <Alert severity="error">{text}</Alert>,
        document.getElementsByTagName('body')[0]
    )
)

export const renderSuccessAlert = (text) => (
    ReactDOM.render(
        <Alert severity="success">{text}</Alert>,
        document.getElementsByTagName('body')[0]
    )
)
