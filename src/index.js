import React from 'react';
import { render } from "react-dom";
import { App } from "./components/App.js";
import "./styles/index.css";
import { showAlert } from "./components/AutoHideAlert.js";
import { showMintModal } from "./components/MintModal.js";
import { showJoinWhitelistModal } from './components/JoinWhitelistModal';
import { init } from "./mint";
import { initWhitelist } from './mint/whitelist';

const createDOMElement = () => {
    const body = document.getElementsByTagName('body')[0];
    const div = Object.assign(document.createElement('div'), {
        id: "root",
    });
    body.appendChild(div);
    return div;
}

const renderAppContainer = () => {
    render(<App />, createDOMElement());
}

renderAppContainer();
init();
initWhitelist();

export { showAlert, showMintModal, showJoinWhitelistModal, renderAppContainer };
