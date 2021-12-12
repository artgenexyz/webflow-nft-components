import { BASE_URL } from '../constants';
import { mintViaWebill } from '../mint/bridge';
import { mint } from '../mint/web3';
import { showAlert } from './AutoHideAlert';
import { parseTxError } from '../utils';
import { Box, Typography } from '@mui/material';
import React from 'react';

export const PaymentModalStep = ({ quantity }) => {
    const paymentOptions = [{
        title: "ETH",
        subtitle: "Via Webill",
        fee: "1% fee",
        image: `${BASE_URL}/images/eth-logo.svg`,
        onClick: async () => {
            await mintViaWebill(quantity ?? 1, 137)
        }
    }, {
        title: "MATIC",
        subtitle: "Via Polygon",
        fee: "",
        image: `${BASE_URL}/images/polygon-logo.svg`,
        onClick: async () => {
            await mint(quantity ?? 1).then((r) => {
                showAlert(`Successfully minted ${1} NFTs`, "success")
            }).catch((e) => {
                const { code, message } = parseTxError(e);
                if (code !== 4001) {
                    showAlert(`Minting error: ${message}. Please try again or contact us`, "error");
                }
            })
        }
    }]
    return <>
        {paymentOptions.map((option) =>
            <Box sx={styles.mintOption} onClick={option.onClick}>
                <img width="128" src={option.image} />
                <Typography sx={{ mt: 2 }} variant="h6">{option.title}</Typography>
                <Typography variant="subtitle2">{option.subtitle}</Typography>
                <Typography variant="subtitle2">{option.fee}</Typography>
            </Box>
        )}
    </>
}

const styles = {
    mintModalContent: {
        paddingTop: "8px",
        display: "flex",
        flexWrap: "wrap",
        flexDirection: "row"
    },
    mintOption: {
        padding: "16px",
        marginLeft: "12px",
        marginRight: "12px",
        textAlign: "center",

        ":hover": {
            cursor: "pointer",
            backgroundColor: "rgba(0, 0, 0, 0.04)",
            borderRadius: "16px"
        }
    },
}
