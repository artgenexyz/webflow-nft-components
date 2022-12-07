import { getConfigChainID, readOnlyWeb3 } from "../../web3";
import { ExtensionContract, fetchABI } from "../../contract";

class _MintPassExtensionHandler {

    _getNFTsOfOwnerMoralis = async ({ wallet, contract_address }) => {
        const apiKey = process.env.REACT_APP_MORALIS_API_KEY
        if (!apiKey) {
            alert("Moralis setup error: missing API key. Contact Buildship support to resolve this")
            return
        }
        const chain = `0x${getConfigChainID().toString(16)}`
        const walletNFTs = await fetch(`https://deep-index.moralis.io/api/v2/${wallet}/nft/${contract_address}?chain=${chain}`, {
            headers: {
                "Accept": "application/json",
                "X-API-Key": apiKey
            }
        }).then(r => r.json())
        console.log(walletNFTs)
        return walletNFTs
    }

    getNFTsOfOwner = async ({ wallet, contract_address }) => {
        const abi = await fetchABI(contract_address, getConfigChainID())
        const contract = new readOnlyWeb3.eth.Contract(abi, contract_address)
        if (contract.methods.walletOfOwner) {
            return contract.methods.walletOfOwner().call()
        }
        return this._getNFTsOfOwnerMoralis({
            wallet,
            contract_address: contract._address
        })?.then(r => r?.result?.map(t => Number(t.token_id)))
    }

    _checkIfPassRedeemed = async (pass_id) => {
        return ExtensionContract.methods.usedTokenIds(pass_id).call()
    }

    filterRedeemedPasses = async (passes) => {
        const passesIsRedeemed = await Promise.all(passes.map(id => this._checkIfPassRedeemed(id)))
        console.log("passesIsRedeemed", passesIsRedeemed)
        return passes.filter((p, idx) => !passesIsRedeemed[idx])
    }

    fetchOrGetHelperValues = async (wallet) => {
        this.passAddress = this.passAddress
            ?? await ExtensionContract.methods.mintPassAddress().call()
        this.nftsOfOwner = this.nftsOfOwner ? this.nftsOfOwner : {
            [wallet]: await this.getNFTsOfOwner({
                wallet, contract_address: this.passAddress
            })
        }
        this.usablePasses = this.usablePasses
            ?? await this.filterRedeemedPasses(this.nftsOfOwner[wallet])
        console.log(`Passes owned (${this.passAddress}):`, this.nftsOfOwner )
        return { nftsOfOwner: this.nftsOfOwner, passAddress: this.passAddress, usablePasses: this.usablePasses }
    }

    isExtensionMintPass = () => {
        return !!ExtensionContract?.methods?.mintPassAddress
    }

    hasMintPasses = async (wallet) => {
        await this.fetchOrGetHelperValues(wallet)
        return (this.usablePasses ?? []).length > 0
    }

    getMaxPerTx = async (wallet) => {
        await this.fetchOrGetHelperValues(wallet)
        return (this.usablePasses ?? []).length
    }

    getMintTx = async ({ wallet, numberOfTokens }) => {
        const { nftsOfOwner, usablePasses } = await this.fetchOrGetHelperValues(wallet)
        console.log("nftsOfOwner", nftsOfOwner)
        const passesToUse = usablePasses.slice(0, numberOfTokens)
        if (!passesToUse?.length) {
            alert("This wallet does not have mint passes to use.")
            return null
        }
        console.log("using passes", passesToUse)
        return ExtensionContract.methods.mint(passesToUse)
    }
}

export const MintPassExtensionHandler = new _MintPassExtensionHandler()