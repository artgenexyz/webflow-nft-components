import { mint } from "./web3.js";

export const updateMintButton = () => {
    const mintButton = document.querySelector('#mint-button');
    if (mintButton) {
        mintButton.onclick = async () => {
            const initialBtnText = mintButton.textContent;
            mintButton.textContent = "Loading..."
            mint(getMintQuantity(), getMintReferral()).then((r) => {
                mintButton.textContent = initialBtnText;
            })
        }
    }
}

const getMintQuantity = () => {
    return document.querySelector('#quantity-select')?.value;
}

const getMintReferral = () => {
    const searchParams = new URLSearchParams(window.location.search);
    return searchParams.get("ref");
}
