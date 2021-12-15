import { setButtonText } from '../ui';
import { showAlert } from '../../components/AutoHideAlert';
import { parseTxError } from '../../utils';
import { mint } from './web3';

export const updateMintWhitelistButton = () => {
    const mintButton = document.querySelector('#mint-whitelist');
    if (mintButton) {
        mintButton.onclick = async () => {
            const initialBtnText = mintButton.textContent;
            setButtonText(mintButton, "Loading...")
            await mint(1).then((r) => {
                setButtonText(mintButton, initialBtnText);
                console.log(r);
                showAlert(`Successfully minted 1 NFTs`, "success")
            }).catch((e) => {
                console.log(e)
                setButtonText(mintButton, initialBtnText);
                const { code, message } = parseTxError(e);
                if (e && code !== 4001) {
                    showAlert(`Minting error: ${message}. Please try again or contact us`, "error");
                }
            })
        }
    }
}
