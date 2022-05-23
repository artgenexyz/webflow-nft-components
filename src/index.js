import React from 'react';
import { render } from "react-dom";
import { App } from "./components/App.js";
import "./styles/index.css";
import { showAlert } from "./components/AutoHideAlert.js";
import { showMintModal } from "./components/MintModal.js";
import { showJoinWhitelistModal } from './components/JoinWhitelistModal';
import { init } from "./mint";
import { initWhitelist } from './mint/whitelist';
import { dirtyFixConnectWalletUI } from "./utils";

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
document.addEventListener("DOMContentLoaded", () => {
    init()
    initWhitelist()

    // TODO: remove this when migrated to @buildship/web3-login or forked Web3Modal
    // Puts "custom-metamask" provider as the first option
    dirtyFixConnectWalletUI()
});

export { showAlert, showMintModal, showJoinWhitelistModal, renderAppContainer };
