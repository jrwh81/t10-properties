import { useQuery } from "@tanstack/react-query";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import { fetchBlogPosts } from "../api/blogPosts";
import BlogPostCard from "../components/Cards/BlogPostCard";
import { LoadingState, ErrorState } from "../components/StateHelpers";

export default function BlogPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["blogPosts"],
    queryFn: () => fetchBlogPosts()
  });

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Typography variant="h3" component="h1" gutterBottom>
        Blog
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 4 }}>
        Stories, updates, and neighborhood notes from T10 Properties.
      </Typography>

      {isLoading && <LoadingState />}
      {isError && <ErrorState />}
      {data && data.blog_posts.length === 0 && <Typography color="text.secondary">No posts yet.</Typography>}
      {data && (
        <Grid container spacing={3}>
          {data.blog_posts.map((post) => (
            <Grid item xs={12} sm={6} md={4} key={post.slug}>
              <BlogPostCard post={post} />
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
}
