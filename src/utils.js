export const isMobile = () => /Mobi/i.test(window.navigator.userAgent)
    || /iPhone|iPod|iPad/i.test(navigator.userAgent);

export const isMetaMaskDesktop = (provider) => !isMobile() && provider?.isMetaMask

export const objectMap = (object, mapFn) => {
    return Object.keys(object).reduce((result, key) => {
        result[key] = mapFn(object[key]);
        return result
    }, {})
}

export const toHex = (number) => number ? `0x${number.toString(16)}` : undefined

export const parseTxError = (error) => {
    try {
        return {
            code: error.code ?? JSON.parse(`{${error.message.split("{")[1]}`).code,
            message: error.message.split("{")[0].trim()
        };
    } catch (parse_error) {
        console.log("Failed to parse error code and message")
        console.log("Original error:", error)
        return {
            code: undefined, message: error?.toString()
        }
    }
}

// Avoid big number errors without using external libraries
export const formatValue = (v) => v.toLocaleString('fullwide', {
    useGrouping: false
});

export const roundToDecimal = (n, d) => {
    return +n.toFixed(d)
}

// TODO: remove this when migrated to @buildship/web3-login or forked Web3Modal
// Puts "custom-metamask" provider as the first option
export const dirtyFixConnectWalletUI = () => {
    const web3ModalElem = document.querySelector(".web3modal-modal-card")
    web3ModalElem?.insertBefore(web3ModalElem.lastChild, web3ModalElem.firstChild)
}