import { getCurrentNetwork, switchNetwork, web3 } from './wallet.js';

export let NFTContract;

const initContract = async (contract) => {
    const host = new URL(window.location.href).host;
    const allowedURLs = contract?.allowedURLs?.map(u => (new URL(u).host));
    if (!allowedURLs?.some(v => v.includes(host))) {
        return undefined;
    }
    let currentNetwork = await getCurrentNetwork();
    if (!contract.allowedNetworks.includes(currentNetwork)) {
        await switchNetwork(contract.allowedNetworks[0])
        currentNetwork = await getCurrentNetwork();
    }
    const address = contract.address[currentNetwork];
    const abi = contract.abi;
    return new web3.eth.Contract(abi, address);
}

const initContractGlobalObject = () => {
    const chainID = window.IS_TESTNET ? 4 : 1;
    window.CONTRACT = {
        nft: {
            address: {
                [chainID]: window.CONTRACT_ADDRESS,
            },
            abi: typeof window.CONTRACT_ABI === 'string'
                ? JSON.parse(window.CONTRACT_ABI)
                : window.CONTRACT_ABI,
            allowedNetworks: [chainID],
            allowedURLs: [window.WEBSITE_URL]
        }
    }
}

export const setContracts = async () => {
    initContractGlobalObject()
    NFTContract = await initContract(window.CONTRACT.nft);
    // for debug purposes
    window.NFTContract = NFTContract;
}
