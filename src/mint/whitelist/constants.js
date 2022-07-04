import { BUILDSHIP_API_BASE } from '../../constants';

export const getMerkleProofURL = (merkleID, wallet) =>
    `${BUILDSHIP_API_BASE}/extensions/merkle-tree/check/${merkleID}/${wallet}`

export const getFindWhitelistURL = (wallet) =>
    `${BUILDSHIP_API_BASE}/extensions/merkle-tree/airdrops/${wallet}`

export const getFindWhitelistURLbyNFT = (nft) =>
    `${BUILDSHIP_API_BASE}/extensions/merkle-tree/by-nft/${nft}?fullList=true`
