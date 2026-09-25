/* Optional analytics: fixed event names only; never collect personal details. */
(() => {
  'use strict';
  const endpoint = window.PORTFOLIO_CONFIG?.ANALYTICS_ENDPOINT;
  if (!endpoint) return;
  try { if (new URL(endpoint).protocol !== 'https:') return; } catch { return; }
  const script = document.createElement('script');
  script.src = 'https://gc.zgo.at/count.js';
  script.async = true;
  script.dataset.goatcounter = endpoint;
  document.head.append(script);
  const pending = [];
  const send = name => {
    try {
      if (window.goatcounter?.count) window.goatcounter.count({path:name,title:name,event:true});
      else if (pending.length < 30) pending.push(name);
    } catch { /* Analytics must never interrupt a visitor's action. */ }
  };
  script.addEventListener('load', () => pending.splice(0).forEach(send));
  document.addEventListener('click', event => {
    const link = event.target.closest('a');
    if (!link) return;
    if (link.matches('[data-service]')) send('service-cta-' + link.dataset.service);
    else if (link.getAttribute('href') === '#contact') send('primary-cta');
    if (link.hasAttribute('download')) send('cv-download');
  });
  document.addEventListener('portfolio:copy-email', () => send('copy-email'));
})();
