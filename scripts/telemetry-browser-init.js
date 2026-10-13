// Test-only network observation. Never imported by the application.
(() => {
  const original = window.fetch.bind(window);
  window.__medlitTelemetryChecks = [];
  window.fetch = async (...args) => {
    const url = typeof args[0] === 'string' ? args[0] : args[0]?.url;
    if (!url?.includes('/rest/v1/rpc/') && !url?.includes('posthog.com')) return original(...args);
    const item = { url, status: null };
    if (url.endsWith('/collect_product_loop')) {
      const body = JSON.parse(args[1]?.body || '{}');
      item.events = (body.batch || []).map(({ product, environment, event, surface, target, ...rest }) => ({ product, environment, event, surface, target, fields: Object.keys(rest) }));
    }
    window.__medlitTelemetryChecks.push(item);
    const response = await original(...args);
    item.status = response.status;
    return response;
  };
})();
