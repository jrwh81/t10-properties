import { useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import { useAuth } from "../../context/AuthContext";
import CommentForm from "./CommentForm";

export default function Comment({ comment, onReply, onDelete }) {
  const { user, isAdmin } = useAuth();
  const [replying, setReplying] = useState(false);

  const canDelete = isAdmin || (user && !comment.is_guest && comment.author_name === user.name);
  const postedAt = new Date(comment.created_at).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric"
  });

  const handleReplySubmit = async (payload) => {
    await onReply({ ...payload, parent_id: comment.id });
    setReplying(false);
  };

  return (
    <Box sx={{ display: "flex", gap: 1.5 }}>
      <Avatar sx={{ bgcolor: "primary.main", color: "primary.contrastText", width: 36, height: 36 }}>
        {comment.author_name?.[0]?.toUpperCase() || "?"}
      </Avatar>
      <Box sx={{ flexGrow: 1 }}>
        <Stack direction="row" spacing={1} alignItems="center">
          <Typography variant="subtitle2">{comment.author_name}</Typography>
          <Typography variant="caption" color="text.secondary">
            {postedAt}
          </Typography>
        </Stack>
        <Typography variant="body2" sx={{ mt: 0.5, whiteSpace: "pre-wrap" }}>
          {comment.body}
        </Typography>
        <Stack direction="row" spacing={1} sx={{ mt: 0.5 }}>
          <Button size="small" onClick={() => setReplying((prev) => !prev)}>
            Reply
          </Button>
          {canDelete && (
            <IconButton size="small" onClick={() => onDelete(comment.id)} aria-label="delete comment">
              <DeleteOutlineIcon fontSize="small" />
            </IconButton>
          )}
        </Stack>

        {replying && (
          <Box sx={{ mt: 1 }}>
            <CommentForm onSubmit={handleReplySubmit} submitLabel="Post reply" onCancel={() => setReplying(false)} />
          </Box>
        )}

        {comment.replies?.length > 0 && (
          <Stack spacing={2} sx={{ mt: 2, pl: 2, borderLeft: "2px solid", borderColor: "divider" }}>
            {comment.replies.map((reply) => (
              <Comment key={reply.id} comment={reply} onReply={onReply} onDelete={onDelete} />
            ))}
          </Stack>
        )}
      </Box>
    </Box>
  );
}
