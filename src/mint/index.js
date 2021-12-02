import {updateMintButton, updateMintByTierButtons} from "./ui.js";
import { updateConnectButton, updateWalletStatus } from "../wallet.js";
import { setContracts } from "../contract.js";
import {renderAppContainer} from "../index.js";

export const init = async () => {
    renderAppContainer();
    await updateWalletStatus();
    await setContracts();
    updateConnectButton();
    updateMintButton();
    updateMintByTierButtons();
}

init();
