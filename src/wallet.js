import Web3 from "web3";
import Web3Modal, { injected } from "web3modal";
import WalletConnectProvider from "@walletconnect/web3-provider";
import CoinbaseWalletSDK from '@coinbase/wallet-sdk';

import { NETWORKS } from "./constants.js";
import { isMobile, objectMap } from "./utils.js";
import { setContracts } from "./contract.js";
import { updateMintedCounter } from './mint/ui';


export let [web3, provider] = [];

export const isWeb3Initialized = () => {
    return web3 && provider;
}

const getWeb3ModalProviderOptions = ({
    forceConnect,
    isMobileOnlyInjectedProvider,
    isDesktopNoInjectedProvider
}) => {
    const walletConnectOptions = {
        rpc: objectMap(NETWORKS, (value) => (value.rpcURL)),
        qrcodeModalOptions: {
            mobileLinks: [
                "rainbow",
                "trust",
                "ledger",
                "gnosis"
            ],
            desktopLinks: [
                "rainbow",
                "trust",
                "ledger",
                "gnosis"
            ]
        }
    }

    const basicProviderOptions = {
        walletconnect: {
            display: {
                description: "Connect Rainbow, Trust, Ledger, Gnosis, or scan QR code"
            },
            package: WalletConnectProvider,
            options: walletConnectOptions
        },
        coinbasewallet: {
            package: CoinbaseWalletSDK, // Required
            options: {
                appName: "Buildship", // Required
                rpc: "https://mainnet.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161", // Optional if `infuraId` is provided; otherwise it's required
                chainId: 1, // Optional. It defaults to 1 if not provided
                darkMode: false // Optional. Use dark theme, defaults to false
            }
        }
    }
    const metamaskProvider = {
        // Use custom Metamask provider because of conflicts with Coinbase injected provider
        "custom-metamask": {
            display: {
                logo: injected.METAMASK.logo,
                name: "MetaMask",
                description: "Connect to your MetaMask wallet"
            },
            package: {},
            options: {},
            connector: async (ProviderPackage, options) => {
                const mobileNotInjectedProvider = isMobile() && !window.ethereum
                // If mobile user doesn't have injected web3
                // Open the website in the Metamask mobile app via deep link
                if (mobileNotInjectedProvider && forceConnect) {
                    const link = window.location.href
                        .replace("https://", "")
                        .replace("www.", "");
                    window.open(`https://metamask.app.link/dapp/${link}`);
                    return undefined
                }

                let provider
                if (window?.ethereum?.providers?.length > 1) {
                    provider = window?.ethereum?.providers?.filter(p => p.isMetaMask)?.at(0)
                    console.log("Found multiple injected web3 providers, using Metamask")
                } else {
                    provider = window?.ethereum
                }
                await provider?.request({method: 'eth_requestAccounts'});
                return provider
            }
        },
    }
    // Used on desktop browsers without injected web3
    // Actually opens WalletConnect
    // TODO: start using this if MetaMask app stops crashes
    // TODO: experiment with MM + custom Infura for WalletConnect
    const fakeMetamaskProvider = {
        "custom-fake-metamask": {
            display: {
                logo: injected.METAMASK.logo,
                name: "MetaMask",
                description: "Connect MetaMask mobile wallet via QR code"
            },
            package: WalletConnectProvider,
            options: {
                rpc: objectMap(NETWORKS, (value) => (value.rpcURL)),
                qrcodeModalOptions: {
                    desktopLinks: ["metamask"]
                },
            },
            connector: async (ProviderPackage, options) => {
                const provider = new ProviderPackage(options);

                await provider.enable();

                return provider;
            }
        }
    }

    // Don't show separate Metamask option on Safari, Opera, Firefox desktop
    const allProviderOptions = isDesktopNoInjectedProvider ? basicProviderOptions : {
            ...metamaskProvider,
            ...basicProviderOptions
        }

    // Use only injected provider if it's the only wallet available
    // Built for mobile in-app browser wallets like Metamask, Coinbase
    return !isMobileOnlyInjectedProvider ? allProviderOptions : {}
}

const initWeb3Modal = (forceConnect, isMobileOnlyInjectedProvider) => {
    const isDesktopNoInjectedProvider =  !isMobile() && !window.ethereum

    const web3Modal = new Web3Modal({
        cacheProvider: false,
        // Use custom Metamask provider because of conflicts with Coinbase injected provider
        // On mobile apps with injected web3, use ONLY injected providers
        disableInjectedProvider: !isMobileOnlyInjectedProvider,
        providerOptions: getWeb3ModalProviderOptions({
            forceConnect,
            isMobileOnlyInjectedProvider,
            isDesktopNoInjectedProvider
        })
    });

    return web3Modal
}

const initWeb3 = async (forceConnect = false) => {
    if (isWeb3Initialized()) return

    const isMobileOnlyInjectedProvider = isMobile() && window.ethereum
    const web3Modal = initWeb3Modal(forceConnect, isMobileOnlyInjectedProvider)

    if (web3Modal.cachedProvider || forceConnect) {
        if (web3Modal.cachedProvider === "walletconnect") {
            web3Modal.clearCachedProvider()
        }
        // this is for fixing a previous bug
        if (isMobileOnlyInjectedProvider && web3Modal.cachedProvider !== "injected") {
            web3Modal.clearCachedProvider()
        }
        provider = await web3Modal.connect();
        if (provider) {
            let providerID
            if (provider.isMetaMask)
                providerID = isMobileOnlyInjectedProvider ? "injected" : "custom-metamask"
            if (provider.isCoinbaseWallet)
                providerID = isMobileOnlyInjectedProvider ? "injected" : "coinbasewallet"

            if (providerID)
                web3Modal.setCachedProvider(providerID)
        }
        provider.on("accountsChanged", async (accounts) => {
            if (accounts.length === 0) {
                if (provider.close) {
                    await provider.close();
                }
                web3Modal.clearCachedProvider();
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

export const getWalletAddressOrConnect = async (shouldSwitchNetwork, refresh) => {
    const currentAddress = async () => {
        if (!isWeb3Initialized()) {
            return undefined;
        }
        try {
            return (await provider?.request({ method: 'eth_requestAccounts' }))[0];
        } catch {
            await provider.enable();
            return (await web3.eth.getAccounts())[0];
        }
    }
    if (!isWeb3Initialized()) {
        await connectWallet();
        if (refresh) {
            window.location.reload();
        }
    }
    // For multi-chain dapps (multi-chain contracts on the same page)
    if (shouldSwitchNetwork ?? true) {
        await setContracts(shouldSwitchNetwork ?? true);
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
    if (chainID === await getCurrentNetwork()) {
        console.log("Don't need to change network")
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
    try {
        await initWeb3(true);
    } catch (e) {
        alert(`Error in initWeb3 in connectWallet: ${e.toString()}`)
        console.error(e)
    }
    await updateWalletStatus();
    console.log("Connected Wallet");
}

const getConnectButton = () => {
    const btnID = window.buttonID ?? '#connect';
    return document.querySelector(btnID)
        ?? document.querySelector(`a[href='${btnID}']`);
}

export const updateWalletStatus = async () => {
    try {
        await initWeb3();
    } catch (e) {
        alert(`Error in initWeb3: ${e.toString()}`)
        console.error(e)
    }
    const connected = await isWalletConnected();
    const button = getConnectButton();
    if (button && connected) {
        button.textContent = window?.DEFAULTS?.labels?.walletConnected ?? "Wallet connected";
    }
}

export const updateConnectButton = () => {
    const walletBtn = getConnectButton();
    walletBtn?.addEventListener('click', async () => {
        await connectWallet()
        if (window.CONTRACT_ADDRESS && !window?.DISABLE_MINT) {
            await setContracts(true)
            await updateMintedCounter()
        }
    });
}