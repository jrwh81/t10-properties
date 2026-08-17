import { useEffect, useState } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";
import Alert from "@mui/material/Alert";

const STATUSES = ["draft", "published"];

const EMPTY_FORM = {
  title: "",
  excerpt: "",
  body: "",
  status: "draft"
};

const REQUIRED_FIELDS = ["title", "body"];

export default function BlogPostFormDialog({ open, onClose, onSubmit, initialValues }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setForm(initialValues ? { ...EMPTY_FORM, ...initialValues } : EMPTY_FORM);
      setError(null);
    }
  }, [open, initialValues]);

  const handleChange = (field) => (event) => setForm((prev) => ({ ...prev, [field]: event.target.value }));

  const handleSubmit = async (event) => {
    event.preventDefault();

    const missing = REQUIRED_FIELDS.filter((field) => !String(form[field] ?? "").trim());
    if (missing.length > 0) {
      setError("Please fill in a title and body before saving.");
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      await onSubmit(form);
      onClose();
    } catch (submitError) {
      setError(submitError?.response?.data?.errors?.join(", ") || "Could not save this post.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{initialValues ? "Edit post" : "New post"}</DialogTitle>
      <Box component="form" onSubmit={handleSubmit}>
        <DialogContent>
          <Stack spacing={2}>
            {error && <Alert severity="error">{error}</Alert>}

            <TextField label="Title" value={form.title} onChange={handleChange("title")} fullWidth />
            <TextField
              label="Excerpt"
              value={form.excerpt ?? ""}
              onChange={handleChange("excerpt")}
              fullWidth
              helperText="Shown on the blog listing card"
            />
            <TextField
              label="Body"
              value={form.body}
              onChange={handleChange("body")}
              fullWidth
              multiline
              minRows={8}
            />
            <TextField select label="Status" value={form.status} onChange={handleChange("status")} fullWidth>
              {STATUSES.map((status) => (
                <MenuItem key={status} value={status}>
                  {status}
                </MenuItem>
              ))}
            </TextField>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} color="inherit">
            Cancel
          </Button>
          <Button type="submit" variant="contained" color="primary" disabled={submitting}>
            {submitting ? "Saving..." : "Save"}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}
