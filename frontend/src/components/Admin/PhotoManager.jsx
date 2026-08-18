import { useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import CircularProgress from "@mui/material/CircularProgress";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import Alert from "@mui/material/Alert";

// Reusable multi-photo manager for any has_many_attached resource
// (properties, destinations). `photos` is an array of { id, url }.
export default function PhotoManager({ photos, onUpload, onDelete }) {
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState(null);

  const handleFileChange = async (event) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setError(null);
    setUploading(true);
    try {
      await onUpload(files);
    } catch {
      setError("Could not upload those photos. Try smaller files or fewer at once.");
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };

  const handleDelete = async (photoId) => {
    setError(null);
    setDeletingId(photoId);
    try {
      await onDelete(photoId);
    } catch {
      setError("Could not delete that photo.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <Box>
      <Typography variant="subtitle2" gutterBottom>
        Photos
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 1.5 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5, mb: 2 }}>
        {photos?.map((photo) => (
          <Box key={photo.id} sx={{ position: "relative", width: 96, height: 96 }}>
            <Box
              component="img"
              src={photo.url}
              alt=""
              sx={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                borderRadius: 1,
                border: "1px solid",
                borderColor: "divider",
                display: "block"
              }}
            />
            <IconButton
              size="small"
              onClick={() => handleDelete(photo.id)}
              disabled={deletingId === photo.id}
              aria-label="delete photo"
              sx={{
                position: "absolute",
                top: -8,
                right: -8,
                bgcolor: "background.paper",
                border: "1px solid",
                borderColor: "divider",
                "&:hover": { bgcolor: "error.dark" }
              }}
            >
              {deletingId === photo.id ? <CircularProgress size={14} /> : <DeleteOutlineIcon fontSize="small" />}
            </IconButton>
          </Box>
        ))}

        {(!photos || photos.length === 0) && (
          <Typography variant="body2" color="text.secondary">
            No photos yet.
          </Typography>
        )}
      </Box>

      <Button component="label" variant="outlined" size="small" disabled={uploading}>
        {uploading ? "Uploading..." : "Add photos"}
        <input type="file" accept="image/*" multiple hidden onChange={handleFileChange} />
      </Button>
    </Box>
  );
}
