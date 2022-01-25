import {
    updateJoinWhitelistButton,
    updateMintWhitelistButton,
    updateWhitelistSpotsLeft
} from './ui';

export const initWhitelist = async () => {
    updateJoinWhitelistButton()
    if (!window.DISABLE_MINT) {
        updateMintWhitelistButton()
    } else {
        console.log("MINT DISABLED")
    }
    updateWhitelistSpotsLeft()
}
