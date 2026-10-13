// Injected ONLY by the isolated browser test, never imported into the app.
// This is a synthetic connection, not evidence of a real provider authorization.
(() => {
  if (location.hostname !== 'localhost' && !location.hostname.endsWith('.vercel.app')) return;
  const original = window.fetch.bind(window);
  window.__medlitTestCalls = { auth: 0, generation: 0 };
  window.fetch = async (url, options) => {
    const target = new URL(typeof url === 'string' ? url : url.url || String(url), location.origin);
    if (target.href === 'https://openrouter.ai/api/v1/auth/keys' && options?.body?.includes('medlit-browser-test')) {
      window.__medlitTestCalls.auth++;
      return Response.json({ key: 'sk-or-v1-synthetic-browser-fixture-not-a-real-connection-00000' });
    }
    if (['openrouter.ai', 'api.openai.com', 'api.anthropic.com', 'generativelanguage.googleapis.com'].includes(target.hostname)) {
      window.__medlitTestCalls.generation++;
      throw new Error('The browser fixture blocks all real AI requests.');
    }
    return original(url, options);
  };
})();
