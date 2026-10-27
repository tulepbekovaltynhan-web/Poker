const CACHE = "poker-v2-202610270934";
const FILES = ["./", "index.html", "manifest.webmanifest", "../icon-180.png", "../icon-512.png"];
self.addEventListener("install", e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting())); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  const isPage = req.mode === "navigate" || url.pathname.endsWith("/") || url.pathname.endsWith(".html");
  if (isPage) {
    // страница: сначала сеть (свежая версия), без сети — из кэша
    e.respondWith(fetch(req).then(r => { const copy = r.clone(); caches.open(CACHE).then(c => c.put(req, copy)); return r; }).catch(() => caches.match(req).then(r => r || caches.match("index.html"))));
  } else {
    e.respondWith(caches.match(req).then(r => r || fetch(req).then(resp => { if (resp.ok && (url.origin === location.origin || url.host.includes("gstatic") || url.host.includes("googleapis"))) { const copy = resp.clone(); caches.open(CACHE).then(c => c.put(req, copy)); } return resp; })));
  }
});
