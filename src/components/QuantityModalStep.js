import React, { useEffect, useState } from 'react';
import { Box, Button, Skeleton, Slider } from '@mui/material';
import {
    getMaxSupply,
    getMaxTokensPerMint,
    getMintedNumber,
    getMintPrice,
    mint
} from '../mint/web3';
import { showAlert } from './AutoHideAlert';
import { parseTxError, roundToDecimal } from '../utils';
import { Attribution } from './Attribution';
import { isEthereumContract } from "../contract";

export const QuantityModalStep = ({ setQuantity, setIsLoading, setTxHash, state, setState }) => {
    const [quantityValue, setQuantityValue] = useState(1)
    const [maxTokens, setMaxTokens] = useState(undefined)
    const [mintPrice, setMintPrice] = useState(undefined)
    const [mintedNumber, setMintedNumber] = useState()
    const [totalNumber, setTotalNumber] = useState()

    useEffect(() => {
        if (isEthereumContract()) {
            getMintPrice().then(price => {
                if (price !== undefined) {
                    setMintPrice(Number((price) / 1e18))
                }
            })
        }
        getMaxTokensPerMint().then(setMaxTokens)
        if (!window.DEFAULTS?.hideCounter) {
            getMintedNumber().then(setMintedNumber)
            getMaxSupply().then(setTotalNumber)
        }
    }, [])

    const maxRange = maxTokens ?? 10
    const maxTokensTooLarge = maxRange >= 20
    const step = !maxTokensTooLarge ? Math.max(maxRange, 1) : 10
    const marks = [
        ...[...Array(Math.floor(maxRange / step) + 1)].map((_, i) => 1 + i * step),
        ...(maxTokensTooLarge ? [maxRange + 1] : [])
        ].map(m => ({
            value: Math.max(1, m - 1),
            label: (maxTokens !== undefined || m === 1)
                ? (Math.max(1, m - 1)).toString()
                : <Skeleton width="10px" height="30px" sx={{ mt: -2 }} />
        }))

    const onSuccess = async () => {
        setIsLoading(true)
        const { tx } = await mint(quantityValue, {
            onConnectSuccess: (wallet) => setState({ ...state, wallet }),
            setState: (wallet, chainID) => setState({ wallet, chainID })
        })
        if (tx === undefined) {
            setIsLoading(false)
        }
        tx?.once("transactionHash", (hash) => {
            setTxHash(hash)
        })?.once("confirmation", async () => {
            setIsLoading(false)
            setTxHash(undefined)
            showAlert(`Successfully minted ${quantityValue} NFTs${window.DEFAULTS?.redirectURL ? ". You will be redirected in less than a second" : ""}`, "success")
            // TODO: show success state in the modal
            if (window.DEFAULTS?.redirectURL) {
                setTimeout(() => {
                    window.location.href = window.DEFAULTS?.redirectURL
                }, 800)
            }
        })?.once("error", (e) => {
            setIsLoading(false)
            const { code, message } = parseTxError(e);
            if (code !== 4001) {
                showAlert(`Minting error: ${message}. Please try again or contact us`, "error");
            }
        })
    }

    return <div style={{ width: "100%" }}>
        {maxRange > 1 && <Box sx={{
            display: "flex",
            alignItems: "flex-end",
            width: "100%",
            height: 64
        }}>
            <Slider
                sx={{ ml: 2 }}
                disabled={maxTokens === undefined}
                aria-label="Quantity"
                defaultValue={1}
                valueLabelDisplay="auto"
                onChange={(e, v) => {
                    setQuantity(v)
                    setQuantityValue(v)
                }}
                step={1}
                marks={marks}
                min={1}
                max={maxRange}
            />
        </Box>}
        <Button
            onClick={onSuccess}
            sx={{ mt: maxRange > 1 ? 4 : 2, width: "100%" }}
            variant="contained"
        >
            {mintPrice !== undefined
                ? (mintPrice !== 0 ? `Mint for ${roundToDecimal(mintPrice * quantityValue, 4)} ETH` : "Mint for free")
                : "Mint"}
        </Button>
        {!window.DEFAULTS?.hideCounter && <Box
            sx={{
                color: (theme) => theme.palette.grey[500],
                display: "flex",
                fontWeight: 400,
                fontSize: 14,
                justifyContent: "center",
                mt: 2
            }}>
            <span>{mintedNumber ?? "-"}</span>
            <span style={{ margin: "0 2px"}}>/</span>
            <span>{totalNumber ?? "-"}</span>
        </Box>}
        <Attribution sx={{ mt: 3, justifyContent: "center" }} />
    </div>
}
