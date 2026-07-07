/**
 * Defines and registers the GraphQL operations this app uses.
 */

import { parse, type DocumentNode } from "graphql";
import { registerGraphQLOperation } from "./api";

const meDocument: DocumentNode = parse(`
  query Me {
    gaiaQueries {
      me {
        id
        username
        personId
        status
      }
    }
  }
`);

const loginDocument: DocumentNode = parse(`
  mutation Login($input: LoginInput!) {
    gaiaMutations {
      login(input: $input) {
        token
        accountId
        personId
      }
    }
  }
`);

const vncCredentialsDocument: DocumentNode = parse(`
  query VncCredentials {
    viewerQueries {
      vncCredentials {
        iframeSrc
      }
    }
  }
`);

/**
 * Registers the operations.
 */
export function registerGaiaOperations(): void {
  registerGraphQLOperation("gaiaQueries.me", meDocument);
  registerGraphQLOperation("gaiaMutations.login", loginDocument);
  registerGraphQLOperation("viewerQueries.vncCredentials", vncCredentialsDocument);
}
