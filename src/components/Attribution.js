import { Box, Link, } from '@mui/material';
import { getBaseURL } from '../constants';
import { useEffect, useState } from 'react';
import { NFTContract } from '../contract';

export const Attribution = (props) => {
    const [attributionText, setAttributionText] = useState("")
    const [isBuildshipUser, setIsBuildshipUser] = useState(false)

    useEffect(() => {
        const updateAttribution = async () => {
            try {
                if (Object.keys(NFTContract.methods).includes("DEVELOPER")) {
                    const developer = await NFTContract.methods.DEVELOPER().call()
                    console.log(developer)
                    if (developer.toLowerCase().includes("buildship")) {
                        setAttributionText(_ => "Launched with Buildship")
                        setIsBuildshipUser(true)
                    }
                }
            }
            catch (e) {
                console.log("Couldn't read contract developer")
                console.log(e)
            }
        }

        updateAttribution()
    }, [])

    return <Box sx={{
                display: "flex",
                alignItems: "center",
                flexDirection: "column"
        }}>
        <div style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            width: 24,
            height: 24,
            borderRadius: 24,
        }}>
        </div>
        <Box sx={{
            marginLeft: "2px",
            fontSize: 14,
            fontWeight: 400,
            color: (theme) => theme.palette.grey[500],
        }}>
            {attributionText}
        </Box>
    </Box>
        {isBuildshipUser && <Link sx={{ mt: 1, fontSize: "14px" }} target="_blank" href="https://forms.gle/ytwjDdoGc92YDxhY7">Report fraud</Link>}
    </Box>
}
