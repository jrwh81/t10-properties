import { useState } from "react";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import Container from "@mui/material/Container";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Alert from "@mui/material/Alert";
import Link from "@mui/material/Link";
import Box from "@mui/material/Box";
import { useAuth } from "../context/AuthContext";

export default function SignupPage() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", passwordConfirmation: "" });
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (field) => (event) => setForm((prev) => ({ ...prev, [field]: event.target.value }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await signup(form);
      navigate("/");
    } catch (submitError) {
      setError(submitError?.response?.data?.errors?.join(", ") || "Could not create an account.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Container maxWidth="xs" sx={{ py: 10 }}>
      <Paper sx={{ p: 4 }}>
        <Box sx={{ display: "flex", justifyContent: "center", mb: 3 }}>
          <Box component="img" src="/logos/logo-d-lettermark.png" alt="T10 Properties LLC" sx={{ height: 56, width: "auto" }} />
        </Box>
        <Typography variant="h4" component="h1" gutterBottom>
          Create an account
        </Typography>
        <Box component="form" onSubmit={handleSubmit}>
          <Stack spacing={2}>
            {error && <Alert severity="error">{error}</Alert>}
            <TextField label="Name" value={form.name} onChange={handleChange("name")} required fullWidth />
            <TextField
              label="Email"
              type="email"
              value={form.email}
              onChange={handleChange("email")}
              required
              fullWidth
            />
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
              {submitting ? "Creating account..." : "Sign up"}
            </Button>
          </Stack>
        </Box>
        <Typography variant="body2" sx={{ mt: 3 }}>
          Already have an account? <Link component={RouterLink} to="/login">Log in</Link>
        </Typography>
      </Paper>
    </Container>
  );
}
