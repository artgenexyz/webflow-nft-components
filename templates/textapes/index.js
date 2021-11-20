import { mint } from "../../mint/web3.js";
import { init } from "../../mint/index.js";
import { NFTContract } from "../../contract.js"
import {connectWallet} from "../../wallet.js";

let isLoading = false;

const mintAndReveal = async (nTokens) => {
    setShowLoading(true);
    await mint(nTokens).then(async () => {
        let tokenID;
        await NFTContract.methods.walletOfOwner(wallet).call((err, res) => {
            if (!err && res.length) {
                console.log(res);
                tokenID = parseInt(res.slice(-1)[0]);
            }
        })
        await reveal(tokenID);
        isLoading = false;
    }).catch((e) =>  {
        isLoading = false;
    })
}

const updateMintedCounter = async () => {
    const counter = document.querySelector('#total-minted');
    if (counter) {
        counter.textContent =
            `Total minted: ${await NFTContract.methods.totalSupply().call()} / ${await NFTContract.methods.MAX_SUPPLY().call()}`;
        console.log("Updated counter");
    }
}

const launchMint = async () => {
    await init();
    await connectWallet();

    if (isLoading) {
        return false;
    }
    isLoading = true;

    const startContainer = document.querySelector('#start-container');
    if (!startContainer) {
        await mintAndReveal(1);
    }

    updateMintedCounter();
    setInterval(updateMintedCounter, 5000);

    setShowLoading(false);
    setShowReveal(false);
    document.querySelector('#submit-quantity-form').addEventListener("submit", async (e) => {
        const nTokens = document.querySelector('#quantity-select').value;
        await mintAndReveal(nTokens);
    });
}

const setShowLoading = (shouldShow) => {
    const container = document.querySelector('#loading-container');
    (container ?? {}).style = shouldShow ? "display:flex" : "display:none";
    if (shouldShow) {
        setShowReveal(false);
        setShowQuantity(false);
    }
}

const setShowReveal = (shouldShow) => {
    const generateContainer = document.querySelector('#generate-container');
    (generateContainer ?? {}).style = shouldShow ? "display:flex" : "display:none";
}

const setShowQuantity = (shouldShow) => {
    const startContainer = document.querySelector('#start-container');
    (startContainer ?? {}).style = shouldShow ? "display:flex" : "display:none";
}

const reveal = async (tokenID) => {
    const generateContainer = document.querySelector('#generate-container');
    if (!generateContainer) return;

    setShowLoading(false);
    setShowReveal(true);
    const url = await NFTContract.methods.tokenURI(tokenID).call();
    const result = await (await fetch(url)).json();
    const address = NFTContract._address;

    let heading = document.querySelector('#generate-heading') ?? {};
    if (heading?.tagName !== "H2" && heading?.tagName !== "H1") {
        heading = heading.getElementsByTagName("h2")[0];
    }
    heading.textContent = result.name;
    (document.querySelector('#generate-description') ?? {}).textContent = result.description;
    let img = document.querySelector('#generate-image');
    if (img?.tagName !== "IMG") {
        img = img.getElementsByTagName("img")[0];
    }
    img.src = `https://cloudflare-ipfs.com/ipfs/${result.image.split("//")[1]}`;
    (document.querySelector('#generate-view-opensea') ?? {}).href = `https://opensea.io/assets/${address}/${tokenID}`;
}

const shouldLaunchMint = () => {
    const isWPEditorActive = document.body.classList.contains("elementor-editor-active");
    const isURL = document.location.href.includes("/mint") || document.location.href.includes("/generate");
    return isURL && !isWPEditorActive;
}

if (shouldLaunchMint()) {
    document.onload = launchMint();
}
(document.querySelector('#mint-button') ?? {}).onclick = () => mintAndReveal();
