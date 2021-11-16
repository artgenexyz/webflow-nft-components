import {updateMintButton, updateMintByTierButtons} from "./ui.js";
import { updateConnectButton, updateWalletStatus } from "../wallet.js";
import { setContracts } from "../contract.js";
import { renderAlertContainer } from "../ui/alerts.js";

const init = async () => {
    renderAlertContainer();
    await updateWalletStatus();
    await setContracts();
    updateConnectButton();
    updateMintButton();
    updateMintByTierButtons();
}

init();
