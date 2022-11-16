import { getWalletAddressOrConnect, web3 } from "../wallet";

class SIWE_ {

    signMessage = async () => {
        const address = await getWalletAddressOrConnect()
        const message = "Sign this to prove you own this wallet"
        try {
            const encodedMessage = btoa(message)
            return {
                signature: await web3.eth.personal.sign(message, address),
                encodedMessage,
                error: undefined
            }
        } catch (e) {
            console.error("Error in signMessage", e)
            return { signature: undefined, error: e.message }
        }
    }
}

export const SignInWithEth = new SIWE_()