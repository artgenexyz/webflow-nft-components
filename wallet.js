import { NETWORKS } from "./constants.js";

export const web3 = window.ethereum ? new Web3(ethereum) : undefined;

const isMetamaskConnected = async () => {
    if (!web3) {
        return false
    }
    const accounts = await web3.eth.getAccounts();
    return accounts.length > 0;
}

export const getWalletAddress = async (refresh=false) => {
    const currentAddress = async () => {
        if (!window.ethereum) {
            return undefined;
        }
        return ethereum?.selectedAddress ?? await ethereum.request({ method: 'eth_requestAccounts' })[0];
    }
    if (!ethereum?.selectedAddress) {
        await connectMetamask();
        if (refresh) {
            window.location.reload();
        }
    }
    return await currentAddress();
}

export const getCurrentNetwork = async () => {
    return Number(await ethereum.request({ method: 'net_version' }));
}

export const switchNetwork = async (chainID) => {
    if (!window.ethereum) {
        return
    }
    const chainIDHex = `0x${chainID.toString(16)}`;
    try {
        await ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: chainIDHex }],
        });
    } catch (error) {
        // This error code indicates that the chain has not been added to MetaMask
        // if it is not, then install it into the user MetaMask
        if (error.code === 4902) {
            try {
                await ethereum.request({
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
        await updateMetamaskStatus();
    } else if (isMobile) {
        const link = window.location.href
            .replace("https://", "")
            .replace("www.", "");
        window.open(`https://metamask.app.link/dapp/${link}`);
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
