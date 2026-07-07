/**
 * Generic API helper for making GraphQL requests.
 * Handles fetching data from the GraphQL server with error handling.
 */

import { print, DocumentNode } from "graphql";
import { executeMutation, type MutationResult } from "@sun/ssr";

export type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
  statusCode?: number;
};

/**
 * Type definition for the operation registry with strong typing.
 */
type OperationRegistry = {
  // Exmaple queries:
  // blogQueries: {
  //   listBlogPosts: DocumentNode;
  //   locateBlogPost: DocumentNode;
  // };
};

/**
 * Registry of GraphQL operations mapped to their query documents.
 */
const operationRegistry: OperationRegistry = {
  // Example queries:
  // blogQueries: {
  //   listBlogPosts: ListBlogPostsDocument,
  //   locateBlogPost: LocateBlogPostDocument,
  // },
};

/**
 * Retrieves a GraphQL operation document by its namespaced path.
 *
 * @param path The dot-separated path to the operation
 * @returns The DocumentNode if found, otherwise undefined.
 */
function getOperation(path: string): DocumentNode | undefined {
  const parts = path.split(".");
  let current: unknown = operationRegistry;
  for (const part of parts) {
    if (
      current &&
      typeof current === "object" &&
      current !== null &&
      part in current
    ) {
      current = (current as Record<string, unknown>)[part];
    } else {
      return undefined;
    }
  }
  return current as DocumentNode;
}

/**
 * Registers a GraphQL operation under a dot-separated path, building the nested
 * registry shape that getOperation traverses.
 *
 * @param operationName The dot-separated path (e.g. "gaiaQueries.me").
 * @param queryDocument The GraphQL query document.
 */
export function registerGraphQLOperation(
  operationName: string,
  queryDocument: DocumentNode,
): void {
  const parts = operationName.split(".");

  let node = operationRegistry as Record<string, unknown>;
  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i];
    if (typeof node[part] !== "object" || node[part] === null) {
      node[part] = {};
    }
    node = node[part] as Record<string, unknown>;
  }
  
  node[parts[parts.length - 1]] = queryDocument;
}

/**
 * Retry with backoff function.
 */
const retryWithBackoff = async <T>(
  fn: () => Promise<T>,
  delays: number[],
): Promise<T> => {
  let lastError: unknown;
  for (let i = 0; i <= delays.length; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (i < delays.length) {
        await new Promise((resolve) => setTimeout(resolve, delays[i]));
      }
    }
  }
  throw lastError;
};

/**
 * Generic function to fetch data from GraphQL server.
 *
 * @param operationName The name of the GraphQL operation to execute.
 * @param variables Variables for the operation (if any).
 * @param authToken Optional Gaia JWT sent as Authorization: Bearer.
 * @returns Promise resolving to ApiResponse.
 */
export async function fetchGraphQLData<T>(
  operationName: string,
  variables?: Record<string, unknown>,
  authToken?: string,
): Promise<ApiResponse<T>> {
  const endpoint =
    process.env.GRAPHQL_ENDPOINT || "http://localhost:8083/graphql";

  const query = getOperation(operationName);
  if (!query) {
    return {
      success: false,
      error: "Unknown operation",
      statusCode: 400,
    };
  }

  try {
    return await retryWithBackoff(async () => {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (authToken) {
        headers.Authorization = `Bearer ${authToken}`;
      }
      const response = await fetch(endpoint, {
        method: "POST",
        headers,
        body: JSON.stringify({
          query: print(query),
          variables,
        }),
      });

      if (!response.ok) {
        throw {
          message: `HTTP ${response.status}: ${response.statusText}`,
          statusCode: response.status,
        };
      }

      const result = await response.json();

      if (result.errors) {
        throw {
          message: result.errors
            .map((e: { message: string }) => e.message)
            .join(", "),
          statusCode: 400,
        };
      }

      if (!result.data) {
        throw { message: "No data returned", statusCode: 400 };
      }

      return {
        success: true,
        data: result.data,
      };
    }, [500, 2000, 4000, 6000]);
  } catch (error) {
    if (
      error &&
      typeof error === "object" &&
      "message" in error &&
      "statusCode" in error
    ) {
      return {
        success: false,
        error: error.message as string,
        statusCode: error.statusCode as number,
      };
    }
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      statusCode: 500,
    };
  }
}

// Example queries
// /**
//  * List operation for blog posts.
//  */
// export async function fetchListBlogPosts() {
//   return fetchGraphQLData("blogQueries.listBlogPosts");
// }

/**
 * Logs in via the gaia/login mutation.
 *
 * @param username the Gaia username
 * @param password the Gaia password
 * @returns the mutation result
 */
export async function mutateLogin(
  username: string,
  password: string,
): Promise<MutationResult> {
  const result = await executeMutation("gaia/login", { username, password });
  if (result.__typename === "Redirect") {
    window.location.assign(result.redirectTo);
  }
  return result;
}

/**
 * Logs out via the gaia/logout mutation.
 *
 * @returns the mutation result
 */
export async function mutateLogout(): Promise<MutationResult> {
  const result = await executeMutation("gaia/logout", {});
  if (result.__typename === "Redirect") {
    window.location.assign(result.redirectTo);
  }
  return result;
}

// /**
//  * Locate operation for blog posts.
//  */
// export async function fetchLocateBlogPost(id: string) {
//   return fetchGraphQLData("blogQueries.locateBlogPost", { id });
// }

// Example mutation
// /**
//  * Create blog post mutation.
//  */
// export async function mutateCreateBlogPost(
//   title: string,
//   input: BlogPostInput,
// ) {
//   return fetchGraphQLData<CreateBlogPostMutation>(
//     "blogMutations.createBlogPost",
//     { title, input },
//   );
// }
