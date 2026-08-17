import client from "./client";

export async function fetchBlogPosts(params = {}) {
  const { data } = await client.get("/blog_posts", { params });
  return data;
}

export async function fetchBlogPost(slug) {
  const { data } = await client.get(`/blog_posts/${slug}`);
  return data.blog_post;
}

export async function createBlogPost(payload) {
  const { data } = await client.post("/blog_posts", { blog_post: payload });
  return data.blog_post;
}

export async function updateBlogPost(slug, payload) {
  const { data } = await client.patch(`/blog_posts/${slug}`, { blog_post: payload });
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
