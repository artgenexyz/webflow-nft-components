import {getWalletAddressOrConnect} from "../../wallet";
import { MERCHANT_ADDRESS, PaymentContract, SendAndMintContract } from "./contracts";
import {sendTx} from "../../tx";
import {formatValue} from "../../utils";
import {initContract} from "../../contract";

const API_URL = "https://api.webill.io/v0/customer_nft/buildship"

const getMintCost = async (quantity) => {
    const nftContract = window.CONTRACT.nft
    const nftChainID = nftContract.allowedNetworks[0]
    return await fetch(`${API_URL}/mint-costs/`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            nft_amount: quantity,
            chain_id: PaymentContract.allowedNetworks[0],
            nft_chain_id: nftChainID,
            nft_contract_address: nftContract.address[nftChainID],
            nft_abi: nftContract.abi,
            webill_contract_address: SendAndMintContract.address[nftChainID]
        })
    })
        .then(r => r.json())
        .then(r => r.message.cost_total.ETH)
}

const sendMintRequest = async ({ wallet, quantity, txHash }) => {
    const nftContract = window.CONTRACT.nft
    const nftChainID = nftContract.allowedNetworks[0]
    return await fetch(`${API_URL}/mint-nft-collection/`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            txn_hash: txHash,
            customer: wallet,
            chain_id: PaymentContract.allowedNetworks[0],
            nft_amount: quantity,
            nft_contract_address: nftContract.address[nftChainID],
            nft_abi: nftContract.abi,
            nft_chain_id: nftChainID,
            webill_contract_address: SendAndMintContract.address[nftChainID]
        })
    }).then(r => r.json())
}

export const mintViaWebill = async (quantity) => {
    const wallet = await getWalletAddressOrConnect(false);
    const mintCost = await getMintCost(quantity);
    const paymentContract = await initContract(PaymentContract, true)
    const txData = {
        from: wallet,
        value: formatValue(mintCost * 1e18),
    }
    const paymentTx = paymentContract.methods.oneTimeEthPayment(MERCHANT_ADDRESS);
    await sendTx(paymentTx, txData, 80000).then((r) => {
        sendMintRequest({ txHash: r.transactionHash, wallet, quantity })
    })
}

