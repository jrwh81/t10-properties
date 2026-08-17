import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Divider from "@mui/material/Divider";
import CircularProgress from "@mui/material/CircularProgress";
import { createComment, deleteComment, fetchComments } from "../../api/blogPosts";
import Comment from "./Comment";
import CommentForm from "./CommentForm";

export default function CommentThread({ blogPostSlug }) {
  const queryClient = useQueryClient();
  const [localError, setLocalError] = useState(null);

  const { data: comments, isLoading } = useQuery({
    queryKey: ["comments", blogPostSlug],
    queryFn: () => fetchComments(blogPostSlug)
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["comments", blogPostSlug] });

  const handleSubmit = async (payload) => {
    await createComment(blogPostSlug, payload);
    invalidate();
  };

  const handleDelete = async (commentId) => {
    try {
      await deleteComment(commentId);
      invalidate();
    } catch {
      setLocalError("Could not delete that comment.");
    }
  };

  return (
    <Box sx={{ mt: 6 }}>
      <Typography variant="h5" gutterBottom>
        Comments {comments ? `(${comments.length})` : ""}
      </Typography>
      <Divider sx={{ mb: 3 }} />

      <CommentForm onSubmit={handleSubmit} />

      {localError && (
        <Typography color="error" variant="body2" sx={{ mt: 2 }}>
          {localError}
        </Typography>
      )}

      <Stack spacing={3} sx={{ mt: 4 }}>
        {isLoading && <CircularProgress size={24} />}
        {!isLoading && comments?.length === 0 && (
          <Typography color="text.secondary">Be the first to comment.</Typography>
        )}
        {comments?.map((comment) => (
          <Comment key={comment.id} comment={comment} onReply={handleSubmit} onDelete={handleDelete} />
        ))}
      </Stack>
    </Box>
  );
}
