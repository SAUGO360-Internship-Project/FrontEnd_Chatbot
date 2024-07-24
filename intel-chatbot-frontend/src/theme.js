import { createTheme } from '@mui/material/styles';


const theme = createTheme({
    palette: {
        primary: {
            main: '#914F1E',
        },
        secondary: {
            main: '#BEC6A0',
        },
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    // Define button styles here
                    color: 'white',
                    backgroundColor: '#DEAC80',
                    '&:hover': {
                        backgroundColor: '#B5C18E',
                    },
                },
            },
        },
        MuiAppBar: {
            styleOverrides: {
                root: {
                    // Define AppBar styles here
                    backgroundColor: '#B5C18E',
                },
            },
        },
    },
});

export default theme;
