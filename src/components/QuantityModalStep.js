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
import { getPresaleMaxPerAddress, mint as mintWhitelist } from '../mint/whitelist/web3'
import { showAlert } from './AutoHideAlert';
import { parseTxError, roundToDecimal } from '../utils';
import { Attribution } from './Attribution';
import { sendEvent } from '../analytics';
import { isEthereumContract } from "../contract";
import { useProject } from "../hooks/useProject";
import { WinterButton } from "./WinterButton";

export const QuantityModalStep = ({
      launchType, setQuantity, setStep,
      setIsOpen, setIsLoading, setTxHash
}) => {
    const [quantityValue, setQuantityValue] = useState(1)
    const [maxTokens, setMaxTokens] = useState(getDefaultMaxTokensPerMint())
    const [mintPrice, setMintPrice] = useState(undefined)
    const [mintedNumber, setMintedNumber] = useState()
    const [totalNumber, setTotalNumber] = useState()
    const project = useProject()

    useEffect(() => {
        if (isEthereumContract() && launchType !== "whitelist") {
            getMintPrice().then(price => {
                if (price !== undefined) {
                    setMintPrice(Number((price) / 1e18))
                }
            })
        }

        (launchType === "whitelist" ? getPresaleMaxPerAddress : getMaxTokensPerMint)()
            .then(setMaxTokens)

        if (!window.DEFAULTS?.hideCounter) {
            getMintedNumber().then(setMintedNumber)
            getMaxSupply().then(setTotalNumber)
        }
    }, [])

    const mintWithLaunchType = (quantity) => {
        return launchType === "whitelist" ? mintWhitelist(quantity) : mint(quantity)
    }

    const maxTokensTooLarge = maxTokens >= 20
    const step = !maxTokensTooLarge ? maxTokens : 10
    const marks = [
        ...[...Array(Math.floor(maxTokens / step) + 1)].map((_, i) => 1 + i * step),
        ...(maxTokensTooLarge ? [maxTokens + 1] : [])
        ].map(m => ({
            value: Math.max(1, m - 1),
            label: (Math.max(1, m - 1)).toString()
        }))

    const onSuccess = async () => {
        sendEvent(window.analytics, 'public-sale-mint-button-click', {})

        setIsLoading(true)
        const { tx } = await mintWithLaunchType(quantityValue)
        if (tx === undefined) {
            setIsLoading(false)
        }
        tx?.on("transactionHash", (hash) => {
            setTxHash(hash)
        })?.on("confirmation", async () => {
            setIsLoading(false)
            showAlert(`Successfully minted ${quantityValue} NFTs${window.DEFAULTS?.redirectURL ? ". You will be redirected in less than a second" : ""}`, "success")
            sendEvent(window.analytics, `${launchType}-mint-success`, {})
            // TODO: show success state in the modal
            if (window.DEFAULTS?.redirectURL) {
                setTimeout(() => {
                    window.location.href = window.DEFAULTS?.redirectURL
                }, 800)
            }
        })?.on("error", (e) => {
            setIsLoading(false)
            const { code, message } = parseTxError(e);
            if (code !== 4001) {
                showAlert(`Minting error: ${message}. Please try again or contact us`, "error");
                sendEvent(window.analytics, `${launchType}-mint-error`, { error: message })
            } else {
                sendEvent(window.analytics, `${launchType}-mint-rejected`, { error: message })
            }
        })
    }

    return <div style={{ width: "100%" }}>
        {maxTokens > 1 && <Box sx={{
            display: "flex",
            alignItems: "flex-end",
            width: "100%",
            height: 64
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
        </Box>}
        <Box sx={{ display: "flex", flexDirection: "column" }}>
            <Button
                onClick={onSuccess}
                sx={{ mt: maxTokens > 1 ? 4 : 2, width: "100%" }}
                variant="contained">
                {mintPrice !== undefined
                    ? (mintPrice !== 0 ? `Mint for ${roundToDecimal(mintPrice * quantityValue, 4)} ETH` : "Mint for free")
                    : "Mint"}
            </Button>
            <WinterButton project={project} quantity={quantityValue} launchType={launchType} />
        </Box>
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
