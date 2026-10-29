chrome.runtime.sendMessage({ type: 'status' }, r => {
  const s = document.getElementById('status');
  if (r && r.alive) { s.textContent = 'Connected to the app'; s.className = 'ok'; }
  else { s.textContent = 'App not running — downloads stay in the browser'; s.className = 'off'; }
});
chrome.storage.local.get({ capture: true, sniff: true }, p => {
  for (const k of ['capture', 'sniff']) {
    const el = document.getElementById(k);
    el.checked = p[k];
    el.addEventListener('change', () => chrome.storage.local.set({ [k]: el.checked }));
  }
});
