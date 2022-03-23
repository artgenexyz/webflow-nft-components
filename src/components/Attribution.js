import { Box, } from '@mui/material';
import { getBaseURL } from '../constants';

export const Attribution = (props) => {
    return <Box
        onClick={() => window.open("https://buildship.xyz")}
        sx={{
            mt: 4,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            ...props?.sx
        }}>
        {/* for SEO */}
        <a href="https://buildship.xyz" />
        <div style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            width: 24,
            height: 24,
            borderRadius: 24,
        }}>
            <img
                width={14}
                src={`${getBaseURL()}/images/buildship${window.STYLES?.theme === "dark" ? "-white" : ""}.svg`}
            />
        </div>
        <Box sx={{
            marginLeft: "2px",
            fontSize: 14,
            fontWeight: 400,
            color: (theme) => theme.palette.grey[500],
        }}>
            Widget by Buildship
        </Box>
    </Box>
}
