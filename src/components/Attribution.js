import { Box, } from '@mui/material';
import { getBaseURL } from '../constants';

export const Attribution = () => {
    return <Box
        onClick={() => window.open("https://buildship.dev")}
        sx={{
            mt: 4,
            cursor: "pointer",
            display: "flex",
            alignItems: "center"
        }}>
        <img width={16} src={`${getBaseURL()}/images/buildship.png`} />
        <span style={{
            marginLeft: 6,
            fontSize: 14,
            fontWeight: 400,
            color: "#757575"
        }}>Powered by Buildship</span>
    </Box>
}
