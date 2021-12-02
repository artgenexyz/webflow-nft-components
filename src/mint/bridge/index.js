import {getWalletAddressOrConnect} from "../../wallet";
import {MERCHANT_ADDRESS, PaymentContract} from "./contracts";
import {sendTx} from "../../tx";
import {formatValue} from "../../utils";
import {initContract, NFTContract} from "../../contract";

const API_URL = "https://api.webill.io/v0/nft"

const getMintCost = async (quantity, chainID) => {
    return await fetch(`${API_URL}/mint-eth-amount/?nft_chain_id=${chainID}&nft_amount=${quantity}`)
        .then(r => r.json())
        .then(r => r.message.amount)
}

const sendMintRequest = async ({ wallet, quantity, txHash}) => {
    return await fetch(`${API_URL}/mint/`, {
        method: "POST",
        body: JSON.stringify({
            client_address: wallet,
            nft_amount: quantity,
            chain_id: PaymentContract.allowedNetworks[0],
            nft_chain_id: window.CONTRACT.nft.allowedNetworks[0],
            nft_contract_mint_method: "mint",
            nft_contract_address: NFTContract._address,
            txn_hash: txHash
        })
    }).then(r => r.json())
}

export const mintViaWebill = async (quantity, chainID) => {
    const wallet = await getWalletAddressOrConnect(false);
    const mintCost = await getMintCost(quantity, chainID);
    const paymentContract = await initContract(PaymentContract, true)
    const txData = {
        from: wallet,
        value: formatValue(mintCost * 1e18),
    }
    const paymentTx = paymentContract.methods.oneTimeEthPayment(MERCHANT_ADDRESS);
    await sendTx(paymentTx, txData).then((r) => {
        console.log(r)
        sendMintRequest({ txHash: r.transactionHash, wallet, quantity })
    })
}

