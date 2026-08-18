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
import Typography from "@mui/material/Typography";
import Alert from "@mui/material/Alert";

const STATUSES = ["draft", "published"];

const EMPTY_FORM = {
  title: "",
  excerpt: "",
  body: "",
  status: "draft"
};

const REQUIRED_FIELDS = ["title", "body"];

// Same reasoning as PropertyFormDialog/DestinationFormDialog: never
// spread a full record into form state (it also carries slug,
// comments_count, author_name, cover_image_url, timestamps, etc.).
function pickFormFields(source) {
  const picked = {};
  for (const key of Object.keys(EMPTY_FORM)) {
    picked[key] = key in source ? source[key] : EMPTY_FORM[key];
  }
  return picked;
}

export default function BlogPostFormDialog({ open, onClose, onSubmit, initialValues }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [coverImageFile, setCoverImageFile] = useState(null);
  const [coverPreviewUrl, setCoverPreviewUrl] = useState(null);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setForm(initialValues ? pickFormFields(initialValues) : EMPTY_FORM);
      setCoverImageFile(null);
      setError(null);
    }
  }, [open, initialValues]);

  // Build (and clean up) an object URL preview whenever a new file is chosen.
  useEffect(() => {
    if (!coverImageFile) {
      setCoverPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(coverImageFile);
    setCoverPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [coverImageFile]);

  const handleChange = (field) => (event) => setForm((prev) => ({ ...prev, [field]: event.target.value }));

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (file) setCoverImageFile(file);
  };

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
      const payload = coverImageFile ? { ...form, cover_image: coverImageFile } : form;
      await onSubmit(payload);
      onClose();
    } catch (submitError) {
      setError(submitError?.response?.data?.errors?.join(", ") || "Could not save this post.");
    } finally {
      setSubmitting(false);
    }
  };

  const displayedPreview = coverPreviewUrl || initialValues?.cover_image_url;

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

            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Cover image
              </Typography>
              {displayedPreview && (
                <Box
                  component="img"
                  src={displayedPreview}
                  alt=""
                  sx={{
                    width: "100%",
                    maxHeight: 200,
                    objectFit: "cover",
                    borderRadius: 1,
                    border: "1px solid",
                    borderColor: "divider",
                    mb: 1,
                    display: "block"
                  }}
                />
              )}
              <Button component="label" variant="outlined" size="small">
                {coverImageFile ? "Change image" : displayedPreview ? "Replace image" : "Choose image"}
                <input type="file" accept="image/*" hidden onChange={handleFileChange} />
              </Button>
            </Box>
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
