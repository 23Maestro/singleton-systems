import { google } from "googleapis";
import { commandCenterAccessError } from "@/lib/command-center-auth";
import { supabaseRest } from "@/lib/supabase-rest";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const headers = {
  "Cache-Control": "private, no-store",
  "X-Robots-Tag": "noindex, nofollow",
};

export async function GET(
  request: Request,
  context: { params: Promise<{ contactId: string }> },
) {
  const denied = commandCenterAccessError(request);
  if (denied) return denied;
  const { contactId } = await context.params;
  if (!/^\d+$/.test(contactId))
    return Response.json(
      { error: "Invalid contact." },
      { status: 400, headers },
    );
  const rows = await supabaseRest(
    `contacts?id=eq.${contactId}&select=id,email`,
  );
  const email = rows?.[0]?.email as string | undefined;
  if (!email)
    return Response.json({ configured: true, messages: [] }, { headers });
  const id = process.env.COMMAND_CENTER_GMAIL_CLIENT_ID;
  const secret = process.env.COMMAND_CENTER_GMAIL_CLIENT_SECRET;
  const refresh = process.env.COMMAND_CENTER_GMAIL_REFRESH_TOKEN;
  if (!id || !secret || !refresh)
    return Response.json({ configured: false, messages: [] }, { headers });
  try {
    const auth = new google.auth.OAuth2(id, secret);
    auth.setCredentials({ refresh_token: refresh });
    const gmail = google.gmail({ version: "v1", auth });
    const result = await gmail.users.threads.list({
      userId: "me",
      q: `{from:${email} to:${email}}`,
      maxResults: 1,
    });
    const threadId = result.data.threads?.[0]?.id;
    if (!threadId)
      return Response.json({ configured: true, messages: [] }, { headers });
    const thread = await gmail.users.threads.get({
      userId: "me",
      id: threadId,
      format: "metadata",
      metadataHeaders: ["From", "To", "Subject", "Date"],
    });
    const messages = (thread.data.messages ?? []).slice(-5).map((message) => ({
      id: message.id,
      snippet: message.snippet ?? "",
      from:
        message.payload?.headers?.find(
          (header) => header.name?.toLowerCase() === "from",
        )?.value ?? "",
      subject:
        message.payload?.headers?.find(
          (header) => header.name?.toLowerCase() === "subject",
        )?.value ?? "",
      date:
        message.payload?.headers?.find(
          (header) => header.name?.toLowerCase() === "date",
        )?.value ?? "",
    }));
    return Response.json(
      {
        configured: true,
        messages,
        gmailUrl: `https://mail.google.com/mail/u/0/#all/${threadId}`,
      },
      { headers },
    );
  } catch (error) {
    return Response.json(
      {
        configured: true,
        messages: [],
        error: error instanceof Error ? error.message : "Gmail read failed.",
      },
      { status: 502, headers },
    );
  }
}
