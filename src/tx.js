import {formatValue, parseTxError} from "./utils";
import {web3} from "./wallet";
import {showAlert} from "./components/AutoHideAlert";
import { isEthereum } from "./contract";

export const sendTx = async (tx, txData, defaultGasLimit) => {
    const estimatedGas = await estimateGasLimit(tx, txData, defaultGasLimit);
    if (!estimatedGas) {
        return Promise.reject()
    }
    const maxFeePerGas = await estimateMaxGasFee(tx);
    const maxPriorityFeePerGas = await estimateMaxPriorityFeePerGas();
    return tx.send({...txData, gasLimit: estimatedGas + 5000, maxFeePerGas, maxPriorityFeePerGas });
}

export const buildTx = async (tx, txData, defaultGasLimit, gasLimitSlippage = 5000) => {
    const estimatedGas = await estimateGasLimit(tx, txData, defaultGasLimit);
    if (!estimatedGas) {
        return Promise.reject()
    }
    const maxFeePerGas = await estimateMaxGasFee(tx);
    const maxPriorityFeePerGas = await estimateMaxPriorityFeePerGas();
    const gasLimit = estimatedGas + gasLimitSlippage
    return {...txData, gasLimit, maxFeePerGas, maxPriorityFeePerGas }
}

const estimateGasLimit = (tx, txData, defaultGasLimit) => {
    return tx.estimateGas(txData).catch((e) => {
        const { code, message } = parseTxError(e);
        if (code === -32000) {
            return defaultGasLimit;
        }
        showAlert(`${message}. Please try refreshing page, check your MetaMask connection or contact us to resolve`, "error");
        console.log(e);
    })
}

const estimateMaxGasFee = async (tx) => {
    const gasPrice = await web3.eth.getGasPrice();
    // Math.max is for Rinkeby (low gas price), 2.5 Gwei is Metamask default for maxPriorityFeePerGas
    const maxGasPrice = Math.max(Math.round(Number(gasPrice) * 1.2), 5e9);
    const chainID = await web3.eth.getChainId();
    return isEthereum(chainID) ? formatValue(maxGasPrice) : undefined;
}

const estimateMaxPriorityFeePerGas = async () => {
    const chainID = await web3.eth.getChainId();
    return isEthereum(chainID) ? 2e9 : undefined;
}
