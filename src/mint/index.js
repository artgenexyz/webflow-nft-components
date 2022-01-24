import { updateMintButton, updateMintByTierButtons, updateMintedCounter } from "./ui.js";
import { updateConnectButton, updateWalletStatus } from "../wallet.js";
import { setContracts } from "../contract.js";
import { setupAnalytics } from "../analytics.js";

export const init = async () => {
    setupAnalytics();

    await updateWalletStatus();
    updateConnectButton();
    if (!window.DISABLE_MINT) {
        await setContracts();
        updateMintedCounter();
        updateMintButton();
        updateMintByTierButtons();
    } else {
        console.log("MINT DISABLED")
    }
}

