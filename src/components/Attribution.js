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
        <Box sx={{
            marginLeft: "6px",
            fontSize: 14,
            fontWeight: 400,
            color: (theme) => theme.palette.grey[500],
        }}>Powered by Buildship</Box>
    </Box>
}
