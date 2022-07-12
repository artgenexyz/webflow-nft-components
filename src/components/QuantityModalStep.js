import React, { useEffect, useState } from 'react';
import { Box, Button, Slider } from '@mui/material';
import {
    getDefaultMaxTokensPerMint,
    getMaxSupply,
    getMaxTokensPerMint,
    getMintedNumber,
    getMintPrice,
    mint
} from '../mint/web3';
import { showAlert } from './AutoHideAlert';
import { parseTxError } from '../utils';
import { Attribution } from './Attribution';
import { isEthereumContract } from "../contract";

export const QuantityModalStep = ({ setQuantity, setStep, setIsLoading, setTxHash }) => {
    const [quantityValue, setQuantityValue] = useState(1)
    const [maxTokens, setMaxTokens] = useState(getDefaultMaxTokensPerMint())
    const [mintPrice, setMintPrice] = useState(undefined)
    const [mintedNumber, setMintedNumber] = useState()
    const [totalNumber, setTotalNumber] = useState()

    useEffect(() => {
        if (isEthereumContract()) {
            getMintPrice().then(price => {
                if (price !== undefined)
                    setMintPrice(Math.round(price / 1e18))
            })
        }
        getMaxTokensPerMint().then(setMaxTokens)
        if (!window.DEFAULTS?.hideCounter) {
            getMintedNumber().then(setMintedNumber)
            getMaxSupply().then(setTotalNumber)
        }
    }, [])

    const step = maxTokens <= 5 ? maxTokens : 10
    const marks = [...Array(Math.floor(maxTokens / step) + 1)]
        .map((_, i) => 1 + i * step)
        .map(m => ({
            value: Math.max(1, m - 1),
            label: (Math.max(1, m - 1)).toString()
        }))

    const onSuccess = async () => {
        setIsLoading(true)
        const { tx } = await mint(quantityValue)
        if (tx === undefined) {
            setIsLoading(false)
        }
        tx?.on("transactionHash", (hash) => {
            setTxHash(hash)
        })?.on("confirmation", async () => {
            setIsLoading(false)
            showAlert(`Successfully minted ${quantityValue} NFTs`, "success")
        })?.on("error", (e) => {
            setIsLoading(false)
            const { code, message } = parseTxError(e);
            if (code !== 4001) {
                showAlert(`Minting error: ${message}. Please try again or contact us`, "error");
            }
        })
    }

    return <div style={{ width: "100%" }}>
        <Box sx={{
            display: "flex",
            alignItems: "flex-end",
            width: "100%",
            height: 75
        }}>
            <Slider
                sx={{ ml: 2 }}
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
                max={maxTokens}
            />
        </Box>
        <Button
            onClick={onSuccess}
            sx={{ mt: 4, width: "100%" }}
            variant="contained"
        >
            {mintPrice !== undefined
                ? (mintPrice !== 0 ? `Mint for ${mintPrice} ETH` : "Mint for free")
                : "Mint now"}
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
