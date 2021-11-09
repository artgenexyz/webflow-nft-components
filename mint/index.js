import { updateMintButton } from "./ui.js";
import { updateConnectButton, updateMetamaskStatus } from "../wallet.js";
import { setContracts } from "../contract.js";
import { renderAlertContainer } from "../ui/alerts.js";

const init = async () => {
    renderAlertContainer();
    await setContracts();
    await updateMetamaskStatus();
    updateConnectButton();
    updateMintButton();
}

init();
