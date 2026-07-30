/* ============================================================
   Service Worker · 让工作台可离线使用、可"添加到主屏幕"
   策略：网络优先，离线回退缓存（在线永远拿最新版，断网也能用）
   ============================================================ */
var CACHE = 'mint-desk-v2';

// 安装时预热核心资源
var CORE = [
  './',
  './index.html',
  './manifest.json',
  './oscar-icon.svg',
  './css/styles.css',
  './js/storage.js',
  './js/util.js',
  './js/oscar.js',
  './js/charts.js',
  './js/wordbooks.js',
  './js/views/home.js',
  './js/views/todo.js',
  './js/views/finance.js',
  './js/views/fitness.js',
  './js/views/language.js',
  './js/views/pet.js',
  './js/views/trade.js',
  './js/views/ai.js',
  './js/views/diary.js',
  './js/views/memo.js',
  './js/app.js',
  './assets/oscar.jpg'
];

self.addEventListener('install', function(e){
  e.waitUntil(
    caches.open(CACHE).then(function(c){
      // 逐个缓存，单个失败不影响整体
      return Promise.all(CORE.map(function(u){
        return c.add(u).catch(function(){});
      }));
    }).then(function(){
      self.skipWaiting();
    })
  );
});

self.addEventListener('activate', function(e){
  e.waitUntil(
    caches.keys().then(function(keys){
      return Promise.all(keys.filter(function(k){ return k!==CACHE; }).map(function(k){ return caches.delete(k); }));
    }).then(function(){
      self.clients.claim();
    })
  );
});

self.addEventListener('fetch', function(e){
  var req = e.request;
  // 只处理 GET
  if(req.method !== 'GET') return;
  e.respondWith(
    fetch(req).then(function(res){
      // 成功：缓存一份副本再返回
      var copy = res.clone();
      caches.open(CACHE).then(function(c){ c.put(req, copy); }).catch(function(){});
      return res;
    }).catch(function(){
      // 离线：用缓存
      return caches.match(req).then(function(m){
        if(m) return m;
        // 导航请求回退到首页
        if(req.mode === 'navigate') return caches.match('./index.html');
        return new Response('', { status: 503, statusText: 'Offline' });
      });
    })
  );
});
