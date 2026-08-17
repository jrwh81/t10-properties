import { Link as RouterLink } from "react-router-dom";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";

export default function NotFoundPage() {
  return (
    <Container maxWidth="sm" sx={{ py: 14, textAlign: "center" }}>
      <Stack spacing={2} alignItems="center">
        <Typography variant="h1" color="primary.main" sx={{ fontSize: "4rem" }}>
          404
        </Typography>
        <Typography variant="h5">We couldn&apos;t find that page.</Typography>
        <Button component={RouterLink} to="/" variant="contained" color="primary">
          Back home
        </Button>
      </Stack>
    </Container>
  );
}
