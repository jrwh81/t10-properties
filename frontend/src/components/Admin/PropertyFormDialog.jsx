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

const PROPERTY_TYPES = ["single_family", "multi_family", "condo", "townhouse", "land", "commercial"];
const STATUSES = ["active", "pending", "sold", "off_market"];

const EMPTY_FORM = {
  title: "",
  description: "",
  address: "",
  city: "",
  state: "",
  zip_code: "",
  price: "",
  bedrooms: "",
  bathrooms: "",
  square_feet: "",
  property_type: "single_family",
  status: "active",
  featured: false,
  listed_at: ""
};

const REQUIRED_FIELDS = ["title", "description", "address", "city", "state", "zip_code", "price"];

export default function PropertyFormDialog({ open, onClose, onSubmit, initialValues }) {
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

    setSubmitting(true);
    setError(null);
    try {
      await onSubmit({
        ...form,
        price: Number(form.price),
        bedrooms: form.bedrooms === "" ? null : Number(form.bedrooms),
        bathrooms: form.bathrooms === "" ? null : Number(form.bathrooms),
        square_feet: form.square_feet === "" ? null : Number(form.square_feet),
        listed_at: form.listed_at || null
      });
      onClose();
    } catch (submitError) {
      setError(submitError?.response?.data?.errors?.join(", ") || "Could not save this property.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{initialValues ? "Edit property" : "New property"}</DialogTitle>
      <Box component="form" onSubmit={handleSubmit}>
        <DialogContent>
          <Stack spacing={2}>
            {error && <Alert severity="error">{error}</Alert>}

            <TextField label="Title" value={form.title} onChange={handleChange("title")} fullWidth />
            <TextField
              label="Description"
              value={form.description}
              onChange={handleChange("description")}
              fullWidth
              multiline
              minRows={3}
            />
            <TextField label="Address" value={form.address} onChange={handleChange("address")} fullWidth />

            <Grid container spacing={2}>
              <Grid item xs={4}>
                <TextField label="City" value={form.city} onChange={handleChange("city")} fullWidth />
              </Grid>
              <Grid item xs={4}>
                <TextField label="State" value={form.state} onChange={handleChange("state")} fullWidth />
              </Grid>
              <Grid item xs={4}>
                <TextField label="Zip" value={form.zip_code} onChange={handleChange("zip_code")} fullWidth />
              </Grid>
            </Grid>

            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  label="Price"
                  type="number"
                  value={form.price}
                  onChange={handleChange("price")}
                  fullWidth
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Listed date"
                  type="date"
                  value={form.listed_at || ""}
                  onChange={handleChange("listed_at")}
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
            </Grid>

            <Grid container spacing={2}>
              <Grid item xs={4}>
                <TextField
                  label="Bedrooms"
                  type="number"
                  value={form.bedrooms ?? ""}
                  onChange={handleChange("bedrooms")}
                  fullWidth
                />
              </Grid>
              <Grid item xs={4}>
                <TextField
                  label="Bathrooms"
                  type="number"
                  value={form.bathrooms ?? ""}
                  onChange={handleChange("bathrooms")}
                  fullWidth
                />
              </Grid>
              <Grid item xs={4}>
                <TextField
                  label="Sqft"
                  type="number"
                  value={form.square_feet ?? ""}
                  onChange={handleChange("square_feet")}
                  fullWidth
                />
              </Grid>
            </Grid>

            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField select label="Type" value={form.property_type} onChange={handleChange("property_type")} fullWidth>
                  {PROPERTY_TYPES.map((type) => (
                    <MenuItem key={type} value={type}>
                      {type.replace("_", " ")}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={6}>
                <TextField select label="Status" value={form.status} onChange={handleChange("status")} fullWidth>
                  {STATUSES.map((status) => (
                    <MenuItem key={status} value={status}>
                      {status.replace("_", " ")}
                    </MenuItem>
                  ))}
                </TextField>
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
