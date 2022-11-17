import { nanoid } from "nanoid/async";
import { getConfigChainID } from "../web3";
import { getContractHashID } from "../utils";
import { showAlert } from "../components/AutoHideAlert";

class VerifyAPI_ {
    // API_URL = 'http://localhost:3000/api'
    API_URL = 'https://verification-api.buildship.xyz/api'

    _headers = async () => ({
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Token': await this.getOrGenerateXToken()
    })

    _get = async (path, query) => {
        const url = new URL(`${this.API_URL}/${path}`)
        if (query) {
            Object.keys(query).forEach(key => url.searchParams.append(key, query[key]))
        }
        return fetch(url.href, {
            method: 'GET',
            headers: await this._headers(),
        }).then(async r =>  {
            const data = await r.json()
            if (r.status !== 200) {
                throw new Error(data.error)
            }
            return { data }
        }).catch(e => {
            console.error(`Error in VerifyAPI: ${path}`, e)
            return { error: e.message }
        })
    }

    _post = async (path, data) => {
        return fetch(`${this.API_URL}/${path}`, {
            method: 'POST',
            headers: await this._headers(),
            body: JSON.stringify(data),
        }).then(async r =>  {
            const data = await r.json()
            if (r.status !== 200 && r.status !== 201) {
                throw new Error(data.error?.message ?? data.error)
            }
            return { data }
        }).catch(e => {
            console.error(`Error in VerifyAPI: ${path}`, e)
            return { error: e.message }
        })
    }

    getOrGenerateXToken = async () => {
        const savedXToken = localStorage.getItem('xToken')
        if (savedXToken) {
            return savedXToken
        }
        const xToken = await nanoid(21)
        console.log("Generated new xToken", xToken)
        localStorage.setItem('xToken', xToken)
        return xToken
    }

    loginToDiscord = async () => {
        return this._get("auth/discord/login", {
            redirectUrl: window.location.href
        })
    }

    loginToTwitter = async () => {
        return this._get("auth/twitter/login", {
            redirectUrl: window.location.href
        })
    }

    getMintSignature = async ({ signature, encodedMessage }) => {
        return this._get("mintSignature", {
            chain: String(getConfigChainID()),
            contract: window.CONTRACT_ADDRESS,
            signature,
            encodedMessage
        })
    }

    _getSavedMintSignatures = () => {
        try {
            const signatures = window.localStorage.getItem("mintSignatures")
            return signatures ? JSON.parse(signatures) : {}
        } catch (e) {
            console.error("Error getting saved mint signatures", e)
            return {}
        }
    }

    getSavedMintSignatureObject = () => {
        try {
            const savedSignature = this._getSavedMintSignatures()[this.getContractHashKey()]
            console.log("Saved signature", savedSignature)
            return savedSignature ? JSON.parse(savedSignature) : null
        } catch (e) {
            console.error("Error getting saved mint signature object", e)
            return null
        }
    }

    saveMintSignatureObject = (signatureObject) => {
        try {
            window.localStorage.setItem("mintSignatures", JSON.stringify({
                [this.getContractHashKey()]: JSON.stringify(signatureObject)
            }))
        } catch (e) {
            console.error("Error saving mint signature object", e)
            showAlert(`Error saving mint signature: ${e?.message}`, "error")
            return null
        }
    }

    getContractHashKey = () => getContractHashID(getConfigChainID(), window.EXTENSION_ADDRESS)
}

export const VerifyAPI = new VerifyAPI_()