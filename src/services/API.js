class _API {
    API_URL = "https://metadata.buildship.xyz/api"

    _get = async (url) => {
        return fetch(`${this.API_URL}/${url}`, {
            method: 'GET',
        }).then(async r => {
            const resp = await r.json()
            if (r.status !== 200) {
                throw new Error(resp.message)
            }
            return { data: resp }
        }).catch(e => {
            console.error("Error in _get(", url, "); error message: ", e.message)
            return { error: e.message }
        })
    }

    getEmbedInfo = async (id) => {
        return this._get(`v1.1/extensions/embeds/info/${id}`)
    }
}

export const API = new _API()

export default API