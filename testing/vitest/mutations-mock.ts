const mocks = vi.hoisted(() => ({
  mockCreateBlogPost: vi.fn(),
  mockMutateCreateBlogPost: vi.fn(),
}));

export const mockCreateBlogPost = mocks.mockCreateBlogPost;
export const mockMutateCreateBlogPost = mocks.mockMutateCreateBlogPost;

vi.mock("~/server/actions/blog-post", () => ({
  createBlogPost: mocks.mockCreateBlogPost,
}));

vi.mock("~/utils/api", async (importOriginal) => ({
  ...((await importOriginal()) as object),
  mutateCreateBlogPost: mocks.mockMutateCreateBlogPost,
}));
