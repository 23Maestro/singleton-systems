const originalFetch = globalThis.fetch;
globalThis.fetch = (input, init) => {
  const url = new URL(String(input));
  if (!["app.asana.com", "api.linear.app", "backend.composio.dev"].includes(url.hostname)) {
    throw new Error("Unexpected task API host in test");
  }
  return originalFetch(`${process.env.TASK_CLOSEOUT_TEST_ORIGIN}${url.pathname}${url.search}`, init);
};
