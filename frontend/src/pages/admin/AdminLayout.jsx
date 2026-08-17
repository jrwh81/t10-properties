import { Outlet, Link as RouterLink, useLocation } from "react-router-dom";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import { useAuth } from "../../context/AuthContext";

const TABS = [
  { label: "Properties", value: "/admin/properties" },
  { label: "Destinations", value: "/admin/destinations" },
  { label: "Blog Posts", value: "/admin/blog" },
  { label: "Admins", value: "/admin/admins" }
];

export default function AdminLayout() {
  const { user } = useAuth();
  const location = useLocation();
  const currentTab = TABS.find((tab) => location.pathname.startsWith(tab.value))?.value || TABS[0].value;

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Typography variant="h3" component="h1" gutterBottom>
        Admin
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Signed in as {user?.name}
      </Typography>

      <Tabs value={currentTab} sx={{ mb: 4, borderBottom: 1, borderColor: "divider" }}>
        {TABS.map((tab) => (
          <Tab key={tab.value} label={tab.label} value={tab.value} component={RouterLink} to={tab.value} />
        ))}
      </Tabs>

      <Outlet />
    </Container>
  );
}
