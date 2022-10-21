import { setButtonText } from '../ui';
import { showAlert } from '../../components/AutoHideAlert';
import { checkWhitelistEligibility, mint } from './web3';
import { showJoinWhitelistModal } from '../../components/JoinWhitelistModal';
import { BUILDSHIP_API_BASE } from '../../constants';
import { sendEvent } from '../../analytics';
import { showMintModal } from '../../index';
import { parseTxError } from '../../utils';

export const updateMintWhitelistButton = () => {
    const variants = ["#mint-allowlist", "#mint-whitelist"]
    const mintButtons = variants.reduce((prev, name) => {
        return [
            ...prev,
            ...document.querySelectorAll(name),
            ...document.querySelectorAll(`a[href*='${name}']`),
        ]
    }, [])
    if (mintButtons) {
        console.log("mint WL buttons", mintButtons)
        mintButtons.forEach((mintButton) => {
            mintButton.onclick = async () => {
                const initialBtnText = mintButton.textContent;
                setButtonText(mintButton, "Loading...")

                sendEvent(window.analytics, 'whitelist-mint-button-click', {})

                const defaultQuantity = window.DEFAULTS?.whitelist?.mintQuantity ?? 1
                const isEligible = await checkWhitelistEligibility()
                if (isEligible) {
                    showMintModal(defaultQuantity, "whitelist")
                } else {
                    showAlert("Your wallet is not in the allowlist. If this is a mistake, contact our support in Discord", "error")
                }
                setButtonText(mintButton, initialBtnText)
            }
        })
    }
}

export const updateJoinWhitelistButton = () => {
    const joinButtons = [
        ...document.querySelectorAll('#join-whitelist'),
        ...document.querySelectorAll("a[href*='#join-whitelist']")
    ]
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

export const mintOne = async ({ quantity, button, initialBtnText }) => {
    await mint(quantity).then((r) => {
        setButtonText(button, initialBtnText);
        console.log(r);
        showAlert(`Successfully minted ${quantity} NFTs`, "success")

        sendEvent(window.analytics, 'whitelist-mint-success', {})

    }).catch((e) => {
        console.log(e)
        setButtonText(button, initialBtnText);
        const { code, message } = parseTxError(e);

        if (code !== 4001) {
            if (e) {
                showAlert(`Minting error: ${message}. Please try again or contact us`, "error");
            }

            sendEvent(window.analytics, 'whitelist-mint-error', { error: message })
        } else {
            sendEvent(window.analytics, 'whitelist-mint-rejected', { error: message })
        }

    })
}

