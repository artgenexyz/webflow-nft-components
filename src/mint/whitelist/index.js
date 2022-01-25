import {
    updateCheckWhitelistButton,
    updateJoinWhitelistButton,
    updateMintWhitelistButton,
    updateWhitelistSpotsLeft
} from './ui';

export const initWhitelist = async () => {
    updateJoinWhitelistButton()
    updateCheckWhitelistButton()
    if (!window.DISABLE_MINT) {
        updateMintWhitelistButton()
    } else {
        console.log("MINT DISABLED")
    }
    updateWhitelistSpotsLeft()
}
