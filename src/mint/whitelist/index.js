import {
    updateCheckWhitelistButton,
    updateJoinWhitelistButton,
    updateMintWhitelistButton,
    updateWhitelistSpotsLeft
} from './ui';

export const initWhitelist = async () => {
    updateJoinWhitelistButton()
    updateMintWhitelistButton()
    updateCheckWhitelistButton()
    updateWhitelistSpotsLeft()
}

initWhitelist()
