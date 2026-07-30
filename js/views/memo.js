/* ============================================================
   备忘录 · 碎片化随手记事
   数据: memos [{id,text,ts}]
   ============================================================ */
App.Views = App.Views || {};
App.Views.memo = (function(){
  var title = '备忘录';
  function memos(){ return App.Storage.getList('memos'); }

  function render(){
    var list=memos().slice().sort(function(a,b){ return b.ts-a.ts; });
    var h='<div class="card"><div class="card-title"><span class="ico">📝</span>备忘录<span class="more">'+list.length+' 条</span></div>';
    h+='<div class="field" style="display:flex;gap:8px;margin-bottom:12px"><input class="input" id="memoInput" placeholder="随手记一笔…">'+
      '<button class="btn btn-primary" id="memoAdd">添加</button></div>';
    if(!list.length) h+='<div class="empty"><span class="ico">📝</span>还没有备忘，想到什么记下来</div>';
    else h+=list.map(function(m){
      return '<div class="list-item"><div class="li-main"><div class="li-title sm" style="white-space:pre-wrap">'+App.Util.escape(m.text)+'</div>'+
        '<div class="li-sub">'+App.Util.fromNow(m.ts)+'</div></div>'+
        '<button class="btn btn-sm btn-ghost" data-del="'+m.id+'" style="padding:5px 9px">删除</button></div>';
    }).join('');
    h+='</div>';
    return h;
  }

  function bind(root){
    var add=root.querySelector('#memoAdd'), inp=root.querySelector('#memoInput');
    add.addEventListener('click', function(){
      var v=(inp.value||'').trim();
      if(!v){ App.toast('请输入内容'); return; }
      App.Storage.push('memos', {id:App.Util.uid(), text:v, ts:Date.now()});
      App.toast('已添加'); refresh();
    });
    inp.addEventListener('keydown', function(e){ if(e.key==='Enter') add.click(); });
    App.Util.qsa('[data-del]',root).forEach(function(el){
      el.addEventListener('click', function(){ App.Storage.removeById('memos', el.dataset.del); refresh(); });
    });
  }

  function refresh(){ var c=document.getElementById('viewContainer'); if(!c) return; c.innerHTML=render(); bind(c); }
  function mount(c){ bind(c); }
  return {title:title,render:render,mount:mount,refresh:refresh};
})();
