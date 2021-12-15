import { updateMintWhitelistButton } from './ui';

export let WHITELIST;
export let MERKLE_PROOF;

export const initWhitelist = async () => {
    WHITELIST = await fetch(window.WHITELIST_URL).then(r => r.json())
    updateMintWhitelistButton()
}

initWhitelist()
