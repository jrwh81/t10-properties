import { createTheme } from "@mui/material/styles";

// Palette sampled directly from the T10 Properties LLC logo marks:
// near-black background, a warm gold accent, and white for contrast.
const gold = {
  light: "#e0c98a",
  main: "#c9a961",
  dark: "#a3833f"
};

const ink = {
  main: "#0b0d0f", // logo background black
  paper: "#15171c", // slightly lifted surface
  elevated: "#1d2027"
};

const theme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: gold.main,
      light: gold.light,
      dark: gold.dark,
      contrastText: "#0b0d0f"
    },
    secondary: {
      main: "#ffffff",
      contrastText: "#0b0d0f"
    },
    background: {
      default: ink.main,
      paper: ink.paper
    },
    text: {
      primary: "#f5f3ee",
      secondary: "#b8bcc4"
    },
    divider: "rgba(201, 169, 97, 0.16)",
    success: { main: "#5fae72" },
    warning: { main: "#e0a83d" },
    error: { main: "#e0605a" }
  },
  shape: {
    borderRadius: 10
  },
  typography: {
    fontFamily: '"Inter", "Helvetica Neue", Arial, sans-serif',
    h1: { fontWeight: 800, letterSpacing: "-0.02em" },
    h2: { fontWeight: 800, letterSpacing: "-0.02em" },
    h3: { fontWeight: 700, letterSpacing: "-0.01em" },
    h4: { fontWeight: 700 },
    h5: { fontWeight: 700 },
    h6: { fontWeight: 700 },
    button: { fontWeight: 700, textTransform: "none", letterSpacing: "0.02em" }
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: ink.main,
          backgroundImage: "none",
          borderBottom: `1px solid rgba(201, 169, 97, 0.16)`
        }
      }
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none"
        }
      }
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: ink.paper,
          border: "1px solid rgba(201, 169, 97, 0.14)",
          transition: "transform 160ms ease, border-color 160ms ease",
          "&:hover": {
            borderColor: "rgba(201, 169, 97, 0.5)"
          }
        }
      }
    },
    MuiButton: {
      styleOverrides: {
        containedPrimary: {
          boxShadow: "none",
          "&:hover": { boxShadow: "none", backgroundColor: gold.light }
        },
        outlinedPrimary: {
          borderColor: gold.main
        }
      }
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 700
        }
      }
    }
  }
});

export default theme;
