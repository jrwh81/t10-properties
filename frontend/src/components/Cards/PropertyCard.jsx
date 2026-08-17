import { Link as RouterLink } from "react-router-dom";
import Card from "@mui/material/Card";
import CardActionArea from "@mui/material/CardActionArea";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";

const currency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

export default function PropertyCard({ property }) {
  return (
    <Card>
      <CardActionArea component={RouterLink} to={`/properties/${property.slug}`}>
        <CardMedia
          component="div"
          sx={{
            height: 180,
            bgcolor: "background.default",
            backgroundImage: property.cover_photo_url ? `url(${property.cover_photo_url})` : "none",
            backgroundSize: "cover",
            backgroundPosition: "center"
          }}
        />
        <CardContent>
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
            <Typography variant="h6" component="h3" sx={{ mb: 0.5 }}>
              {property.title}
            </Typography>
            {property.featured && <Chip label="Featured" color="primary" size="small" />}
          </Stack>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {property.city}, {property.state}
          </Typography>
          <Typography variant="h6" color="primary.main" sx={{ fontWeight: 800 }}>
            {currency.format(property.price)}
          </Typography>
          <Box sx={{ display: "flex", gap: 2, mt: 1 }}>
            <Typography variant="body2" color="text.secondary">
              {property.bedrooms ?? "--"} bd
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {property.bathrooms ?? "--"} ba
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {property.square_feet ? `${property.square_feet.toLocaleString()} sqft` : "--"}
            </Typography>
          </Box>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}
