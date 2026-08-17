import client from "./client";

export async function fetchAdminInvitations() {
  const { data } = await client.get("/admin_invitations");
  return data.admin_invitations;
}

export async function createAdminInvitation(email) {
  const { data } = await client.post("/admin_invitations", { email });
  return data.admin_invitation;
}

export async function deleteAdminInvitation(id) {
  await client.delete(`/admin_invitations/${id}`);
}

export async function acceptAdminInvitation(token, payload) {
  // The response Authorization header (a fresh JWT for the newly created
  // admin) is captured automatically by the response interceptor in
  // ./client.js, the same way login/signup are.
  const { data } = await client.post(`/admin_invitations/${token}/accept`, payload);
  return data.user;
}
