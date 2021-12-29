import React, { useEffect, useState } from 'react';
import { Box, Button, CircularProgress, DialogContent, Slider } from '@mui/material';
import { getDefaultMaxTokensPerMint, getMaxTokensPerMint, mint } from '../mint/web3';
import { showAlert } from './AutoHideAlert';
import { parseTxError } from '../utils';
import { Attribution } from './Attribution';
import { getCurrentNetwork } from '../wallet';

export const QuantityModalStep = ({ setQuantity, setStep, setIsLoading, setTxHash }) => {
    const [quantityValue, setQuantityValue] = useState(1)
    const [maxTokens, setMaxTokens] = useState(getDefaultMaxTokensPerMint())

    useEffect(() => {
        getMaxTokensPerMint().then(setMaxTokens)
    }, [])

    const step = maxTokens <= 5 ? maxTokens : 10
    const marks = [...Array(Math.floor(maxTokens / step) + 1)]
        .map((_, i) => 1 + i * step)
        .map(m => ({
            value: Math.max(1, m - 1),
            label: (Math.max(1, m - 1)).toString()
        }))

    const onSuccess = async () => {
        if (window.CONTRACT.nft.allowedNetworks[0] === 137) {
            setStep(2)
            return
        }

        setIsLoading(true)
        const { tx } = await mint(quantityValue)
        tx.on("transactionHash", (hash) => {
            setTxHash(hash)
        }).on("confirmation", async () => {
            setIsLoading(false)
            showAlert(`Successfully minted ${quantityValue} NFTs`, "success")
        }).on("error", (e) => {
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
            sx={{ mt: 4 }}
            variant="contained"
        >
            Mint now
        </Button>
        <Attribution />
    </div>
}
