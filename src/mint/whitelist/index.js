import { updateJoinWhitelistButton, updateMintWhitelistButton } from './ui';

export let WHITELIST;

export const initWhitelist = async () => {
    WHITELIST = await fetch(window.WHITELIST_URL).then(r => r.json())
    updateJoinWhitelistButton()
    updateMintWhitelistButton()
}

initWhitelist()
