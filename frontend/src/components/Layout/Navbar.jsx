import { useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import MenuIcon from "@mui/icons-material/Menu";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import { useAuth } from "../../context/AuthContext";

const NAV_LINKS = [
  { label: "Properties", to: "/properties" },
  { label: "T10 Destinations", to: "/destinations" },
  { label: "Blog", to: "/blog" }
];

export default function Navbar() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { isAuthenticated, isAdmin, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <AppBar position="sticky" elevation={0}>
      <Toolbar sx={{ gap: 2 }}>
        <Typography
          component={RouterLink}
          to="/"
          variant="h6"
          sx={{ textDecoration: "none", color: "primary.main", fontWeight: 900, letterSpacing: "0.03em", flexGrow: isMobile ? 1 : 0 }}
        >
          T10<Box component="span" sx={{ color: "secondary.main" }}>&nbsp;PROPERTIES</Box>
        </Typography>

        {!isMobile && (
          <Box sx={{ display: "flex", gap: 1, flexGrow: 1, ml: 4 }}>
            {NAV_LINKS.map((link) => (
              <Button key={link.to} component={RouterLink} to={link.to} color="inherit">
                {link.label}
              </Button>
            ))}
            {isAdmin && (
              <Button component={RouterLink} to="/admin" color="inherit">
                Admin
              </Button>
            )}
          </Box>
        )}

        {!isMobile && (
          <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
            {isAuthenticated ? (
              <>
                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                  {user?.name}
                </Typography>
                <Button onClick={handleLogout} variant="outlined" color="primary">
                  Log out
                </Button>
              </>
            ) : (
              <>
                <Button component={RouterLink} to="/login" color="inherit">
                  Log in
                </Button>
                <Button component={RouterLink} to="/signup" variant="contained" color="primary">
                  Sign up
                </Button>
              </>
            )}
          </Box>
        )}

        {isMobile && (
          <IconButton edge="end" color="inherit" onClick={() => setDrawerOpen(true)} aria-label="open navigation menu">
            <MenuIcon />
          </IconButton>
        )}
      </Toolbar>

      <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <Box sx={{ width: 240 }} role="presentation" onClick={() => setDrawerOpen(false)}>
          <List>
            {NAV_LINKS.map((link) => (
              <ListItemButton key={link.to} component={RouterLink} to={link.to}>
                <ListItemText primary={link.label} />
              </ListItemButton>
            ))}
            {isAdmin && (
              <ListItemButton component={RouterLink} to="/admin">
                <ListItemText primary="Admin" />
              </ListItemButton>
            )}
            {isAuthenticated ? (
              <ListItemButton onClick={handleLogout}>
                <ListItemText primary="Log out" />
              </ListItemButton>
            ) : (
              <>
                <ListItemButton component={RouterLink} to="/login">
                  <ListItemText primary="Log in" />
                </ListItemButton>
                <ListItemButton component={RouterLink} to="/signup">
                  <ListItemText primary="Sign up" />
                </ListItemButton>
              </>
            )}
          </List>
        </Box>
      </Drawer>
    </AppBar>
  );
}
