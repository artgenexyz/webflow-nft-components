# Webflow NFT widgets

Connect web3 to Webflow without coding skills required. 
Feel free to open an issue for feature requests or bugs.

## Lazy mint on Webflow

Check out our ready-to-use minting website template: https://textapes.art

[Contact us](https://buildship.dev) to get this Webflow template & create your Opensea-independent NFT collection

## How to use?
1. Open Webflow website editor
2. Create a new [Embedded HTML code](https://university.webflow.com/lesson/custom-code-embed) block (at least **Basic** site plan required)
3. Copy & paste this code in Webflow Embed block
```html
<script>
   CONTRACT_ADDRESS = "<your contract address here>"
   NETWORK_ID = 1
</script>
<script src="https://nftcomponents.vercel.app/static/js/main.js"></script>
<link href="https://nftcomponents.vercel.app/static/css/main.css" rel="stylesheet">
```
4. If you have your Ethereum NFT contract, insert your contract address in `CONTRACT_ADDRESS` field. If you don't, [contact us](https://buildship.dev).
5. Change `NETWORK_ID` if you're using something other than Ethereum:
   - Ethereum Rinkeby Testnet: `NETWORK_ID = 4`
   - Polygon `NETWORK_ID = 137`
   - Binance `NETWORK_ID = 56`
6. Create a button with ID `mint-button` to your Webflow site.
7. You're done 🎉

Minting will work via Metamask wallet, and will ask to connect the wallet first, so it's not necessary to add a "Connect wallet" button.

If you don't know how to code or want to launch fast, get Webflow NFT minting templates at https://buildship.dev
