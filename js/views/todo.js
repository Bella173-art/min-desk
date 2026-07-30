/* ============================================================
   待办事项 · 新增 / 勾选完成 / 筛选全部·未完成·已完成
   ============================================================ */
App.Views = App.Views || {};
App.Views.todo = (function(){
  var title = '待办事项';
  var filter = 'all'; // all | undone | done

  function allList(){ return App.Storage.getList('todos'); }

  function viewList(){
    var list = allList();
    if(filter==='undone') return list.filter(function(t){return !t.done;});
    if(filter==='done')   return list.filter(function(t){return t.done;});
    return list;
  }

  function itemHtml(t){
    return '<div class="list-item">'+
      '<div class="check '+(t.done?'on':'')+'" data-toggle="'+t.id+'">'+(t.done?'✓':'')+'</div>'+
      '<div class="li-main"><div class="li-title '+(t.done?'done':'')+'">'+App.Util.escape(t.text)+'</div>'+
      '<div class="li-sub">'+App.Util.fromNow(t.ts)+'</div></div>'+
      '<button class="btn btn-sm btn-ghost" data-del="'+t.id+'" style="padding:5px 9px">删除</button>'+
    '</div>';
  }

  function listHtml(){
    var list = viewList();
    if(!list.length){
      var msg = filter==='done' ? '还没有已完成的待办'
        : filter==='undone' ? '没有未完成待办，太棒了～'
        : '待办清单是空的，加一条吧';
      return '<div class="empty"><span class="ico">📝</span>'+msg+'</div>';
    }
    return list.map(itemHtml).join('');
  }

  function render(){
    var list = allList();
    var undone = list.filter(function(t){return !t.done;}).length;
    var done = list.length - undone;
    return ''+
    '<div class="card">'+
      '<div class="field" style="display:flex;gap:8px;align-items:flex-end;margin-bottom:0">'+
        '<div style="flex:1"><label>新建待办</label><input class="input" id="todoInput" placeholder="输入待办内容…" ></div>'+
        '<button class="btn btn-primary" id="todoAdd" style="margin-bottom:0">添加</button>'+
      '</div>'+
    '</div>'+
    '<div class="tabs">'+
      '<div class="tab '+(filter==='all'?'active':'')+'" data-filter="all">全部 '+list.length+'</div>'+
      '<div class="tab '+(filter==='undone'?'active':'')+'" data-filter="undone">未完成 '+undone+'</div>'+
      '<div class="tab '+(filter==='done'?'active':'')+'" data-filter="done">已完成 '+done+'</div>'+
    '</div>'+
    '<div class="card" id="todoListBox">'+listHtml()+'</div>';
  }

  function bind(root){
    var input = root.querySelector('#todoInput');
    var addBtn = root.querySelector('#todoAdd');
    function add(){
      var v=(input.value||'').trim();
      if(!v){ App.toast('请输入待办内容'); return; }
      App.Storage.push('todos', {id:App.Util.uid(), text:v, done:false, ts:Date.now()});
      App.toast('已添加');
      input.value='';
      refresh();
    }
    if(addBtn) addBtn.addEventListener('click', add);
    if(input) input.addEventListener('keydown', function(e){ if(e.key==='Enter') add(); });

    App.Util.qsa('[data-filter]', root).forEach(function(el){
      el.addEventListener('click', function(){ filter=el.dataset.filter; refresh(); });
    });
    App.Util.qsa('[data-toggle]', root).forEach(function(el){
      el.addEventListener('click', function(){
        toggle(el.dataset.toggle);
        refresh();
      });
    });
    App.Util.qsa('[data-del]', root).forEach(function(el){
      el.addEventListener('click', function(){
        App.Storage.removeById('todos', el.dataset.del);
        App.toast('已删除');
        refresh();
      });
    });
  }

  function refresh(){
    var c=document.getElementById('viewContainer');
    if(!c) return;
    var cur=document.getElementById('todoListBox');
    if(cur){
      cur.innerHTML=listHtml();
      bind(c);
    } else {
      c.innerHTML=render();
      bind(c);
    }
  }

  // 对外：切换完成状态（首页调用）
  function toggle(id){
    var list=allList();
    for(var i=0;i<list.length;i++){ if(list[i].id===id){ list[i].done=!list[i].done; break; } }
    App.Storage.setList('todos', list);
  }

  function mount(c){ bind(c); }
  return { title:title, render:render, mount:mount, refresh:refresh, toggle:toggle };
})();
