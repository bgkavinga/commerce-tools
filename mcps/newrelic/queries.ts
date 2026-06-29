export const NRQL_SINGLE_ACCOUNT_QUERY = `
  query NrqlSingleAccount($accountId: Int!, $nrql: Nrql!) {
    actor {
      account(id: $accountId) {
        nrql(query: $nrql) {
          results
        }
      }
    }
  }
`;

export const ENTITY_SEARCH_QUERY = `
  query EntitySearch($searchQuery: String!) {
    actor {
      entitySearch(query: $searchQuery) {
        query
        results {
          entities {
            accountId
            guid
            name
            tags {
              key
              values
            }
          }
        }
      }
    }
  }
`;
