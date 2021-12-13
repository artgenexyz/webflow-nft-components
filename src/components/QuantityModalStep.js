import React, { useEffect, useState } from 'react';
import { Box, Button, Slider } from '@mui/material';
import { getMaxTokensPerMint, mint } from '../mint/web3';
import { showAlert } from './AutoHideAlert';
import { parseTxError } from '../utils';
import { Attribution } from './Attribution';
import { getCurrentNetwork } from '../wallet';

export const QuantityModalStep = ({ setQuantity, setStep }) => {
    const [value, setValue] = useState(1)
    const [maxTokens, setMaxTokens] = useState(50)

    useEffect(() => {
        getMaxTokensPerMint().then(setMaxTokens)
    }, [])

    const marks = [...Array(Math.floor(maxTokens / 10) + 1)]
        .map((_, i) => 1 + i * 10)
        .map(m => ({
            value: Math.max(1, m - 1),
            label: (Math.max(1, m - 1)).toString()
        }))

    const onSuccess = () => {
        if (window.CONTRACT.nft.allowedNetworks[0] === 137) {
            setStep(2)
            return
        }

        mint(value).then((r) => {
            showAlert(`Successfully minted ${value} NFTs`, "success")
        }).catch((e) => {
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
                    setValue(v)
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
