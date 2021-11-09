import { NETWORKS } from "./constants.js";

const initWeb3 = () => {
    if (window.ethereum && window.ethereum.isMetaMask) {
        return [new Web3(ethereum), ethereum];
    }

    if (!WalletConnectProvider) {
        return [undefined, undefined];
    }

    const provider = new WalletConnectProvider.default({
        infuraId: "27e484dcd9e3efcfd25a83a78777cdf1",
        qrcodeModalOptions: {
            mobileLinks: [
                "metamask",
                "rainbow",
                "trust",
                "gnosissafe"
            ],
        },
    });
    return [new Web3(provider), provider];
}

export const [web3, provider] = initWeb3();
window.web3 = web3;
window.provider = provider;

export const isWeb3Initialized = () => {
    return web3 && provider && (window?.ethereum || provider?.connected !== false);
}

export const isMetamaskConnected = async () => {
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
        return window.ethereum?.selectedAddress ?? await provider.request({ method: 'eth_requestAccounts' })[0];
    }
    if (!window.ethereum?.selectedAddress) {
        await connectMetamask();
        if (refresh) {
            window.location.reload();
        }
    }
    return await currentAddress();
}

export const getCurrentNetwork = async () => {
    return Number(await provider.request({ method: 'net_version' }));
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

const getIsMobile = () => /Mobi/i.test(window.navigator.userAgent)
    || /iPhone|iPod|iPad/i.test(navigator.userAgent);

export const connectMetamask = async () => {
    const isMobile = getIsMobile();
    if (window.ethereum) {
        await ethereum.request({ method: 'eth_requestAccounts' });
    } else {
        await provider.enable();
        await updateMetamaskStatus();
    }
}

const getConnectButton = () => {
    const btnID = window.buttonID ?? '#connect';
    return document.querySelector(btnID)
        ?? document.querySelector(`a[href='${btnID}']`);
}

export const updateMetamaskStatus = async () => {
    const connected = await isMetamaskConnected();
    const button = getConnectButton();
    if (button && connected) {
        button.textContent = "Metamask connected";
    }
}

export const updateConnectButton = () => {
    const walletBtn = getConnectButton();
    walletBtn?.addEventListener('click', connectMetamask);
}
