import {
    updateCheckWhitelistButton,
    updateJoinWhitelistButton,
    updateMintWhitelistButton,
    updateWhitelistSpotsLeft
} from './ui';

export const initWhitelist = async () => {
    updateJoinWhitelistButton()
    updateCheckWhitelistButton()
    updateWhitelistSpotsLeft()
    if (!window.DISABLE_MINT) {
        updateMintWhitelistButton()
    } else {
        console.log("MINT DISABLED")
    }
}
