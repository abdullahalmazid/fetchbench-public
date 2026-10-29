// Adds a small "Download video" button over videos on web pages.
(() => {
  let enabled = true;
  const VIDEO_SITES = ['youtube.com', 'youtu.be', 'vimeo.com', 'dailymotion.com', 'twitch.tv', 'bilibili.com', 'facebook.com',
    'instagram.com', 'tiktok.com', 'x.com', 'twitter.com', 'reddit.com', 'streamable.com', 'ted.com', 'archive.org', 'rumble.com', 'odysee.com'];
  const host = location.hostname.toLowerCase();
  const videoSite = VIDEO_SITES.some(s => host === s || host.endsWith('.' + s));
  chrome.runtime.sendMessage({ type: 'sniff-enabled' }, r => { enabled = !!(r && r.on); });

  const btn = document.createElement('button');
  btn.textContent = 'Download video';
  btn.style.cssText = [
    'position:fixed', 'z-index:2147483647', 'display:none', 'padding:6px 10px', 'border-radius:6px',
    'border:1px solid #ff6b2b', 'background:#0a0a0b', 'color:#f2f2f4', 'font:12px/1.2 "Segoe UI",sans-serif',
    'cursor:pointer', 'box-shadow:0 4px 16px rgba(0,0,0,.5)'
  ].join(';');
  let target = null, hideTimer = null;

  function place(v) {
    const r = v.getBoundingClientRect();
    if (r.width < 200 || r.height < 120) return;
    target = v;
    btn.style.left = Math.max(4, r.right - 140) + 'px';
    btn.style.top = Math.max(4, r.top + 10) + 'px';
    btn.textContent = 'Download video';
    btn.style.display = 'block';
  }

  document.addEventListener('mouseover', e => {
    if (!enabled) return;
    const v = e.target.closest ? e.target.closest('video') : null;
    if (v) { clearTimeout(hideTimer); if (!document.body.contains(btn)) document.body.appendChild(btn); place(v); }
    else if (e.target !== btn) { clearTimeout(hideTimer); hideTimer = setTimeout(() => (btn.style.display = 'none'), 1500); }
  }, true);

  btn.addEventListener('click', e => {
    e.preventDefault(); e.stopPropagation();
    const src = target ? (target.currentSrc || target.src || '') : '';
    btn.textContent = 'Sending…';
    const msg = videoSite
      ? { type: 'page', url: location.href }
      : { type: 'media', src: src.startsWith('blob:') ? '' : src, title: document.title.slice(0, 120) };
    chrome.runtime.sendMessage(msg, r => {
      btn.textContent = r ? r.text : 'Fetchbench isn\'t reachable';
      setTimeout(() => (btn.style.display = 'none'), 2500);
    });
  });

  chrome.runtime.onMessage.addListener(msg => {
    if (msg.type === 'fb-note') {
      const n = document.createElement('div');
      n.textContent = msg.text;
      n.style.cssText = 'position:fixed;right:16px;bottom:16px;z-index:2147483647;padding:10px 14px;border-radius:6px;background:#141416;color:#f2f2f4;border:1px solid #2a2a2f;font:13px "Segoe UI",sans-serif';
      document.body.appendChild(n);
      setTimeout(() => n.remove(), 3500);
    }
  });
})();
