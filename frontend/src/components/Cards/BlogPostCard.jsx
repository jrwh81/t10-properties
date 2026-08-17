import { Link as RouterLink } from "react-router-dom";
import Card from "@mui/material/Card";
import CardActionArea from "@mui/material/CardActionArea";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";

export default function BlogPostCard({ post }) {
  const published = post.published_at ? new Date(post.published_at).toLocaleDateString() : "Draft";

  return (
    <Card>
      <CardActionArea component={RouterLink} to={`/blog/${post.slug}`}>
        <CardMedia
          component="div"
          sx={{
            height: 160,
            bgcolor: "background.default",
            backgroundImage: post.cover_image_url ? `url(${post.cover_image_url})` : "none",
            backgroundSize: "cover",
            backgroundPosition: "center"
          }}
        />
        <CardContent>
          <Typography variant="h6" component="h3" gutterBottom>
            {post.title}
          </Typography>
          {post.excerpt && (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
              {post.excerpt}
            </Typography>
          )}
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="caption" color="text.secondary">
              {post.author_name} &middot; {published}
            </Typography>
            <Stack direction="row" spacing={0.5} alignItems="center">
              <ChatBubbleOutlineIcon sx={{ fontSize: 16, color: "text.secondary" }} />
              <Typography variant="caption" color="text.secondary">
                {post.comments_count}
              </Typography>
            </Stack>
          </Stack>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}
