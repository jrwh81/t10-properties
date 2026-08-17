import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { ThemeProvider } from "@mui/material";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render } from "@testing-library/react";
import theme from "../../theme/theme";
import { AuthProvider } from "../../context/AuthContext";
import AcceptInvitePage from "../AcceptInvitePage";

vi.mock("../../api/adminInvitations", () => ({
  acceptAdminInvitation: vi.fn()
}));

import { acceptAdminInvitation } from "../../api/adminInvitations";

function renderAtToken(token) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <ThemeProvider theme={theme}>
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={[`/admin/accept-invite/${token}`]}>
          <AuthProvider>
            <Routes>
              <Route path="/admin/accept-invite/:token" element={<AcceptInvitePage />} />
            </Routes>
          </AuthProvider>
        </MemoryRouter>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

describe("AcceptInvitePage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("submits the token from the URL along with the entered name/password", async () => {
    acceptAdminInvitation.mockResolvedValue({ id: 5, name: "Future Admin", role: "admin" });
    const user = userEvent.setup();

    renderAtToken("abc123");

    await user.type(screen.getByLabelText(/^name/i), "Future Admin");
    await user.type(screen.getByLabelText(/^password/i), "password123");
    await user.type(screen.getByLabelText(/confirm password/i), "password123");
    await user.click(screen.getByRole("button", { name: /activate account/i }));

    await waitFor(() =>
      expect(acceptAdminInvitation).toHaveBeenCalledWith("abc123", {
        name: "Future Admin",
        password: "password123",
        password_confirmation: "password123"
      })
    );
  });

  it("shows an error message when the invitation is invalid", async () => {
    acceptAdminInvitation.mockRejectedValue({ response: { data: { error: "This invitation is invalid or has expired." } } });
    const user = userEvent.setup();

    renderAtToken("expired-token");

    await user.type(screen.getByLabelText(/^name/i), "Future Admin");
    await user.type(screen.getByLabelText(/^password/i), "password123");
    await user.type(screen.getByLabelText(/confirm password/i), "password123");
    await user.click(screen.getByRole("button", { name: /activate account/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(/invalid or has expired/i);
  });
});
