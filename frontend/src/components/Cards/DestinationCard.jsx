import { Link as RouterLink } from "react-router-dom";
import Card from "@mui/material/Card";
import CardActionArea from "@mui/material/CardActionArea";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Chip from "@mui/material/Chip";
import RatingBadge from "./RatingBadge";

export default function DestinationCard({ destination }) {
  return (
    <Card>
      <CardActionArea component={RouterLink} to={`/destinations/${destination.slug}`}>
        <CardMedia
          component="div"
          sx={{
            height: 180,
            bgcolor: "background.default",
            backgroundImage: destination.cover_photo_url ? `url(${destination.cover_photo_url})` : "none",
            backgroundSize: "cover",
            backgroundPosition: "center"
          }}
        />
        <CardContent>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
            <Typography variant="h6" component="h3">
              {destination.name}
            </Typography>
            <RatingBadge rating={destination.t10_rating} />
          </Stack>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {destination.city}, {destination.state}
          </Typography>
          <Chip label={destination.category.replace("_", " ")} size="small" variant="outlined" color="primary" />
        </CardContent>
      </CardActionArea>
    </Card>
  );
}
