import { google } from "googleapis";
import fs from "node:fs/promises";
import path from "node:path";

export async function getGoogleAuth() {
  const clientId = process.env.HOME_TASKS_GOOGLE_CLIENT_ID;
  const clientSecret = process.env.HOME_TASKS_GOOGLE_CLIENT_SECRET;
  const refreshToken = process.env.HOME_TASKS_GOOGLE_REFRESH_TOKEN;
  if (clientId && clientSecret && refreshToken) {
    const auth = new google.auth.OAuth2(clientId, clientSecret);
    auth.setCredentials({ refresh_token: refreshToken });
    return auth;
  }
  const root = process.cwd();
  const keys = JSON.parse(await fs.readFile(path.join(root, "config/google-workspace/oauth-client.json"), "utf8"));
  for (const name of ["repo-ops-token.json", "workspace-token.json", "flow-token.json"]) {
    try {
      const token = JSON.parse(await fs.readFile(/* turbopackIgnore: true */ path.join(root, ".google-workspace", name), "utf8"));
      const credentials = keys.installed || keys.web;
      const auth = new google.auth.OAuth2(credentials.client_id, credentials.client_secret);
      auth.setCredentials(token);
      return auth;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
    }
  }
  throw new Error("Missing repository Google token. Run npm run google:repo:auth to create .google-workspace/repo-ops-token.json.");
}

export async function getSheetsClient() {
  return google.sheets({ version: "v4", auth: await getGoogleAuth() });
}
