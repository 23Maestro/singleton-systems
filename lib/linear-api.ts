export async function linearGraphql<T>(
  query: string,
  variables?: Record<string, unknown>,
): Promise<T> {
  const key = process.env.LINEAR_API_KEY;
  if (!key) throw new Error("Linear is not configured.");
  const response = await fetch("https://api.linear.app/graphql", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: key },
    body: JSON.stringify({ query, variables }),
    cache: "no-store",
    signal: AbortSignal.timeout(20000),
  });
  const payload = (await response.json()) as {
    data?: T;
    errors?: { message: string }[];
  };
  if (!response.ok || payload.errors?.length || !payload.data) {
    throw new Error(
      payload.errors?.map((error) => error.message).join("; ") ||
        `Linear request failed: ${response.status}`,
    );
  }
  return payload.data;
}
