import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

// The signature "T10" rating badge: X/10 in gold on black, echoing the
// wordmark treatment in the logo.
export default function RatingBadge({ rating, size = "medium" }) {
  const dims = size === "large" ? { box: 64, font: "1.5rem" } : { box: 48, font: "1.1rem" };

  return (
    <Box
      role="img"
      aria-label={`T10 rating: ${rating} out of 10`}
      sx={{
        width: dims.box,
        height: dims.box,
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "background.default",
        border: "2px solid",
        borderColor: "primary.main",
        flexShrink: 0
      }}
    >
      <Typography sx={{ fontWeight: 800, color: "primary.main", fontSize: dims.font, lineHeight: 1 }}>
        {rating}
      </Typography>
    </Box>
  );
}
