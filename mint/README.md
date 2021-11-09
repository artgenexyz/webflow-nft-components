# Mint NFTs on Webflow

No coding skills required! Check out our ready-to-use template: https://textapes.art

[Contact us](https://buildship.dev) to get these Webflow templates and deploy your own NFT contract

## How to use?
1. Open Webflow website editor
2. Create a new [Embedded HTML code](https://university.webflow.com/lesson/custom-code-embed) block (at least **Basic** site plan required)
3. Copy & paste this code in the created block. If you already have a deployed Ethereum contract, insert your address, ABI and website link
```html
<script src="https://cdn.jsdelivr.net/npm/web3@latest/dist/web3.min.js"></script>
<script>
    window.CONTRACT_ADDRESS = "<your contract address here>"
    window.CONTRACT_ABI = "<your contract ABI here>"
    window.WEBSITE_URL = "<your mint website URL here>"
</script>
<script crossorigin src="https://unpkg.com/react@17/umd/react.production.min.js"></script>
<script crossorigin src="https://unpkg.com/react-dom@17/umd/react-dom.production.min.js"></script>
<script crossorigin src="https://unpkg.com/@mui/material@5.1.0/umd/material-ui.production.min.js"></script>
<script type="module" src="https://buildship-dev.github.io/webflow-nft-components/mint/index.js"></script>
```
4. If you don't have a deployed Ethereum contract, [contact us](https://buildship.dev) to deploy it
6. Create a button with ID `mint-button`
7. Done!

Minting will work via Metamask wallet, and will ask to connect the wallet first, so it's not necessary to add a "Connect wallet" button.

If you don't know how to code or want to launch fast, get Webflow NFT minting templates at https://buildship.dev
