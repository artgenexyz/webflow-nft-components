import { updateMintButton } from "./ui.js";
import { updateConnectButton, updateMetamaskStatus } from "../wallet.js";
import { setContracts } from "../contract.js";

const init = async () => {
    await setContracts();
    await updateMetamaskStatus();
    updateConnectButton();
    updateMintButton();
}

init();
