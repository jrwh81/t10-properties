import client, { setStoredToken } from "./client";

export async function login({ email, password }) {
  const response = await client.post("/login", { user: { email, password } });
  const token = response.headers?.authorization?.replace(/^Bearer\s+/i, "");
  setStoredToken(token);
  return response.data.user;
}

export async function signup({ name, email, password, passwordConfirmation }) {
  const response = await client.post("/signup", {
    user: { name, email, password, password_confirmation: passwordConfirmation }
  });
  const token = response.headers?.authorization?.replace(/^Bearer\s+/i, "");
  setStoredToken(token);
  return response.data.user;
}

export async function logout() {
  await client.delete("/logout");
  setStoredToken(null);
}

export async function fetchCurrentUser() {
  const { data } = await client.get("/me");
  return data.user;
}
