import { BUILDSHIP_API_BASE } from '../../constants';

export const getMerkleProofURL = (merkleID, wallet) =>
    `${BUILDSHIP_API_BASE}/v1.1/extensions/merkle-tree/check/${merkleID}/${wallet}`

export const getFindWhitelistURL = (wallet) =>
    `${BUILDSHIP_API_BASE}/extensions/merkle-tree/airdrops/${wallet}`
