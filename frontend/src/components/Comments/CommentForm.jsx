import { useState } from "react";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Alert from "@mui/material/Alert";
import { useAuth } from "../../context/AuthContext";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function CommentForm({ onSubmit, parentId = null, submitLabel = "Post comment", onCancel }) {
  const { isAuthenticated } = useAuth();
  const [body, setBody] = useState("");
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const validate = () => {
    if (!body.trim()) return "Please write a comment before posting.";
    if (!isAuthenticated) {
      if (!guestName.trim()) return "Please enter your name.";
      if (!EMAIL_PATTERN.test(guestEmail)) return "Please enter a valid email address.";
    }
    return null;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    setSubmitting(true);
    try {
      await onSubmit({
        body: body.trim(),
        guest_name: isAuthenticated ? undefined : guestName.trim(),
        guest_email: isAuthenticated ? undefined : guestEmail.trim(),
        parent_id: parentId
      });
      setBody("");
      setGuestName("");
      setGuestEmail("");
    } catch (submitError) {
      setError(submitError?.response?.data?.errors?.join(", ") || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate>
      <Stack spacing={2}>
        {error && <Alert severity="error">{error}</Alert>}

        {!isAuthenticated && (
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <TextField
              label="Name"
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              size="small"
              fullWidth
              required
            />
            <TextField
              label="Email"
              type="email"
              value={guestEmail}
              onChange={(e) => setGuestEmail(e.target.value)}
              size="small"
              fullWidth
              required
              helperText="Not published"
            />
          </Stack>
        )}

        <TextField
          label="Add a comment"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          multiline
          minRows={3}
          fullWidth
          required
        />

        <Stack direction="row" spacing={1}>
          <Button type="submit" variant="contained" color="primary" disabled={submitting}>
            {submitting ? "Posting..." : submitLabel}
          </Button>
          {onCancel && (
            <Button type="button" onClick={onCancel} color="inherit">
              Cancel
            </Button>
          )}
        </Stack>
      </Stack>
    </Box>
  );
}
