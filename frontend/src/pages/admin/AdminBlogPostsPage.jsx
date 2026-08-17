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
import { createBlogPost, deleteBlogPost, fetchBlogPost, fetchBlogPosts, updateBlogPost } from "../../api/blogPosts";
import BlogPostFormDialog from "../../components/Admin/BlogPostFormDialog";
import ConfirmDialog from "../../components/Admin/ConfirmDialog";
import { ErrorState, LoadingState } from "../../components/StateHelpers";

export default function AdminBlogPostsPage() {
  const queryClient = useQueryClient();
  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin", "blogPosts"],
    queryFn: () => fetchBlogPosts({ per_page: 100 })
  });

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["admin", "blogPosts"] });

  const createMutation = useMutation({ mutationFn: (payload) => createBlogPost(payload), onSuccess: invalidate });
  const updateMutation = useMutation({
    mutationFn: ({ slug, payload }) => updateBlogPost(slug, payload),
    onSuccess: invalidate
  });
  const deleteMutation = useMutation({ mutationFn: (slug) => deleteBlogPost(slug), onSuccess: invalidate });

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = async (post) => {
    const full = await fetchBlogPost(post.slug);
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
        <Typography variant="h5">Blog Posts</Typography>
        <Button startIcon={<AddIcon />} variant="contained" color="primary" onClick={openCreate}>
          New post
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
                <TableCell>Author</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Comments</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.blog_posts.map((post) => (
                <TableRow key={post.slug}>
                  <TableCell>{post.title}</TableCell>
                  <TableCell>{post.author_name}</TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={post.status}
                      color={post.status === "published" ? "primary" : "default"}
                      variant={post.status === "published" ? "filled" : "outlined"}
                    />
                  </TableCell>
                  <TableCell>{post.comments_count}</TableCell>
                  <TableCell align="right">
                    <IconButton size="small" onClick={() => openEdit(post)} aria-label={`edit ${post.title}`}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" onClick={() => setDeleting(post)} aria-label={`delete ${post.title}`}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {data.blog_posts.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5}>
                    <Typography color="text.secondary">No posts yet.</Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <BlogPostFormDialog open={formOpen} onClose={() => setFormOpen(false)} onSubmit={handleSubmit} initialValues={editing} />

      <ConfirmDialog
        open={Boolean(deleting)}
        title="Delete post?"
        description={deleting ? `This will permanently remove "${deleting.title}" and its comments.` : ""}
        onConfirm={handleDelete}
        onCancel={() => setDeleting(null)}
      />
    </Box>
  );
}
