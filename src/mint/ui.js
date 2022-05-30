import { getMaxSupply, getMintedNumber, mint } from "./web3.js";
import { parseTxError } from "../utils.js";
import { showAlert } from "../index.js";
import { showMintModal } from "../components/MintModal";
import { getWalletAddressOrConnect } from '../wallet';

export const updateMintButton = () => {
    const mintButtons = [
        ...document.querySelectorAll('#mint-button'),
        ...document.querySelectorAll("a[href*='#mint-button']")
    ]

    if (mintButtons) {
        console.log(mintButtons)
        mintButtons.forEach((mintButton) => {
            mintButton.href = "#"
            mintButton.onclick = async () => {
                const initialBtnText = mintButton.textContent;
                setButtonText(mintButton, "Loading...")
                try {
                    const quantity = getMintQuantity();
                    await getWalletAddressOrConnect(true)
                    showMintModal(quantity);
                } catch (e) {
                    console.log("Error on pressing mint")
                    console.error(e)
                }
                setButtonText(mintButton, initialBtnText)
            }
        })
    }
}

export const updateMintedCounter = async () => {
    const mintedElem = document.querySelector("#minted-counter")
    const totalElem = document.querySelector("#total-counter")
    console.log("COUNTER ELEMS", mintedElem, totalElem)
    if (mintedElem) {
        const minted = await getMintedNumber()
        console.log("MINTED", minted)
        if (minted) {
            mintedElem.textContent = minted
        }
    }
    if (totalElem) {
        const maxSupply = await getMaxSupply()
        console.log("TOTAL", maxSupply)
        if (maxSupply) {
            totalElem.textContent = maxSupply
        }
    }
}

export const updateMintByTierButtons = () => {
    const tierButtons = document.querySelectorAll('[tier]')
    if (!tierButtons.length)
        return
    tierButtons.forEach((element) => {
        element.setAttribute('href', '#');
        element.onclick = async () => {
            const initialBtnText = element.textContent;
            const tierID = Number(element.getAttribute("tier"))
            const { tx } = await mint(1, getMintReferral(), tierID)
            tx?.on("confirmation", (r) => {
                setButtonText(element, initialBtnText);
                console.log(r);
                showAlert(`Successfully minted 1 NFTs`, "success")
            })?.on("error", (e) => {
                console.log(e)
                setButtonText(element, initialBtnText);
                const { code, message } = parseTxError(e);
                if (code !== 4001) {
                    showAlert(`Minting error: ${message}. Please try again or contact us`, "error");
                }
            })
        }
    })
}

const getMintQuantity = () => {
    const quantity = document.querySelector('#quantity-select')?.value
    return quantity !== '' && quantity !== undefined ? Number(quantity) : undefined;
}

const getMintReferral = () => {
    const searchParams = new URLSearchParams(window.location.search);
    return searchParams.get("ref");
}

const setButtonText = (btn, text) => {
    if (btn.childElementCount > 0) {
        btn.children[0].textContent = text;
    } else {
        btn.textContent = text;
    }
}
