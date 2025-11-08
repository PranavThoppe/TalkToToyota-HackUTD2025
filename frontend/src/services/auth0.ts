import { Auth0Provider } from "@auth0/auth0-react";

// Helper to check if env var is valid
const hasValidEnv = (value: string | undefined): boolean => {
  return value !== undefined && 
         value !== "undefined" && 
         typeof value === "string" && 
         value.trim() !== "";
};

const isAuth0Configured = 
  hasValidEnv(import.meta.env.VITE_AUTH0_DOMAIN) && 
  hasValidEnv(import.meta.env.VITE_AUTH0_CLIENT_ID);

export const auth0Config = isAuth0Configured ? {
  domain: import.meta.env.VITE_AUTH0_DOMAIN!,
  clientId: import.meta.env.VITE_AUTH0_CLIENT_ID!,
  authorizationParams: {
    redirect_uri: window.location.origin,
    audience: import.meta.env.VITE_AUTH0_AUDIENCE,
    scope: "openid profile email",
  },
} : null;

if (!auth0Config) {
  console.log("📦 Auth0 not configured. Running without authentication.");
}

export { Auth0Provider };