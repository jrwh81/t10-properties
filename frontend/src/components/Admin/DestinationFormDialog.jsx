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
import FormControlLabel from "@mui/material/FormControlLabel";
import Switch from "@mui/material/Switch";
import Alert from "@mui/material/Alert";

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

export default function DestinationFormDialog({ open, onClose, onSubmit, initialValues }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setForm(initialValues ? { ...EMPTY_FORM, ...initialValues } : EMPTY_FORM);
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

    setSubmitting(true);
    setError(null);
    try {
      await onSubmit({ ...form, t10_rating: rating });
      onClose();
    } catch (submitError) {
      setError(submitError?.response?.data?.errors?.join(", ") || "Could not save this destination.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{initialValues ? "Edit destination" : "New destination"}</DialogTitle>
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
