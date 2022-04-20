import Web3 from "web3";
import Web3Modal from "web3modal";
import WalletConnectProvider from "@walletconnect/web3-provider";

import { DeFiWeb3Connector } from "deficonnect";
import { NETWORKS } from "./constants.js";
import { isMobile, objectMap } from "./utils.js";
import { setContracts } from "./contract.js";
import { updateMintedCounter } from './mint/ui';


export let [web3, provider] = [];

export const isWeb3Initialized = () => {
  return web3 && provider;
}

const initWeb3 = async (forceConnect = false) => {
  if (isWeb3Initialized()) return
  const walletConnectOptions = {
    rpc: objectMap(NETWORKS, (value) => (value.rpcURL)),
    qrcodeModalOptions: {
      mobileLinks: [
        "rainbow",
        "trust",
      ],
    }
  }
  const mobileNotInjectedProvider = isMobile() && !window.ethereum
  const onlyInjectedProvider = isMobile() && window.ethereum
  if (mobileNotInjectedProvider && forceConnect) {
    // Use Metamask for mobile only
    const link = window.location.href
      .replace("https://", "")
      .replace("www.", "");
    window.open(`https://metamask.app.link/dapp/${link}`);
    return undefined
  }
  const web3Modal = new Web3Modal({
    cacheProvider: false,
    providerOptions: !onlyInjectedProvider ? {
      walletconnect: {
        package: WalletConnectProvider,
        options: walletConnectOptions
      }
    } : {}
  });
  if (web3Modal.cachedProvider || forceConnect) {
    if (web3Modal.cachedProvider === "walletconnect") {
      web3Modal.clearCachedProvider()
    }
    provider = await web3Modal.connect();
    if (provider && provider.isMetaMask) {
      web3Modal.setCachedProvider("injected")
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

  const connector = new DeFiWeb3Connector({
    supportedChainIds: [1],
    rpc: {
      1: "https://mainnet.infura.io/v3/INFURA_API_KEY",
      25: "https://evm.cronos.org/", // cronos mainet
    },
    pollingInterval: 15000,
  });
  connector.activate();
  const provider = await connector.getProvider()
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
  await initWeb3(true);
  // if (isMobile()) {
  //     const link = window.location.href
  //         .replace("https://", "")
  //         .replace("www.", "");
  //     window.open(`https://metamask.app.link/dapp/${link}`);
  // }
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
  walletBtn?.addEventListener('click', async () => {
    await connectWallet()
    if (window.CONTRACT_ADDRESS && !window?.DISABLE_MINT) {
      await setContracts(true)
      await updateMintedCounter()
    }
  });
}
