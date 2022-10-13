import React, { useContext } from 'react';
import { Box, Button, CircularProgress, IconButton, Typography } from '@mui/material';
import { isMetaMaskDesktop } from "../utils";
import { getConfigChainID } from "../web3";
import { NETWORKS } from "../constants";
import { Web3Context } from "./Web3Context";
import { ChevronLeft } from "@mui/icons-material";

export const ConfirmTxStep = ({ txHash, quantity, setIsLoading }) => {
    const [{ wallet, chainID }, setState] = useContext(Web3Context)

    const renderConfirmText = () => {
        if (wallet) {
            console.log("current chainID", chainID)
            if (chainID !== getConfigChainID()) {
                const networkName = NETWORKS[getConfigChainID()]?.name
                return {
                    title: `Switch to ${networkName ?? "correct"} network`,
                    subtitle: <>
                        Open your wallet and switch the network to <b>{networkName ?? "correct one"}</b> to proceed
                    </>
                }
            }
            return {
                title: "Confirm the transaction in your wallet",
                subtitle: <>
                    Wait up to 2-3 sec until the transaction appears in your wallet
                    <br/><br/>
                    {isMetaMaskDesktop() && "If you don't see the Confirm button, scroll down ⬇️"}
                </>
            }
        }
        return {
            title: "Connect your wallet",
            subtitle: <>
                Connect your wallet to confirm the transaction
            </>
        }
    }

    const { title, subtitle } = renderConfirmText()

    return <Box sx={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        width: 300,
        height: 300,
    }}>
        <IconButton
            sx={{
                position: "absolute",
                top: 16,
                left: 16,
                "& .MuiSvgIcon-root": {
                    fontSize: "1.75rem",
                },
                color: (theme) => theme.palette.grey[500],
            }}
            onClick={() => setIsLoading(false)}>
            <ChevronLeft />
        </IconButton>
        {txHash ? <CircularProgress /> : <span style={{
            fontSize: 60,
            lineHeight: 1,
            margin: 0
        }}>
            👀
        </span>}
        <Typography
            sx={{ mt: 3, textAlign: "center" }}
            variant="h4">
            {txHash ? `Minting ${quantity} NFT...` : title}
        </Typography>
        {!txHash && <Typography sx={{
            mt: 3,
            pl: 3,
            pr: 3,
            color: "#757575",
            textAlign: "center"
        }} variant="subtitle2">{subtitle}</Typography>}
    </Box>
}