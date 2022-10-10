import { BUILDSHIP_API_BASE } from "./constants";

export const getProjectInfo = (project_id) => {
    const url = `${BUILDSHIP_API_BASE}/v1.1/collections/info/${project_id}`
    const options = {
        method: "GET"
    };
    return fetch(url, options).then(async r => {
        const resp = await r.json()
        console.log('getProjectInfo', resp)
        if (r.status !== 200) {
            throw new Error(resp.message)
        }
        return resp
    }).catch(e => {
        console.error("Error in getProjectInfo", e)
        return { error: e.message }
    })
}