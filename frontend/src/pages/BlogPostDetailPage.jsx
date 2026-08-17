import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import { fetchBlogPost } from "../api/blogPosts";
import CommentThread from "../components/Comments/CommentThread";
import { LoadingState, ErrorState } from "../components/StateHelpers";

export default function BlogPostDetailPage() {
  const { slug } = useParams();
  const { data: post, isLoading, isError } = useQuery({
    queryKey: ["blogPost", slug],
    queryFn: () => fetchBlogPost(slug)
  });

  if (isLoading) return <LoadingState />;
  if (isError || !post) return <ErrorState message="We couldn't find that post." />;

  const published = post.published_at
    ? new Date(post.published_at).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })
    : "Draft";

  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Typography variant="h3" component="h1" gutterBottom>
        {post.title}
      </Typography>
      <Stack direction="row" spacing={1} sx={{ mb: 3 }}>
        <Typography variant="body2" color="text.secondary">
          By {post.author_name} &middot; {published}
        </Typography>
      </Stack>

      {post.cover_image_url && (
        <Box
          sx={{
            height: 320,
            borderRadius: 2,
            mb: 4,
            backgroundImage: `url(${post.cover_image_url})`,
            backgroundSize: "cover",
            backgroundPosition: "center"
          }}
        />
      )}

      <Typography variant="body1" sx={{ whiteSpace: "pre-wrap", lineHeight: 1.8 }}>
        {post.body}
      </Typography>

      <CommentThread blogPostSlug={post.slug} />
    </Container>
  );
}
