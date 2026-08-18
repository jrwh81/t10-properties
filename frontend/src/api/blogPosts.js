import client from "./client";

export async function fetchBlogPosts(params = {}) {
  const { data } = await client.get("/blog_posts", { params });
  return data;
}

export async function fetchBlogPost(slug) {
  const { data } = await client.get(`/blog_posts/${slug}`);
  return data.blog_post;
}

// blog_post_params permits :cover_image directly on create/update, so a
// new cover image just rides along in the same request -- as multipart
// form data when a File is present (axios sets the right headers
// automatically for FormData), or as plain JSON otherwise.
function buildBlogPostBody(payload) {
  if (!(payload.cover_image instanceof File)) {
    return { blog_post: payload };
  }

  const formData = new FormData();
  Object.entries(payload).forEach(([key, value]) => {
    if (value === null || value === undefined) return;
    formData.append(`blog_post[${key}]`, value);
  });
  return formData;
}

export async function createBlogPost(payload) {
  const { data } = await client.post("/blog_posts", buildBlogPostBody(payload));
  return data.blog_post;
}

export async function updateBlogPost(slug, payload) {
  const { data } = await client.patch(`/blog_posts/${slug}`, buildBlogPostBody(payload));
  return data.blog_post;
}

export async function deleteBlogPost(slug) {
  await client.delete(`/blog_posts/${slug}`);
}

export async function fetchComments(blogPostSlug) {
  const { data } = await client.get(`/blog_posts/${blogPostSlug}/comments`);
  return data.comments;
}

export async function createComment(blogPostSlug, payload) {
  const { data } = await client.post(`/blog_posts/${blogPostSlug}/comments`, { comment: payload });
  return data.comment;
}

export async function deleteComment(commentId) {
  await client.delete(`/comments/${commentId}`);
}
