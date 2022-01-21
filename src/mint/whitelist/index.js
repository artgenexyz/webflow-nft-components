import {
    updateJoinWhitelistButton,
    updateMintWhitelistButton,
    updateWhitelistSpotsLeft
} from './ui';

export const initWhitelist = async () => {
    updateJoinWhitelistButton()
    updateMintWhitelistButton()
    updateWhitelistSpotsLeft()
}

initWhitelist()
