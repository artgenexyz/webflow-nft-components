export const isMobile = () => /Mobi/i.test(window.navigator.userAgent)
    || /iPhone|iPod|iPad/i.test(navigator.userAgent);

export const objectMap = (object, mapFn) => {
    return Object.keys(object).reduce((result, key) => {
        result[key] = mapFn(object[key]);
        return result
    }, {})
}

export const parseTxError = (error) => {
    return {
        code: error.code ?? JSON.parse(`{${error.message.split("{")[1]}`).code,
        message: error.message.split("{")[0].trim()
    };
}

// Avoid big number errors without using external libraries
export const formatValue = (v) => v.toLocaleString('fullwide', {
    useGrouping: false
});
