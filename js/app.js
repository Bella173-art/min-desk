/* ============================================================
   App · 主控制器
   开屏页逻辑 + 侧边栏路由 + 全局设施(modal/toast/导航)
   挂载到 window.App
   ============================================================ */
(function(){
  window.App = window.App || {};
  App.Views = App.Views || {};

  var container, navItems, topbarTitle, current = null;

  /* ---------- 路由 ---------- */
  function go(view){
    var mod = App.Views[view];
    if(!mod){ if(container) container.innerHTML = '<div class="empty"><span class="ico">🚧</span>模块开发中</div>'; return; }
    navItems.forEach(function(b){ b.classList.toggle('active', b.dataset.view===view); });
    topbarTitle.textContent = mod.title || view;
    if(current && App.Views[current] && App.Views[current].unmount) App.Views[current].unmount();
    current = view;
    var html = '';
    try{ html = mod.render ? (mod.render.length ? mod.render(container) : mod.render()) : ''; }
    catch(e){ console.error('[render]',view,e); html='<div class="empty">渲染出错</div>'; }
    if(typeof html === 'string') container.innerHTML = html;
    container.scrollTop = 0;
    if(mod.mount) try{ mod.mount(container); }catch(e){ console.error('[mount]',view,e); }
    try{ location.hash = view; }catch(e){}
  }

  /* ---------- 全局弹窗 (底部 sheet) ---------- */
  function modal(content){
    var root = document.getElementById('modalRoot');
    root.innerHTML = '<div class="modal-mask"><div class="modal" id="appModalBox">'+content+'</div></div>';
    var mask = root.firstChild;
    mask.addEventListener('click', function(e){ if(e.target===mask) closeModal(); });
    var box = document.getElementById('appModalBox');
    return box;
  }
  function closeModal(){
    var root = document.getElementById('modalRoot');
    if(root) root.innerHTML = '';
  }

  /* ---------- Toast ---------- */
  function toast(msg){
    var t = document.createElement('div');
    t.textContent = msg;
    t.setAttribute('style',
      'position:fixed;left:50%;bottom:96px;transform:translateX(-50%);'+
      'background:rgba(43,58,74,.92);color:#fff;padding:9px 20px;border-radius:22px;'+
      'font-size:13px;z-index:400;max-width:80%;text-align:center;animation:fade .18s ease');
    document.body.appendChild(t);
    setTimeout(function(){
      t.style.transition='opacity .3s'; t.style.opacity='0';
      setTimeout(function(){ if(t.parentNode) t.parentNode.removeChild(t); },300);
    }, 1500);
  }

  /* ---------- 开屏页 ---------- */
  function initSplash(){
    document.getElementById('splashDate').textContent = App.Util.longDate();
    document.getElementById('splashQuote').textContent = App.Util.randomQuote();
    // 背景图由 CSS 设置在 .splash-bg，这里不需要再注入
    document.getElementById('splashOscar').innerHTML = '';
    document.getElementById('enterBtn').addEventListener('click', function(){
      document.getElementById('splash').style.display = 'none';
      document.getElementById('workspace').style.display = 'flex';
      var v = (location.hash||'').replace('#','');
      if(!App.Views[v]) v = 'home';
      go(v);
    });
  }

  /* ---------- 侧边栏 ---------- */
  function initSidebar(){
    navItems.forEach(function(b){
      b.addEventListener('click', function(){ go(b.dataset.view); });
    });
    App.Oscar.photoInto(document.getElementById('sidebarLogo'), {size:40, border:false});
    document.getElementById('sidebarLogo').addEventListener('click', function(){
      App.go('pet');
    });
  }

  /* ---------- 初始化 ---------- */
  function init(){
    container = document.getElementById('viewContainer');
    topbarTitle = document.getElementById('topbarTitle');
    navItems = App.Util.qsa('.nav-item');
    initSidebar();
    initSplash();
  }

  /* 对外暴露 */
  App.go = go;
  App.modal = modal;
  App.closeModal = closeModal;
  App.toast = toast;

  document.addEventListener('DOMContentLoaded', init);
})();
