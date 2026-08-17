import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import Alert from "@mui/material/Alert";
import ContentCopyIcon from "@mui/icons-material/ContentCopyOutlined";
import DeleteIcon from "@mui/icons-material/DeleteOutline";
import { createAdminInvitation, deleteAdminInvitation, fetchAdminInvitations } from "../../api/adminInvitations";
import { ErrorState, LoadingState } from "../../components/StateHelpers";

export default function AdminInvitationsPage() {
  const queryClient = useQueryClient();
  const {
    data: invitations,
    isLoading,
    isError
  } = useQuery({
    queryKey: ["admin", "invitations"],
    queryFn: fetchAdminInvitations
  });

  const [email, setEmail] = useState("");
  const [formError, setFormError] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["admin", "invitations"] });

  const createMutation = useMutation({
    mutationFn: (emailToInvite) => createAdminInvitation(emailToInvite),
    onSuccess: () => {
      setEmail("");
      invalidate();
    }
  });

  const deleteMutation = useMutation({ mutationFn: (id) => deleteAdminInvitation(id), onSuccess: invalidate });

  const handleInvite = async (event) => {
    event.preventDefault();
    setFormError(null);
    try {
      await createMutation.mutateAsync(email.trim());
    } catch (submitError) {
      setFormError(submitError?.response?.data?.errors?.join(", ") || "Could not send that invitation.");
    }
  };

  const handleCopy = async (invitation) => {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(invitation.accept_url);
    }
    setCopiedId(invitation.id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 2 }}>
        Admins
      </Typography>

      <Box component="form" onSubmit={handleInvite} sx={{ mb: 2 }}>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
          <TextField
            label="Email to invite"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            fullWidth
            size="small"
          />
          <Button type="submit" variant="contained" color="primary" disabled={createMutation.isPending}>
            Send invite
          </Button>
        </Stack>
        {formError && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {formError}
          </Alert>
        )}
      </Box>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Email delivery isn&apos;t configured yet — copy the invite link and send it to them directly.
      </Typography>

      {isLoading && <LoadingState />}
      {isError && <ErrorState />}

      {invitations && (
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Email</TableCell>
                <TableCell>Invited by</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Expires</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {invitations.map((invitation) => (
                <TableRow key={invitation.id}>
                  <TableCell>{invitation.email}</TableCell>
                  <TableCell>{invitation.invited_by}</TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={invitation.expired ? "Expired" : "Pending"}
                      color={invitation.expired ? "default" : "primary"}
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>{new Date(invitation.expires_at).toLocaleDateString()}</TableCell>
                  <TableCell align="right">
                    <Tooltip title={copiedId === invitation.id ? "Copied!" : "Copy invite link"}>
                      <IconButton size="small" onClick={() => handleCopy(invitation)} aria-label={`copy invite link for ${invitation.email}`}>
                        <ContentCopyIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <IconButton
                      size="small"
                      onClick={() => deleteMutation.mutate(invitation.id)}
                      aria-label={`revoke invite for ${invitation.email}`}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {invitations.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5}>
                    <Typography color="text.secondary">No pending invitations.</Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}
