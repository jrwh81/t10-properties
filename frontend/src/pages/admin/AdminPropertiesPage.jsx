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
import { createProperty, deleteProperty, fetchProperties, fetchProperty, updateProperty } from "../../api/properties";
import PropertyFormDialog from "../../components/Admin/PropertyFormDialog";
import ConfirmDialog from "../../components/Admin/ConfirmDialog";
import { ErrorState, LoadingState } from "../../components/StateHelpers";

const currency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

export default function AdminPropertiesPage() {
  const queryClient = useQueryClient();
  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin", "properties"],
    queryFn: () => fetchProperties({ per_page: 100 })
  });

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["admin", "properties"] });

  const createMutation = useMutation({ mutationFn: (payload) => createProperty(payload), onSuccess: invalidate });
  const updateMutation = useMutation({
    mutationFn: ({ slug, payload }) => updateProperty(slug, payload),
    onSuccess: invalidate
  });
  const deleteMutation = useMutation({ mutationFn: (slug) => deleteProperty(slug), onSuccess: invalidate });

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

  // The list endpoint only returns summary fields -- fetch the full
  // record before opening the edit form so fields like description and
  // address are populated.
  const openEdit = async (property) => {
    const full = await fetchProperty(property.slug);
    setEditing(full);
    setFormOpen(true);
  };

  const handleSubmit = async (values) => {
    if (editing) {
      await updateMutation.mutateAsync({ slug: editing.slug, payload: values });
    } else {
      await createMutation.mutateAsync(values);
    }
  };

  const handleDelete = async () => {
    await deleteMutation.mutateAsync(deleting.slug);
    setDeleting(null);
  };

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="h5">Properties</Typography>
        <Button startIcon={<AddIcon />} variant="contained" color="primary" onClick={openCreate}>
          New property
        </Button>
      </Stack>

      {isLoading && <LoadingState />}
      {isError && <ErrorState />}

      {data && (
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Title</TableCell>
                <TableCell>Location</TableCell>
                <TableCell>Price</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Featured</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.properties.map((property) => (
                <TableRow key={property.slug}>
                  <TableCell>{property.title}</TableCell>
                  <TableCell>
                    {property.city}, {property.state}
                  </TableCell>
                  <TableCell>{currency.format(property.price)}</TableCell>
                  <TableCell>
                    <Chip size="small" label={property.status.replace("_", " ")} />
                  </TableCell>
                  <TableCell>{property.featured ? "Yes" : ""}</TableCell>
                  <TableCell align="right">
                    <IconButton size="small" onClick={() => openEdit(property)} aria-label={`edit ${property.title}`}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" onClick={() => setDeleting(property)} aria-label={`delete ${property.title}`}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {data.properties.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6}>
                    <Typography color="text.secondary">No properties yet.</Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <PropertyFormDialog open={formOpen} onClose={() => setFormOpen(false)} onSubmit={handleSubmit} initialValues={editing} />

      <ConfirmDialog
        open={Boolean(deleting)}
        title="Delete property?"
        description={deleting ? `This will permanently remove "${deleting.title}".` : ""}
        onConfirm={handleDelete}
        onCancel={() => setDeleting(null)}
      />
    </Box>
  );
}
