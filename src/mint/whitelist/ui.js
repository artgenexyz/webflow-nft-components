import { setButtonText } from '../ui';
import { showAlert } from '../../components/AutoHideAlert';
import { parseTxError } from '../../utils';
import { mint } from './web3';
import { showJoinWhitelistModal } from '../../components/JoinWhitelistModal';
import { BUILDSHIP_API_BASE } from '../../constants';
import { sendEvent } from '../../analytics';

export const updateMintWhitelistButton = () => {
    const mintButton = document.querySelector('#mint-whitelist') ??
        document.querySelector("a[href*='#mint-whitelist']")
    if (mintButton) {
        mintButton.onclick = async () => {
            const initialBtnText = mintButton.textContent;
            setButtonText(mintButton, "Loading...")

            sendEvent(window.analytics, 'whitelist-mint-button-click', {})

            await mint(1).then((r) => {
                setButtonText(mintButton, initialBtnText);
                console.log(r);
                showAlert(`Successfully minted 1 NFTs`, "success")

                sendEvent(window.analytics, 'whitelist-mint-success', {})

            }).catch((e) => {
                console.log(e)
                setButtonText(mintButton, initialBtnText);
                const { code, message } = parseTxError(e);

                if (code !== 4001) {
                    showAlert(`Minting error: ${message}. Please try again or contact us`, "error");
                    sendEvent(window.analytics, 'whitelist-mint-error', { error: message })
                } else {
                    sendEvent(window.analytics, 'whitelist-mint-rejected', { error: message })
                }

            })
        }
    }
}

export const updateJoinWhitelistButton = () => {
    const joinButtons = document.querySelectorAll('#join-whitelist') ??
        document.querySelectorAll("a[href*='#join-whitelist']")
    if (window.JOIN_WHITELIST_ID) {
        joinButtons.forEach((button) => {
            button.onclick = async () => {
                showJoinWhitelistModal()
            }
        })
    }
}

export const updateWhitelistSpotsLeft = async () => {
    const spotsLeftElement = document.querySelector('#spots-left-whitelist')
    if (spotsLeftElement) {
        const spotsLeft = await fetchSpotsLeft()
        console.log("SPOTS LEFT", spotsLeft)
        if (spotsLeft) {
            spotsLeftElement.textContent = spotsLeft.toString()
        }
    }
}

const fetchSpotsLeft = async () => {
    return fetch(`${BUILDSHIP_API_BASE}/extensions/whitelist/${window.JOIN_WHITELIST_ID}`)
        .then(r => r.json())
        .then(r => Number(r.max_size) - Number(r.whitelist.length))
        .catch((e) => {
            console.log("ERROR IN fetchSpotsLeft", e)
        })
}
