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
