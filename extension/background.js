// Fetchbench extension: hands downloads and video streams to the desktop app,
// which listens on 127.0.0.1:47321 while it is running.
const API = 'http://127.0.0.1:47321';
const bypass = new Set();
let appCfg = { capture: true, sniff: true, minKB: 512, skipSites: '' };

async function prefs() {
  return chrome.storage.local.get({ capture: true, sniff: true });
}

async function ping() {
  try {
    const r = await fetch(API + '/ping', { signal: AbortSignal.timeout(800) });
    if (!r.ok) return false;
    appCfg = await r.json();
    return true;
  } catch (_) {
    return false;
  }
}

function skipped(url) {
  let host = '';
  try { host = new URL(url).hostname.toLowerCase(); } catch (_) { return false; }
  return (appCfg.skipSites || '')
    .split(/[\s,;]+/)
    .map(s => s.trim().toLowerCase().replace(/^\*\./, ''))
    .filter(Boolean)
    .some(p => host === p || host.endsWith('.' + p));
}

async function cookiesFor(url) {
  try {
    const list = await chrome.cookies.getAll({ url });
    return list.map(c => `${c.name}=${c.value}`).join('; ');
  } catch (_) {
    return '';
  }
}

async function send(payload) {
  try {
    const r = await fetch(API + '/capture', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Fetchbench': '1' },
      body: JSON.stringify(payload)
    });
    return r.ok;
  } catch (_) {
    return false;
  }
}

// ---- Take over normal downloads ----
chrome.downloads.onCreated.addListener(async item => {
  const url = item.finalUrl || item.url;
  if (!/^https?:/i.test(url)) return;          // blob:, data:, file: stay in the browser
  if (bypass.has(url)) { bypass.delete(url); return; }
  if (!(await prefs()).capture) return;
  if (!(await ping()) || !appCfg.capture) return; // app not running: let the browser download
  const size = item.totalBytes > 0 ? item.totalBytes : 0;
  if (size && size < (appCfg.minKB || 0) * 1024) return;
  if (skipped(url)) return;

  try { await chrome.downloads.cancel(item.id); } catch (_) {}
  try { await chrome.downloads.erase({ id: item.id }); } catch (_) {}

  const ok = await send({
    url,
    referer: item.referrer || '',
    filename: item.filename || '',
    size,
    cookies: await cookiesFor(url),
    userAgent: navigator.userAgent,
    kind: 'download'
  });
  if (!ok) {
    bypass.add(url);
    chrome.downloads.download({ url });
  }
});

// ---- Right-click "Download with Fetchbench" ----
const VIDEO_PAGE_PATTERNS = ['*://*.youtube.com/*', '*://youtu.be/*', '*://*.vimeo.com/*', '*://vimeo.com/*', '*://*.dailymotion.com/*', '*://*.ted.com/*', '*://archive.org/*'];
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({ id: 'fb-link', title: 'Download with Fetchbench', contexts: ['link', 'video', 'audio', 'image'] });
  chrome.contextMenus.create({ id: 'fb-page', title: 'Download this video with Fetchbench', contexts: ['page'], documentUrlPatterns: VIDEO_PAGE_PATTERNS });
});
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === 'fb-page' || ((info.linkUrl || '').match(/youtube\.com\/watch|youtu\.be\/|vimeo\.com\/\d/))) {
    if (!(await ping())) return notifyTab(tab?.id, 'Fetchbench isn\'t running.');
    const ok = await send({ url: info.linkUrl || info.pageUrl, referer: '', kind: 'page' });
    if (!ok) notifyTab(tab?.id, 'Fetchbench refused this page (video detection may be off in its settings).');
    return;
  }
  const url = info.linkUrl || info.srcUrl;
  if (!url || !/^https?:/i.test(url)) return;
  if (!(await ping())) return notifyTab(tab?.id, 'Fetchbench isn\'t running.');
  const ok = await send({ url, referer: info.pageUrl || tab?.url || '', cookies: await cookiesFor(url), userAgent: navigator.userAgent, kind: 'download' });
  if (!ok) notifyTab(tab?.id, 'Fetchbench refused this link (capture may be off in its settings).');
});

function notifyTab(tabId, text) {
  if (tabId != null) chrome.tabs.sendMessage(tabId, { type: 'fb-note', text }).catch(() => {});
}

// ---- Remember video streams each tab loads ----
const MEDIA_TYPE = /mpegurl|video\/(mp4|webm|x-matroska|quicktime)|audio\/(mpeg|mp4|aac|ogg)/i;
const SEGMENT = /\.(ts|m4s|aac|vtt|key)(\?|$)|[?&](range|bytestart)=/i;

chrome.webRequest.onHeadersReceived.addListener(
  details => {
    if (details.tabId < 0 || !/^https?:/i.test(details.url) || SEGMENT.test(details.url)) return;
    const ct = (details.responseHeaders || []).find(h => h.name.toLowerCase() === 'content-type')?.value || '';
    const isM3u8 = /\.m3u8(\?|$)/i.test(details.url) || /mpegurl/i.test(ct);
    if (!isM3u8 && !MEDIA_TYPE.test(ct)) return;
    const key = 'tab' + details.tabId;
    chrome.storage.session.get({ [key]: [] }).then(store => {
      const list = store[key].filter(m => m.url !== details.url);
      list.push({ url: details.url, hls: isM3u8, t: Date.now() });
      chrome.storage.session.set({ [key]: list.slice(-25) });
    });
  },
  { urls: ['<all_urls>'], types: ['media', 'xmlhttprequest', 'other'] },
  ['responseHeaders']
);
chrome.tabs.onRemoved.addListener(tabId => chrome.storage.session.remove('tab' + tabId));
chrome.tabs.onUpdated.addListener((tabId, change) => {
  if (change.url) chrome.storage.session.remove('tab' + tabId);
});

// ---- Messages from the page button and the popup ----
chrome.runtime.onMessage.addListener((msg, sender, reply) => {
  (async () => {
    if (msg.type === 'media') {
      if (!(await prefs()).sniff) return reply({ ok: false, text: 'Video detection is off.' });
      if (!(await ping())) return reply({ ok: false, text: 'Start Fetchbench first.' });
      if (!appCfg.sniff) return reply({ ok: false, text: 'Video detection is off in Fetchbench settings.' });
      const tabId = sender.tab?.id;
      let url = /^https?:/i.test(msg.src || '') ? msg.src : null;
      if (!url && tabId != null) {
        const key = 'tab' + tabId;
        const list = (await chrome.storage.session.get({ [key]: [] }))[key];
        // Prefer an HLS master playlist, then the most recent direct video file.
        const hls = list.filter(m => m.hls);
        const pick = (hls.find(m => !/chunklist|media_|\/\d+\.m3u8/i.test(m.url)) || hls[0] || list[list.length - 1]);
        url = pick?.url || null;
      }
      if (!url) return reply({ ok: false, text: 'No downloadable stream found. Protected (DRM) videos can\'t be saved.' });
      const ok = await send({ url, referer: sender.tab?.url || '', filename: msg.title ? msg.title + (/\.m3u8/i.test(url) ? '.ts' : '') : '', cookies: await cookiesFor(url), userAgent: navigator.userAgent, kind: 'media' });
      return reply({ ok, text: ok ? 'Sent to Fetchbench' : 'Fetchbench refused this video.' });
    }
    if (msg.type === 'page') {
      if (!(await prefs()).sniff) return reply({ ok: false, text: 'Video detection is off.' });
      if (!(await ping())) return reply({ ok: false, text: 'Start Fetchbench first.' });
      const ok = await send({ url: msg.url, referer: '', kind: 'page' });
      return reply({ ok, text: ok ? 'Opened in Fetchbench — choose a quality' : 'Fetchbench refused this page (video detection may be off).' });
    }
    if (msg.type === 'status') {
      const alive = await ping();
      return reply({ alive, app: appCfg, prefs: await prefs() });
    }
    if (msg.type === 'sniff-enabled') {
      return reply({ on: (await prefs()).sniff });
    }
    reply({});
  })();
  return true;
});
