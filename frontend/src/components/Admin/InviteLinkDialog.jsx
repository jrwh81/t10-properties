import { useEffect, useState } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import InputAdornment from "@mui/material/InputAdornment";
import IconButton from "@mui/material/IconButton";
import ContentCopyIcon from "@mui/icons-material/ContentCopyOutlined";
import CheckIcon from "@mui/icons-material/Check";
import { copyToClipboard } from "../../utils/clipboard";

// Shown right after an admin invite is created, and reusable from the
// invitations table to re-copy a link later. Email delivery isn't set up
// yet, so this is the whole "notify someone they've been invited" flow.
export default function InviteLinkDialog({ open, onClose, email, url }) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (open) setCopied(false);
  }, [open]);

  const handleCopy = async () => {
    if (url) await copyToClipboard(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Invitation ready</DialogTitle>
      <DialogContent>
        <DialogContentText sx={{ mb: 2 }}>
          Email delivery isn&apos;t set up yet, so send this link to{" "}
          <Box component="strong" sx={{ color: "text.primary" }}>
            {email}
          </Box>{" "}
          yourself. It lets them set a password and sign in as an admin.
        </DialogContentText>
        <TextField
          value={url || ""}
          fullWidth
          size="small"
          InputProps={{
            readOnly: true,
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={handleCopy}
                  edge="end"
                  aria-label="copy invite link"
                  color={copied ? "success" : "default"}
                >
                  {copied ? <CheckIcon fontSize="small" /> : <ContentCopyIcon fontSize="small" />}
                </IconButton>
              </InputAdornment>
            )
          }}
          onFocus={(event) => event.target.select()}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCopy} color="primary" startIcon={copied ? <CheckIcon /> : <ContentCopyIcon />}>
          {copied ? "Copied!" : "Copy link"}
        </Button>
        <Button onClick={onClose} variant="contained" color="primary">
          Done
        </Button>
      </DialogActions>
    </Dialog>
  );
}
