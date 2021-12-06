import {updateMintButton, updateMintByTierButtons} from "./ui.js";
import { updateConnectButton, updateWalletStatus } from "../wallet.js";
import { setContracts } from "../contract.js";

export const init = async () => {
    await updateWalletStatus();
    await setContracts();
    updateConnectButton();
    updateMintButton();
    updateMintByTierButtons();
}

init();
