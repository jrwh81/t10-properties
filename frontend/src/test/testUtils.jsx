import { BrowserRouter } from "react-router-dom";
import { ThemeProvider } from "@mui/material";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render } from "@testing-library/react";
import theme from "../theme/theme";
import { AuthProvider } from "../context/AuthContext";

// Shared render helper so component tests get the same providers the
// real app tree does (router, MUI theme, react-query, auth context).
export function renderWithProviders(ui, { route = "/" } = {}) {
  window.history.pushState({}, "Test page", route);

  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } }
  });

  return render(
    <ThemeProvider theme={theme}>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AuthProvider>{ui}</AuthProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </ThemeProvider>
  );
}
