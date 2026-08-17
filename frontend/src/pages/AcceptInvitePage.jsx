import { useState } from "react";
import { useParams } from "react-router-dom";
import Container from "@mui/material/Container";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import { acceptAdminInvitation } from "../api/adminInvitations";

export default function AcceptInvitePage() {
  const { token } = useParams();
  const [form, setForm] = useState({ name: "", password: "", passwordConfirmation: "" });
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const handleChange = (field) => (event) => setForm((prev) => ({ ...prev, [field]: event.target.value }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await acceptAdminInvitation(token, {
        name: form.name,
        password: form.password,
        password_confirmation: form.passwordConfirmation
      });
      setDone(true);
      // Full reload so AuthContext bootstraps fresh from the token that
      // was just stored, then lands the new admin on their dashboard.
      window.setTimeout(() => window.location.assign("/admin/properties"), 800);
    } catch (submitError) {
      setError(
        submitError?.response?.data?.errors?.join(", ") ||
          submitError?.response?.data?.error ||
          "Could not accept this invitation."
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <Container maxWidth="xs" sx={{ py: 10, textAlign: "center" }}>
        <Typography variant="h5" gutterBottom>
          Welcome aboard!
        </Typography>
        <Typography color="text.secondary">Taking you to the admin dashboard...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="xs" sx={{ py: 10 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Accept invitation
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 3 }}>
          Set your name and password to activate your admin account.
        </Typography>
        <Box component="form" onSubmit={handleSubmit}>
          <Stack spacing={2}>
            {error && <Alert severity="error">{error}</Alert>}
            <TextField label="Name" value={form.name} onChange={handleChange("name")} required fullWidth />
            <TextField
              label="Password"
              type="password"
              value={form.password}
              onChange={handleChange("password")}
              required
              fullWidth
              helperText="At least 8 characters"
            />
            <TextField
              label="Confirm password"
              type="password"
              value={form.passwordConfirmation}
              onChange={handleChange("passwordConfirmation")}
              required
              fullWidth
            />
            <Button type="submit" variant="contained" color="primary" disabled={submitting} size="large">
              {submitting ? "Activating..." : "Activate account"}
            </Button>
          </Stack>
        </Box>
      </Paper>
    </Container>
  );
}
