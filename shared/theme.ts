import {createTheme} from '@mui/material/styles';

export const theme = createTheme({
    typography: {
        fontFamily: ['Monument Grotesk Mono', 'Monaco', 'Courier', 'monospace'].join(', '),
    },
    palette: {
        primary: {
            main: '#fff',
        },
        secondary: {
            main: '#fff',
        },
    },
});
