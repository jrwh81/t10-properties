import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import IconButton from "@mui/material/IconButton";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import EditIcon from "@mui/icons-material/EditOutlined";
import DeleteIcon from "@mui/icons-material/DeleteOutline";
import AddIcon from "@mui/icons-material/Add";
import {
  createDestination,
  deleteDestination,
  deleteDestinationPhoto,
  fetchDestination,
  fetchDestinations,
  updateDestination,
  uploadDestinationPhotos
} from "../../api/destinations";
import DestinationFormDialog from "../../components/Admin/DestinationFormDialog";
import ConfirmDialog from "../../components/Admin/ConfirmDialog";
import { ErrorState, LoadingState } from "../../components/StateHelpers";

export default function AdminDestinationsPage() {
  const queryClient = useQueryClient();
  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin", "destinations"],
    queryFn: () => fetchDestinations({ per_page: 100 })
  });

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["admin", "destinations"] });

  const createMutation = useMutation({ mutationFn: (payload) => createDestination(payload), onSuccess: invalidate });
  const updateMutation = useMutation({
    mutationFn: ({ slug, payload }) => updateDestination(slug, payload),
    onSuccess: invalidate
  });
  const deleteMutation = useMutation({ mutationFn: (slug) => deleteDestination(slug), onSuccess: invalidate });
  const uploadPhotosMutation = useMutation({ mutationFn: ({ slug, files }) => uploadDestinationPhotos(slug, files) });
  const deletePhotoMutation = useMutation({ mutationFn: ({ slug, photoId }) => deleteDestinationPhoto(slug, photoId) });

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = async (destination) => {
    const full = await fetchDestination(destination.slug);
    setEditing(full);
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    invalidate();
  };

  const handleDelete = async () => {
    await deleteMutation.mutateAsync(deleting.slug);
    setDeleting(null);
  };

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="h5">Destinations</Typography>
        <Button startIcon={<AddIcon />} variant="contained" color="primary" onClick={openCreate}>
          New destination
        </Button>
      </Stack>

      {isLoading && <LoadingState />}
      {isError && <ErrorState />}

      {data && (
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Location</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>T10 Rating</TableCell>
                <TableCell>Featured</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.destinations.map((destination) => (
                <TableRow key={destination.slug}>
                  <TableCell>{destination.name}</TableCell>
                  <TableCell>
                    {destination.city}, {destination.state}
                  </TableCell>
                  <TableCell>
                    <Chip size="small" label={destination.category.replace("_", " ")} />
                  </TableCell>
                  <TableCell>{destination.rating_label}</TableCell>
                  <TableCell>{destination.featured ? "Yes" : ""}</TableCell>
                  <TableCell align="right">
                    <IconButton size="small" onClick={() => openEdit(destination)} aria-label={`edit ${destination.name}`}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" onClick={() => setDeleting(destination)} aria-label={`delete ${destination.name}`}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {data.destinations.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6}>
                    <Typography color="text.secondary">No destinations yet.</Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <DestinationFormDialog
        open={formOpen}
        onClose={closeForm}
        onCreate={(payload) => createMutation.mutateAsync(payload)}
        onUpdate={(slug, payload) => updateMutation.mutateAsync({ slug, payload })}
        onUploadPhotos={(slug, files) => uploadPhotosMutation.mutateAsync({ slug, files })}
        onDeletePhoto={(slug, photoId) => deletePhotoMutation.mutateAsync({ slug, photoId })}
        initialValues={editing}
      />

      <ConfirmDialog
        open={Boolean(deleting)}
        title="Delete destination?"
        description={deleting ? `This will permanently remove "${deleting.name}".` : ""}
        onConfirm={handleDelete}
        onCancel={() => setDeleting(null)}
      />
    </Box>
  );
}
