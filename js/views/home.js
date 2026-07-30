/* ============================================================
   首页 · 今日待办 + 健身快速打卡 + 工作台总览
   ============================================================ */
App.Views = App.Views || {};
App.Views.home = (function(){
  var title = '首页';

  function todosToday(){
    var list = App.Storage.getList('todos');
    return list.filter(function(t){ return !t.done; }).slice(0,5);
  }
  function renderHomeTodos(){
    var list = todosToday();
    if(!list.length) return '<div class="empty"><span class="ico">🌤️</span>今天没有未完成待办，很棒～</div>';
    return list.map(function(t){
      return '<div class="list-item"><div class="check" data-todo="'+t.id+'"></div>'+
        '<div class="li-main"><div class="li-title">'+App.Util.escape(t.text)+'</div>'+
        '<div class="li-sub">'+App.Util.fromNow(t.ts)+'</div></div></div>';
    }).join('');
  }

  function todayFit(){
    var logs = App.Storage.getList('fitness_logs');
    var today = App.Util.todayKey();
    return logs.filter(function(l){ return l.date===today; });
  }
  function renderHomeFit(){
    var todayLogs = todayFit();
    var types = ['爬坡','壶铃','拉伸'];
    var btns = types.map(function(t){
      var done = todayLogs.some(function(l){ return l.type===t; });
      var st = done?'background:var(--green-bg);color:var(--green)':'';
      return '<button class="quick-btn" data-fit="'+t+'" style="'+st+'">'+(done?'✓ ':'')+t+'</button>';
    }).join('');
    var tip = todayLogs.length
      ? '<div class="muted sm">今日已打卡 '+todayLogs.length+' 项运动，继续保持</div>'
      : '<div class="muted sm">还没开始今天的运动，点上方快速打卡吧</div>';
    return '<div class="flex" style="gap:8px;margin-bottom:10px">'+btns+'</div>'+tip;
  }

  function render(){
    var S = App.Storage, d = new Date();
    // 财务
    var recs = S.getList('finance_records'), mk = App.Util.monthKey();
    var monthRecs = recs.filter(function(r){ return r.month===mk; });
    var income=0, expense=0;
    monthRecs.forEach(function(r){ if(r.type==='收入') income+=+r.amount||0; else expense+=+r.amount||0; });
    var balance = income-expense;
    // 计数
    var todos = S.getList('todos');
    var todoUndone = todos.filter(function(t){return !t.done;}).length;
    var words = S.getList('words').length;
    var diaries = S.getList('diaries').length;
    var age = App.Util.ageDetail(S.get('oscar_birthday'));

    var html = '';
    // 问候卡
    html += '<div class="card" style="background:linear-gradient(135deg,#D9ECFB,#EAF4FD);border:none">'+
      '<div class="bold" style="font-size:19px">嗨，敏 👋</div>'+
      '<div class="muted sm" style="margin-top:5px;line-height:1.7">'+
        (d.getMonth()+1)+'月'+d.getDate()+'日 星期'+App.Util.weekCN()+'　·　'+App.Util.randomQuote()+
      '</div></div>';

    // 待办
    html += '<div class="card"><div class="card-title"><span class="ico">✅</span>今日待办'+
      '<span class="more" data-go="todo">全部 ›</span></div><div id="homeTodos">'+renderHomeTodos()+'</div></div>';

    // 健身
    html += '<div class="card"><div class="card-title"><span class="ico">🏃</span>健身快速打卡'+
      '<span class="more" data-go="fitness">详情 ›</span></div><div id="homeFit">'+renderHomeFit()+'</div></div>';

    // 总览
    html += '<div class="card"><div class="card-title"><span class="ico">📊</span>工作台总览</div>'+
      '<div class="stat-grid">'+
        '<div class="stat-card"><div class="label">本月结余</div><div class="value '+(balance>=0?'green':'red')+'">'+App.Util.money(balance)+'</div></div>'+
        '<div class="stat-card"><div class="label">待办未完成</div><div class="value">'+todoUndone+'</div></div>'+
        '<div class="stat-card"><div class="label">生词本</div><div class="value">'+words+'</div></div>'+
      '</div>'+
      '<div class="stat-grid">'+
        '<div class="stat-card"><div class="label">日记篇数</div><div class="value">'+diaries+'</div></div>'+
        '<div class="stat-card"><div class="label">Oscar</div><div class="value '+(age?'':'')+'">'+(age?age.years+'岁':'未设')+'</div></div>'+
        '<div class="stat-card"><div class="label">本月支出</div><div class="value red">'+App.Util.money(expense)+'</div></div>'+
      '</div>'+
      '<div class="flex aic" style="gap:10px;margin-top:6px;padding:9px 10px;background:var(--blue-light);border-radius:12px">'+
        '<span style="font-size:20px">🐶</span><span class="sm muted">点侧边栏 Oscar 头像进入 Oscar 主页，设置生日后这里会显示年龄</span>'+
      '</div></div>';

    return html;
  }

  function bind(root){
    if(!root) root=document;
    App.Util.qsa('[data-go]', root).forEach(function(el){
      el.addEventListener('click', function(){ App.go(el.dataset.go); });
    });
    App.Util.qsa('[data-todo]', root).forEach(function(el){
      el.addEventListener('click', function(){
        App.Views.todo.toggle(el.dataset.todo);
        var box=document.getElementById('homeTodos'); if(box) box.innerHTML=renderHomeTodos(); bind(box);
      });
    });
    App.Util.qsa('[data-fit]', root).forEach(function(el){
      el.addEventListener('click', function(){
        var type=el.dataset.fit;
        if(App.Views.fitness && App.Views.fitness.quickCheckin){
          App.Views.fitness.quickCheckin(type);
          var box=document.getElementById('homeFit'); if(box) box.innerHTML=renderHomeFit(); bind(box);
        } else { App.go('fitness'); }
      });
    });
  }

  function mount(c){ bind(c); }
  return { title:title, render:render, mount:mount };
})();
