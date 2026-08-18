import { useEffect, useState } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import FormControlLabel from "@mui/material/FormControlLabel";
import Switch from "@mui/material/Switch";
import Alert from "@mui/material/Alert";
import PhotoManager from "./PhotoManager";

const CATEGORIES = ["restaurant", "outdoors", "nightlife", "museum", "shopping", "lodging", "other"];

const EMPTY_FORM = {
  name: "",
  description: "",
  address: "",
  city: "",
  state: "",
  category: "restaurant",
  t10_rating: "",
  featured: false
};

const REQUIRED_FIELDS = ["name", "description", "city", "state", "t10_rating"];

// See PropertyFormDialog for why this matters: never spread a full
// record into form state, since `photos` riding along in an update
// payload silently wipes every attached photo (has_many_attached
// assignment REPLACES, it doesn't append).
function pickFormFields(source) {
  const picked = {};
  for (const key of Object.keys(EMPTY_FORM)) {
    picked[key] = key in source ? source[key] : EMPTY_FORM[key];
  }
  return picked;
}

export default function DestinationFormDialog({ open, onClose, onCreate, onUpdate, onUploadPhotos, onDeletePhoto, initialValues }) {
  const [record, setRecord] = useState(initialValues || null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setRecord(initialValues || null);
      setForm(initialValues ? pickFormFields(initialValues) : EMPTY_FORM);
      setError(null);
    }
  }, [open, initialValues]);

  const handleChange = (field) => (event) => {
    const value = field === "featured" ? event.target.checked : event.target.value;
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const missing = REQUIRED_FIELDS.filter((field) => !String(form[field] ?? "").trim());
    if (missing.length > 0) {
      setError("Please fill in all required fields.");
      return;
    }

    const rating = Number(form.t10_rating);
    if (!Number.isInteger(rating) || rating < 1 || rating > 10) {
      setError("T10 rating must be a whole number between 1 and 10.");
      return;
    }

    const payload = { ...form, t10_rating: rating };

    setSubmitting(true);
    setError(null);
    try {
      const saved = record ? await onUpdate(record.slug, payload) : await onCreate(payload);
      setRecord(saved);
    } catch (submitError) {
      setError(submitError?.response?.data?.errors?.join(", ") || "Could not save this destination.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUploadPhotos = async (files) => {
    const updated = await onUploadPhotos(record.slug, files);
    setRecord(updated);
  };

  const handleDeletePhoto = async (photoId) => {
    await onDeletePhoto(record.slug, photoId);
    setRecord((prev) => ({ ...prev, photos: prev.photos.filter((p) => p.id !== photoId) }));
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{record ? "Edit destination" : "New destination"}</DialogTitle>
      <Box component="form" onSubmit={handleSubmit}>
        <DialogContent>
          <Stack spacing={2}>
            {error && <Alert severity="error">{error}</Alert>}

            <TextField label="Name" value={form.name} onChange={handleChange("name")} fullWidth />
            <TextField
              label="Description"
              value={form.description}
              onChange={handleChange("description")}
              fullWidth
              multiline
              minRows={3}
            />
            <TextField label="Address" value={form.address ?? ""} onChange={handleChange("address")} fullWidth />

            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField label="City" value={form.city} onChange={handleChange("city")} fullWidth />
              </Grid>
              <Grid item xs={6}>
                <TextField label="State" value={form.state} onChange={handleChange("state")} fullWidth />
              </Grid>
            </Grid>

            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField select label="Category" value={form.category} onChange={handleChange("category")} fullWidth>
                  {CATEGORIES.map((category) => (
                    <MenuItem key={category} value={category}>
                      {category.replace("_", " ")}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="T10 rating (1-10)"
                  type="number"
                  value={form.t10_rating}
                  onChange={handleChange("t10_rating")}
                  fullWidth
                  inputProps={{ min: 1, max: 10 }}
                />
              </Grid>
            </Grid>

            <FormControlLabel
              control={<Switch checked={form.featured} onChange={handleChange("featured")} />}
              label="Featured"
            />

            {record && (
              <>
                <Divider />
                <PhotoManager photos={record.photos} onUpload={handleUploadPhotos} onDelete={handleDeletePhoto} />
              </>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} color="inherit">
            {record ? "Done" : "Cancel"}
          </Button>
          <Button type="submit" variant="contained" color="primary" disabled={submitting}>
            {submitting ? "Saving..." : record ? "Save changes" : "Create destination"}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}
