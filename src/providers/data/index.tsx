import { createClient } from "graphql-ws";
import { fetchWrapper } from "./fetch-wrapper";
import graphqlDataProvider, { GraphQLClient, liveProvider as graphqlLiveProvider } from "@refinedev/nestjs-query";

export const API_BASE_URL = "https://api.crm.refine.dev";
export const API_URL = `${API_BASE_URL}/graphql`;
export const WS_URl = "wss://api.crm.refine.dev/graphql";

export const client = new GraphQLClient(API_URL, {
  fetch: (url: string, options: RequestInit) => {
    try {
      return fetchWrapper(url, options);
    } catch (error) {
      return Promise.reject(error as Error);
    }
  },
});

export const wsClient =
  typeof window !== "undefined"
    ? createClient({
        url: WS_URl,
        connectionParams: () => {
          const accessToken = localStorage.getItem("access_token");

          return {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          };
        },
      })
    : undefined;

export const dataProvider = graphqlDataProvider(client);
export const liveProvider = wsClient ? graphqlLiveProvider(wsClient) : undefined;
