import { updateMintButton, updateMintByTierButtons, updateMintedCounter } from "./ui.js";
import { updateConnectButton, updateWalletStatus } from "../wallet.js";
import { setContracts } from "../contract.js";
import { setupAnalytics } from "../analytics.js";

export const init = async () => {
    setupAnalytics();

    await updateWalletStatus();
    await setContracts();
    updateConnectButton();
    updateMintedCounter();
    updateMintButton();
    updateMintByTierButtons();
}

init();
