import { createTheme } from "@mui/material";

export const theme = createTheme({
    palette: {
        primary: {
            main: "#55ACEE",
        },
    },
    spacing: [0, 4, 8, 16, 24, 32, 64],
    components: {
        MuiDialog: {
            styleOverrides: {
                paper: {
                    borderRadius: "24px",
                    padding: "16px"
                }
            }
        },
        MuiButton: {
            styleOverrides: {
                root: {
                    boxShadow: "none"
                },
                contained: {
                    padding: "0.5rem 1.5rem",
                    color: "#fff",
                    borderRadius: "30px",
                    "&:hover": {
                        boxShadow: "none"
                    },
                },
            }
        },
    },
    typography: {
        fontFamily: "Inter, San Francisco, Roboto, Helvetica, sans-serif",
        button: {
            color: "#fff",
            fontSize: "1rem !important",
            textTransform: "none",
        },
        h4: {
            fontWeight: 600
        },
        subtitle2: {
            fontWeight: 300,
            lineHeight: 1.3
        }
    },
});
