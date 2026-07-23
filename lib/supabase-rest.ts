function supabaseEnv() {
  const url = process.env.SUPABASE_URL?.replace(/\/$/, "");
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) throw new Error("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required.");
  return { url, serviceKey };
}

export async function supabaseRest(path: string, init: RequestInit = {}) {
  const { url, serviceKey } = supabaseEnv();
  const headers = new Headers(init.headers);
  headers.set("apikey", serviceKey);
  headers.set("Authorization", `Bearer ${serviceKey}`);
  if (!headers.has("Content-Type") && init.body && !(init.body instanceof Uint8Array) && !(init.body instanceof ArrayBuffer)) {
    headers.set("Content-Type", "application/json");
  }
  const response = await fetch(`${url}/rest/v1/${path}`, { ...init, headers });
  const body = await response.text();
  if (!response.ok) throw new Error(`Supabase ${path}: ${response.status} ${body}`);
  return body ? JSON.parse(body) : null;
}

export async function supabaseStorageUpload(bucket: string, objectPath: string, file: Blob, contentType: string) {
  const { url, serviceKey } = supabaseEnv();
  const response = await fetch(`${url}/storage/v1/object/${bucket}/${objectPath}`, {
    method: "POST",
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      "Content-Type": contentType,
      "x-upsert": "true",
    },
    body: file,
  });
  const body = await response.text();
  if (!response.ok) throw new Error(`Supabase storage ${objectPath}: ${response.status} ${body}`);
  return `${url}/storage/v1/object/${bucket}/${objectPath}`;
}
