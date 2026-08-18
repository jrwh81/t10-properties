import client from "./client";

export async function fetchProperties(params = {}) {
  const { data } = await client.get("/properties", { params });
  return data;
}

export async function fetchProperty(slug) {
  const { data } = await client.get(`/properties/${slug}`);
  return data.property;
}

export async function createProperty(payload) {
  const { data } = await client.post("/properties", { property: payload });
  return data.property;
}

export async function updateProperty(slug, payload) {
  const { data } = await client.patch(`/properties/${slug}`, { property: payload });
  return data.property;
}

export async function deleteProperty(slug) {
  await client.delete(`/properties/${slug}`);
}

export async function uploadPropertyPhotos(slug, files) {
  const formData = new FormData();
  Array.from(files).forEach((file) => formData.append("photos[]", file));
  const { data } = await client.post(`/properties/${slug}/photos`, formData);
  return data.property;
}

export async function deletePropertyPhoto(slug, photoId) {
  await client.delete(`/properties/${slug}/photos/${photoId}`);
}
