import { NETWORKS } from "./constants.js";
import {isMobile, objectMap} from "./utils.js";
import {setContracts} from "./contract.js";

export let [web3, provider] = [];
export const isWeb3Initialized = () => {
    return web3 && provider && provider?.connected !== false;
}

const initWeb3 = async (forceConnect = false) => {
    if (isWeb3Initialized()) return
    const walletConnectOptions = {
        rpc: objectMap(NETWORKS, (value) => (value.rpcURL)),
        qrcodeModalOptions: {
            mobileLinks: [
                "metamask",
                "rainbow",
                "trust",
            ],
        }
    }
    const disableInjectedProvider = isMobile() && !window.ethereum;
    const onlyInjectedProvider = isMobile() && window.ethereum;
    const web3Modal = new Web3Modal.default({
        disableInjectedProvider,
        cacheProvider: true,
        providerOptions: !onlyInjectedProvider ? {
            walletconnect: {
                package: WalletConnectProvider.default,
                options: walletConnectOptions
            }
        } : {}
    });
    if (web3Modal.cachedProvider || forceConnect) {
        provider = await web3Modal.connect();
        provider.on("accountsChanged", async (accounts) => {
            if (accounts.length === 0) {
                if (provider.close) {
                    await provider.close();
                }
                await web3Modal.clearCachedProvider();
            }
        });
    }
    web3 = provider ? new Web3(provider) : undefined;
}

export const isWalletConnected = async () => {
    if (!isWeb3Initialized()) {
        return false
    }
    const accounts = await web3.eth.getAccounts();
    return accounts?.length > 0;
}

export const getWalletAddress = async (refresh=false) => {
    const currentAddress = async () => {
        if (!provider) {
            return undefined;
        }
        return window.ethereum?.selectedAddress ?? await provider?.request({ method: 'eth_requestAccounts' })[0];
    }
    if (!window.ethereum?.selectedAddress) {
        await connectWallet();
        if (refresh) {
            window.location.reload();
        }
    }
    return await currentAddress();
}

export const getCurrentNetwork = async () => {
    return Number(await provider?.request({ method: 'net_version' }));
}

export const switchNetwork = async (chainID) => {
    if (!provider) {
        return
    }
    const chainIDHex = `0x${chainID.toString(16)}`;
    try {
        await provider.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: chainIDHex }],
        });
    } catch (error) {
        // This error code indicates that the chain has not been added to MetaMask
        // if it is not, then install it into the user MetaMask
        if (error.code === 4902) {
            try {
                await provider.request({
                    method: 'wallet_addEthereumChain',
                    params: [
                        {
                            chainId: chainIDHex,
                            nativeCurrency: NETWORKS[chainID].currency,
                            chainName: NETWORKS[chainID].name,
                            rpcUrls: [NETWORKS[chainID].rpcURL],
                            blockExplorerUrls: [NETWORKS[chainID].blockExplorerURL]
                        },
                    ],

                });
            } catch (addError) {
                console.error(addError);
            }
        }
        console.error(error);
    }
}

export const connectWallet = async () => {
    console.log("Connecting Wallet")
    await initWeb3(true);
    if (isMobile()) {
        const link = window.location.href
            .replace("https://", "")
            .replace("www.", "");
        window.open(`https://metamask.app.link/dapp/${link}`);
    }
    await setContracts();
    await updateWalletStatus();
    console.log("Connected Wallet");
}

const getConnectButton = () => {
    const btnID = window.buttonID ?? '#connect';
    return document.querySelector(btnID)
        ?? document.querySelector(`a[href='${btnID}']`);
}

export const updateWalletStatus = async () => {
    await initWeb3();
    const connected = await isWalletConnected();
    const button = getConnectButton();
    if (button && connected) {
        button.textContent = "Wallet connected";
    }
}

export const updateConnectButton = () => {
    const walletBtn = getConnectButton();
    walletBtn?.addEventListener('click', connectWallet);
}
