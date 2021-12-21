import { updateMintButton, updateMintByTierButtons, updateMintedCounter } from "./ui.js";
import { updateConnectButton, updateWalletStatus } from "../wallet.js";
import { setContracts } from "../contract.js";

export const init = async () => {
    await updateWalletStatus();
    await setContracts();
    updateConnectButton();
    updateMintedCounter();
    updateMintButton();
    updateMintByTierButtons();
}

init();
