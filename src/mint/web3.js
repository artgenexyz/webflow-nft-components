import { getWalletAddressOrConnect, web3 } from "../wallet.js";
import { formatValue } from "../utils.js";
import { NFTContract } from "../contract.js";
import { buildTx } from "../tx";
import { readOnlyWeb3 } from "../web3";

const findMethodByName = (methodName) =>
    Object.keys(NFTContract.methods)
        .find(key => key.toLowerCase() === methodName.toLowerCase());

const getMethodWithCustomName = (methodName) => {
    const method = window.DEFAULTS?.contractMethods ? window.DEFAULTS?.contractMethods[methodName] : undefined;
    if (method) {
        console.log(`Using custom ${methodName} method name: `, method);
        if (NFTContract.methods[method]) {
            return NFTContract.methods[method];
        } else {
            alert(`Custom ${methodName} name isn't present in the ABI, using default name`);
            console.log(`Custom ${methodName} name isn't present in the ABI, using default name`);
        }
    }
    return undefined;
};

const getMintTx = ({ numberOfTokens }) => {
    const customMintMethod = getMethodWithCustomName('mint');
    if (customMintMethod) {
        return customMintMethod(numberOfTokens);
    }

    console.log("Using hardcoded mint method detection");
    const methodNameVariants = ['mint', 'publicMint', 'mintNFTs', 'mintPublic', 'mintSale'];
    const name = methodNameVariants.find(n => findMethodByName(n) !== undefined);
    if (!name) {
        alert("Buildship widget doesn't know how to mint from your contract. Contact https://buildship.xyz in Discord to resolve this.");
        return undefined;
    }
    return NFTContract.methods[findMethodByName(name)](numberOfTokens);
};

const getMintPriceConstant = () => {
    // for contracts without exported price variable or method
    const defaultPrice = window.DEFAULTS?.publicMint?.price;
    if (defaultPrice) {
        const priceNumber = typeof defaultPrice === "string" ? Number(defaultPrice) : defaultPrice;
        if (isNaN(priceNumber)) {
            alert("Wrong publicMintPrice format, should be a number in ETH (or native token)");
            return undefined;
        }
        console.warn("Using DEFAULTS.publicMint.price as price not found in the smart-contract");
        return (priceNumber * 1e18).toString();
    }
    return undefined;
};

const getMintPriceFromConfig = async () => {
    const config = await NFTContract.methods.config().call();
    return config.mintPrice;
};

export const getMintPrice = async () => {
    const customMintPriceMethod = getMethodWithCustomName('price');
    if (customMintPriceMethod) {
        return customMintPriceMethod().call();
    }

    const mintPriceConstant = getMintPriceConstant();
    if (mintPriceConstant !== undefined) {
        console.log("Using constant mint price specified in DEFAULTS");
        return mintPriceConstant;
    }

    // Use the custom function to get the mint price from the contract's config
    const mintPriceFromConfig = await getMintPriceFromConfig();
    if (mintPriceFromConfig) {
        console.log("Using custom mint price from config");
        return mintPriceFromConfig;
    }

    const matches = Object.keys(NFTContract.methods).filter((key) =>
        !key.includes("()") &&
        (key.toLowerCase().includes("price") || key.toLowerCase().includes("cost"))
    );
    switch (matches.length) {    case 0:
        console.warn("Couldn't find the mint price function. Please contact https://buildship.xyz in Discord to resolve this.");
        alert("Couldn't find the mint price function. Please contact https://buildship.xyz in Discord to resolve this.");
        return undefined;
    case 1:
        console.log("Using the first price function found in the ABI");
        return NFTContract.methods[matches[0]]().call();
    default:
        console.warn("Multiple price functions found. Using the first one. Contact https://buildship.xyz in Discord if this doesn't work.");
        return NFTContract.methods[matches[0]]().call();
}
};

const updateMintPrice = async () => {
const price = await getMintPrice();
if (price) {
document.getElementById("mint-price").innerText = formatValue(price);
}
};

const updateTotalSupply = async () => {
const totalSupply = await NFTContract.methods.totalSupply().call();
document.getElementById("total-supply").innerText = totalSupply;
};

const mint = async (numberOfTokens) => {
const walletAddress = await getWalletAddressOrConnect();
if (!walletAddress) {
console.error("No wallet connected");
return;
}
const mintTx = getMintTx({ numberOfTokens });
if (!mintTx) {
console.error("No mint method found");
return;
}
const price = await getMintPrice();
if (!price) {
console.error("No mint price found");
return;
}
const txOptions = {
value: BigInt(price) * BigInt(numberOfTokens),
};
const tx = await buildTx(mintTx, txOptions);
await tx.send();
};

document.getElementById("mint-button").addEventListener("click", async () => {
const numberOfTokens = parseInt(document.getElementById("number-of-tokens").value);
if (isNaN(numberOfTokens) || numberOfTokens <= 0) {
alert("Please enter a valid number of tokens to mint");
return;
}
await mint(numberOfTokens);
});

updateMintPrice();
updateTotalSupply();
setInterval(updateMintPrice, 30 * 1000); // Update mint price every 30 seconds
setInterval(updateTotalSupply, 30 * 1000); // Update total supply every 30 seconds