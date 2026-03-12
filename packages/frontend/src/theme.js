import { alpha, createTheme } from '@mui/material/styles';

export const appTheme = createTheme({
    palette: {
        mode: 'light',
        primary: {
            main: '#7ba7b5',
            light: '#d8eaee',
            dark: '#547784',
            contrastText: '#17333b',
        },
        secondary: {
            main: '#d99982',
            light: '#f7dfd6',
            dark: '#a8644f',
            contrastText: '#432019',
        },
        success: {
            main: '#88a98f',
            light: '#ddebdc',
            dark: '#5e7663',
            contrastText: '#1f2e21',
        },
        warning: {
            main: '#daa866',
            light: '#faeccd',
            dark: '#9a6c2d',
            contrastText: '#3f2c0a',
        },
        error: {
            main: '#cb7d70',
            light: '#f5d8d1',
            dark: '#8e4f45',
            contrastText: '#361814',
        },
        background: {
            default: '#fffaf4',
            paper: '#fffdf9',
        },
        text: {
            primary: '#27343c',
            secondary: '#58666f',
        },
    },
    typography: {
        fontFamily: '"Avenir Next", "Trebuchet MS", Verdana, sans-serif',
        h1: {
            fontSize: 'clamp(2.6rem, 7vw, 4.6rem)',
            fontWeight: 800,
            letterSpacing: '-0.04em',
            lineHeight: 0.95,
        },
        h2: {
            fontSize: 'clamp(1.8rem, 4vw, 2.5rem)',
            fontWeight: 800,
            letterSpacing: '-0.03em',
        },
        h5: {
            fontWeight: 700,
            letterSpacing: '-0.02em',
        },
        button: {
            fontWeight: 700,
            letterSpacing: '-0.01em',
            textTransform: 'none',
        },
    },
    shape: {
        borderRadius: 24,
    },
    components: {
        MuiCssBaseline: {
            styleOverrides: {
                body: {
                    minHeight: '100vh',
                    backgroundColor: '#fffaf4',
                    color: '#27343c',
                },
                '#root': {
                    minHeight: '100vh',
                },
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    backgroundImage: 'none',
                    backgroundColor: alpha('#fffdf9', 0.86),
                    border: `1px solid ${alpha('#7ba7b5', 0.12)}`,
                    boxShadow: '0 24px 80px rgba(97, 116, 127, 0.12)',
                },
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    backgroundImage: 'none',
                    backgroundColor: alpha('#fffefb', 0.92),
                    border: `1px solid ${alpha('#7ba7b5', 0.16)}`,
                    boxShadow: '0 18px 42px rgba(97, 116, 127, 0.12)',
                },
            },
        },
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: 999,
                    paddingInline: 18,
                },
                contained: {
                    boxShadow: 'none',
                },
            },
        },
        MuiChip: {
            styleOverrides: {
                root: {
                    borderRadius: 999,
                    fontWeight: 700,
                },
            },
        },
        MuiOutlinedInput: {
            styleOverrides: {
                root: {
                    borderRadius: 18,
                    backgroundColor: alpha('#ffffff', 0.82),
                },
            },
        },
        MuiDialog: {
            styleOverrides: {
                paper: {
                    borderRadius: 28,
                },
            },
        },
        MuiToggleButtonGroup: {
            styleOverrides: {
                grouped: {
                    margin: 0,
                    border: 0,
                    borderRadius: 999,
                },
            },
        },
        MuiToggleButton: {
            styleOverrides: {
                root: {
                    borderRadius: 999,
                    paddingInline: 16,
                    color: '#58666f',
                    fontWeight: 700,
                    textTransform: 'none',
                    '&.Mui-selected': {
                        backgroundColor: alpha('#7ba7b5', 0.22),
                        color: '#17333b',
                    },
                    '&.Mui-selected:hover': {
                        backgroundColor: alpha('#7ba7b5', 0.28),
                    },
                },
            },
        },
    },
});