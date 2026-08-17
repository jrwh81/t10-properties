import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";

export function LoadingState() {
  return (
    <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
      <CircularProgress color="primary" />
    </Box>
  );
}

export function ErrorState({ message = "Something went wrong loading this page." }) {
  return (
    <Box sx={{ py: 4 }}>
      <Alert severity="error">{message}</Alert>
    </Box>
  );
}
