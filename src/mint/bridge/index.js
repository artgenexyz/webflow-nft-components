import {getWalletAddressOrConnect} from "../../wallet";
import {MERCHANT_ADDRESS, PaymentContract} from "./contracts";
import {sendTx} from "../../tx";
import {formatValue} from "../../utils";
import {initContract, NFTContract} from "../../contract";

const API_URL = "https://api.webill.io/v0"

const getMintCost = async (quantity, collectionID) => {
    return await fetch(`${API_URL}/customer_nft/base-value-for-mint/?nft_collection=${collectionID}&nft_amount=${quantity}`)
        .then(r => r.json())
        .then(r => r.message.amount)
}

const createCollection = async () => {
    const chain_id = window.CONTRACT.nft.allowedNetworks[0];
    return await fetch(`${API_URL}/nft-collection/`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            chain_id,
            abi: window.CONTRACT.nft.abi,
            contract_address: window.CONTRACT.nft.address[chain_id]
        })
    }).then(r => r.json())
}

const sendMintRequest = async ({ wallet, quantity, txHash, collectionID }) => {
    return await fetch(`${API_URL}/customer_nft/mint-nft-collection/`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            customer: wallet,
            nft_amount: quantity,
            chain_id: window.CONTRACT.nft.allowedNetworks[0],
            nft_contract_mint_method: "mint",
            nft_collection: collectionID,
            txn_hash: txHash
        })
    }).then(r => r.json())
}

export const mintViaWebill = async (quantity) => {
    const wallet = await getWalletAddressOrConnect(false);
    // Test-only collectionID for ameegos.io
    // TODO: use createCollection when API fixed
    const collectionID = () => {
        if (window.location.href.includes("ameegos.io"))
            return "e261526d-0569-47ec-bd46-48d2518a8501"
        else if (window.location.href.includes("culd.org"))
            return "b046d89b-daf0-4632-b02c-8a85d67fa1e4"
        else
            return "b046d89b-daf0-4632-b02c-8a85d67fa1e4"
    }
    const mintCost = await getMintCost(quantity, collectionID());
    const paymentContract = await initContract(PaymentContract, true)
    const txData = {
        from: wallet,
        value: formatValue(mintCost * 1e18),
    }
    const paymentTx = paymentContract.methods.oneTimeEthPayment(MERCHANT_ADDRESS);
    await sendTx(paymentTx, txData, 80000).then((r) => {
        sendMintRequest({ txHash: r.transactionHash, wallet, quantity, collectionID: collectionID() })
    })
}

