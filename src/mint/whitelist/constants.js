export const getMerkleProofURL = (merkleID, wallet) =>
    `https://buildship-metadata-git-feature-merkle-tree-buildship.vercel.app/api/merkle-tree/check/${merkleID}/${wallet}`
