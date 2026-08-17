import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "../../../test/testUtils";
import AdminInvitationsPage from "../AdminInvitationsPage";

vi.mock("../../../api/adminInvitations", () => ({
  fetchAdminInvitations: vi.fn(),
  createAdminInvitation: vi.fn(),
  deleteAdminInvitation: vi.fn()
}));

import { createAdminInvitation, fetchAdminInvitations } from "../../../api/adminInvitations";

describe("AdminInvitationsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("lists pending invitations returned by the API", async () => {
    fetchAdminInvitations.mockResolvedValue([
      {
        id: 1,
        email: "future-admin@example.com",
        invited_by: "T10 Admin",
        accepted: false,
        expired: false,
        expires_at: "2026-12-01T00:00:00.000Z",
        accept_url: "http://localhost:5173/admin/accept-invite/abc123"
      }
    ]);

    renderWithProviders(<AdminInvitationsPage />);

    expect(await screen.findByText("future-admin@example.com")).toBeInTheDocument();
    expect(screen.getByText("T10 Admin")).toBeInTheDocument();
    expect(screen.getByText("Pending")).toBeInTheDocument();
  });

  it("shows an empty state with no pending invitations", async () => {
    fetchAdminInvitations.mockResolvedValue([]);
    renderWithProviders(<AdminInvitationsPage />);

    expect(await screen.findByText("No pending invitations.")).toBeInTheDocument();
  });

  it("submits the trimmed email when sending an invite", async () => {
    fetchAdminInvitations.mockResolvedValue([]);
    createAdminInvitation.mockResolvedValue({ id: 2, email: "new@example.com" });
    const user = userEvent.setup();

    renderWithProviders(<AdminInvitationsPage />);
    await screen.findByText("No pending invitations.");

    await user.type(screen.getByLabelText(/email to invite/i), "  new@example.com  ");
    await user.click(screen.getByRole("button", { name: /send invite/i }));

    await waitFor(() => expect(createAdminInvitation).toHaveBeenCalledWith("new@example.com"));
  });
});
