import client from "./client";

export async function fetchDestinations(params = {}) {
  const { data } = await client.get("/destinations", { params });
  return data;
}

export async function fetchDestination(slug) {
  const { data } = await client.get(`/destinations/${slug}`);
  return data.destination;
}

export async function createDestination(payload) {
  const { data } = await client.post("/destinations", { destination: payload });
  return data.destination;
}

export async function updateDestination(slug, payload) {
  const { data } = await client.patch(`/destinations/${slug}`, { destination: payload });
  return data.destination;
}

export async function deleteDestination(slug) {
  await client.delete(`/destinations/${slug}`);
}

export async function uploadDestinationPhotos(slug, files) {
  const formData = new FormData();
  Array.from(files).forEach((file) => formData.append("photos[]", file));
  const { data } = await client.post(`/destinations/${slug}/photos`, formData);
  return data.destination;
}

export async function deleteDestinationPhoto(slug, photoId) {
  await client.delete(`/destinations/${slug}/photos/${photoId}`);
}
