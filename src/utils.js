export const isMobile = () => /Mobi/i.test(window.navigator.userAgent)
    || /iPhone|iPod|iPad/i.test(navigator.userAgent);

export const objectMap = (object, mapFn) => {
    return Object.keys(object).reduce((result, key) => {
        result[key] = mapFn(object[key]);
        return result
    }, {})
}

export const normalizeURL = (u) => ((new URL(u).host).replace('www.', ''))

export const parseErrorCode = (error) => {
    try {
        return error.code ?? JSON.parse(`{${error.message.split("{")[1]}`).code
    } catch (e) {
        console.log("Failed to parse error code")
        console.log("Parse error:", e)
        return undefined
    }
}

export const parseErrorMessage = (error) => {
    return error.message.split("{")[0].trim().replace("execution reverted: ", "")
}

export const parseTxError = (error) => {
    try {
        console.log(error.message)
        return {
            code: parseErrorCode(error),
            message: parseErrorMessage(error)
        };
    } catch (parse_error) {
        console.log("Failed to parse message")
        console.log("Parse error:", parse_error)
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