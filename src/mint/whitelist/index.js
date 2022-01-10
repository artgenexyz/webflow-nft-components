import {
    updateJoinWhitelistButton,
    updateMintWhitelistButton,
    updateWhitelistSpotsLeft
} from './ui';

export const initWhitelist = async () => {
    updateJoinWhitelistButton()
    updateMintWhitelistButton()
    setInterval(() => {
        updateWhitelistSpotsLeft()
    }, 3000)
}

initWhitelist()
