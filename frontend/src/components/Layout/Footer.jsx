import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

export default function Footer() {
  return (
    <Box component="footer" sx={{ borderTop: "1px solid", borderColor: "divider", mt: 8, py: 5 }}>
      <Container maxWidth="lg">
        <Stack alignItems="center" spacing={2}>
          <Box
            component="img"
            src="/logos/logo-a-badge.png"
            alt="T10 Properties LLC"
            sx={{ height: 96, width: "auto" }}
          />
          <Typography variant="body2" color="text.secondary" align="center">
            &copy; {new Date().getFullYear()} T10 Properties LLC. Pittsburgh, PA.
          </Typography>
        </Stack>
      </Container>
    </Box>
  );
}
