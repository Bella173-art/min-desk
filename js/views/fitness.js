/* ============================================================
   运动健身 · 预设+自定义打卡 / 体重体脂BMI / 减脂目标 / 趋势图 / Apple Watch录入
   数据: fitness_logs(打卡) fitness_body(体重体脂) fitness_profile(身高/目标) fitness_watch(健康数据)
   ============================================================ */
App.Views = App.Views || {};
App.Views.fitness = (function(){
  var title = '运动健身';
  var TYPES = ['爬坡','壶铃','拉伸'];

  function logs(){ return App.Storage.getList('fitness_logs'); }
  function body(){ return App.Storage.getList('fitness_body'); }
  function profile(){ return App.Storage.get('fitness_profile', {height:'', targetWeight:''}); }
  function today(){ return App.Util.todayKey(); }

  // 首页快速打卡入口
  function quickCheckin(type){
    App.Storage.push('fitness_logs', {id:App.Util.uid(), type:type, date:today(), ts:Date.now()});
    App.toast('已打卡 '+type+' ✓');
  }

  function todayLogs(){
    var t = today();
    return logs().filter(function(l){ return l.date===t; });
  }
  function monthStats(){
    var mk = App.Util.monthKey();
    var ml = logs().filter(function(l){ return App.Util.monthKey(new Date(l.date+'T00:00:00'))===mk; });
    var byType = {};
    ml.forEach(function(l){ byType[l.type] = (byType[l.type]||0)+1; });
    return {total:ml.length, byType:byType};
  }
  function latestBody(){
    var b = body().slice().sort(function(a,b){ return b.ts-a.ts; });
    return b[0] || null;
  }

  function render(){
    var p = profile(), lb = latestBody();
    var bmi = (lb && p.height) ? App.Util.bmi(lb.weight, p.height) : null;
    var lvl = App.Util.bmiLevel(bmi);
    var tLogs = todayLogs(), ms = monthStats();
    var h = '';

    // 今日打卡
    h += '<div class="card"><div class="card-title"><span class="ico">🏃</span>今日运动打卡</div>';
    var btns = TYPES.map(function(t){
      var done = tLogs.some(function(l){ return l.type===t; });
      var st = done ? 'background:var(--green-bg);color:var(--green)' : '';
      return '<button class="quick-btn" data-quick="'+t+'" style="'+st+'">'+(done?'✓ ':'')+t+'</button>';
    }).join('');
    h += '<div class="flex" style="gap:8px;margin-bottom:10px">'+btns+'</div>';
    h += '<button class="btn btn-outline btn-block btn-sm" data-act="custom">➕ 自定义运动打卡</button>';
    if(tLogs.length){
      h += '<div class="divider"></div><div class="muted sm" style="margin-bottom:4px">今日已打卡</div>';
      h += tLogs.map(function(l){
        return '<div class="rec-row"><span>'+App.Util.escape(l.type)+(l.duration?' · '+l.duration+'min':'')+'</span><span class="muted sm">'+App.Util.fromNow(l.ts)+'</span></div>';
      }).join('');
    }
    h += '</div>';

    // 本月统计
    h += '<div class="card"><div class="card-title"><span class="ico">📈</span>本月运动统计</div>';
    h += '<div class="stat-grid">'+
      '<div class="stat-card"><div class="label">本月打卡</div><div class="value green">'+ms.total+'</div></div>'+
      '<div class="stat-card"><div class="label">今日</div><div class="value">'+tLogs.length+'</div></div>'+
      '<div class="stat-card"><div class="label">累计</div><div class="value">'+logs().length+'</div></div>'+
    '</div>';
    var ts = Object.keys(ms.byType);
    if(ts.length){
      h += '<div class="flex" style="flex-wrap:wrap;gap:6px">';
      ts.forEach(function(t){ h += '<span class="chip chip-blue">'+App.Util.escape(t)+' '+ms.byType[t]+'</span>'; });
      h += '</div>';
    } else {
      h += '<div class="muted sm center">本月还没开始运动，加油～</div>';
    }
    h += '</div>';

    // 身体数据
    h += '<div class="card"><div class="card-title"><span class="ico">⚖️</span>身体数据与 BMI</div>';
    h += '<div class="row"><div class="field"><label>身高 (cm)</label><input class="input" id="bHeight" value="'+App.Util.escape(p.height)+'" inputmode="decimal" placeholder="165"></div>'+
         '<div class="field"><label>减脂目标 (kg)</label><input class="input" id="bTarget" value="'+App.Util.escape(p.targetWeight)+'" inputmode="decimal" placeholder="52"></div></div>';
    h += '<div class="row"><div class="field"><label>今日体重 (kg)</label><input class="input" id="bWeight" value="'+(lb?lb.weight||'':'')+'" inputmode="decimal" placeholder="54"></div>'+
         '<div class="field"><label>今日体脂 (%)</label><input class="input" id="bFat" value="'+(lb?lb.fat||'':'')+'" inputmode="decimal" placeholder="24"></div></div>';
    h += '<div class="flex aic between" style="margin:10px 0">'+
      '<div><span class="muted sm">BMI </span><b style="font-size:19px">'+(bmi!=null?bmi:'--')+'</b> <span class="chip chip-'+lvl.c+'">'+lvl.t+'</span></div>';
    if(p.targetWeight && lb && lb.weight){
      var diff = (+lb.weight - +p.targetWeight).toFixed(1);
      h += '<div class="sm">距目标 <b style="color:var(--orange)">'+(diff>0?'+':'')+diff+'kg</b></div>';
    }
    h += '</div>';
    h += '<button class="btn btn-primary btn-block" id="bSave">保存今日身体数据</button>';
    h += '</div>';

    // 趋势图
    h += '<div class="card"><div class="card-title"><span class="ico">📉</span>体重体脂趋势</div>';
    h += '<div class="section-title">体重 (kg)</div><canvas class="chart-box" id="wChart" style="height:170px"></canvas>';
    h += '<div class="section-title" style="margin-top:14px">体脂率 (%)</div><canvas class="chart-box" id="fChart" style="height:170px"></canvas>';
    h += '</div>';

    // Apple Watch 录入
    h += '<div class="card"><div class="card-title"><span class="ico">⌚</span>Apple Watch 数据录入<span class="more">复制健康App</span></div>';
    h += '<button class="btn btn-outline btn-block btn-sm" data-act="watch">➕ 录入今日健康数据</button>';
    var wl = App.Storage.getList('fitness_watch').slice().sort(function(a,b){return b.ts-a.ts;}).slice(0,5);
    if(wl.length){
      h += '<div class="divider"></div>';
      h += wl.map(function(w){
        return '<div class="rec-row"><div><div class="bold sm">'+w.date+'</div>'+
          '<div class="muted xs">步数 '+App.Util.escape(w.steps)+' · 心率 '+App.Util.escape(w.hr)+'bpm · 消耗 '+App.Util.escape(w.cal)+'kcal</div></div></div>';
      }).join('');
    } else {
      h += '<div class="muted sm" style="margin-top:8px">网页无法读取 Apple Watch，请从 iPhone 健康 App 复制数据录入</div>';
    }
    h += '</div>';

    return h;
  }

  function drawCharts(){
    var b = body().slice().sort(function(a,c){return a.ts-c.ts;});
    var map = {}; b.forEach(function(r){ map[r.date]=r; });
    var dates = Object.keys(map).sort();
    var wpts=[], fpts=[];
    dates.forEach(function(d){
      var r=map[d], lbl=d.slice(5);
      if(r.weight) wpts.push({label:lbl, value:+r.weight});
      if(r.fat)   fpts.push({label:lbl, value:+r.fat});
    });
    var wc=document.getElementById('wChart'), fc=document.getElementById('fChart');
    if(wc && wpts.length) App.Charts.line(wc,{series:[{name:'体重',color:'#5BA3E8',points:wpts,fill:true}],yTicks:4,valueFmt:function(v){return v.toFixed(1);}});
    else if(wc) App.Charts.line(wc,{series:[{name:'体重',color:'#5BA3E8',points:[]}],yTicks:4});
    if(fc && fpts.length) App.Charts.line(fc,{series:[{name:'体脂',color:'#F5A623',points:fpts,fill:true,fillColor:'#F5A623'}],yTicks:4,valueFmt:function(v){return v.toFixed(1);}});
    else if(fc) App.Charts.line(fc,{series:[{name:'体脂',color:'#F5A623',points:[]}],yTicks:4});
  }

  function saveBody(root){
    var p = { height:(root.querySelector('#bHeight').value||'').trim(), targetWeight:(root.querySelector('#bTarget').value||'').trim() };
    App.Storage.set('fitness_profile', p);
    var weight = parseFloat(root.querySelector('#bWeight').value);
    var fat = parseFloat(root.querySelector('#bFat').value);
    if(!weight && !fat){ App.toast('请输入体重或体脂'); return; }
    App.Storage.push('fitness_body', {id:App.Util.uid(), date:today(), weight:weight||null, fat:fat||null, ts:Date.now()});
    App.toast('已保存身体数据');
    refresh();
  }

  function openCustom(){
    var html = '<div class="modal-head"><h3>自定义运动打卡</h3><span class="close" data-close>✕</span></div>'+
      '<div class="field"><label>运动名称</label><input class="input" id="cType" placeholder="如 跑步 / 游泳"></div>'+
      '<div class="row"><div class="field"><label>时长 (分钟)</label><input class="input" id="cDur" type="number" inputmode="numeric" placeholder="30"></div>'+
      '<div class="field"><label>日期</label><input class="input" id="cDate" type="date" value="'+today()+'"></div></div>'+
      '<button class="btn btn-primary btn-block mt12" id="cSave">保存打卡</button>';
    var box = App.modal(html);
    box.querySelector('[data-close]').addEventListener('click', App.closeModal);
    box.querySelector('#cSave').addEventListener('click', function(){
      var t=(box.querySelector('#cType').value||'').trim();
      if(!t){ App.toast('请输入运动名称'); return; }
      var dur=box.querySelector('#cDur').value;
      var date=box.querySelector('#cDate').value||today();
      App.Storage.push('fitness_logs', {id:App.Util.uid(), type:t, duration:dur?+dur:null, date:date, ts:Date.now()});
      App.closeModal(); App.toast('已打卡 '+t); refresh();
    });
    setTimeout(function(){ box.querySelector('#cType').focus(); },100);
  }

  function openWatch(){
    var html='<div class="modal-head"><h3>⌚ 健康数据录入</h3><span class="close" data-close>✕</span></div>'+
      '<div class="muted sm" style="margin-bottom:10px">从 iPhone 健康 App 复制数据填入下方</div>'+
      '<div class="field"><label>日期</label><input class="input" id="wDate" type="date" value="'+today()+'"></div>'+
      '<div class="row"><div class="field"><label>步数</label><input class="input" id="wSteps" type="number" inputmode="numeric" placeholder="8000"></div>'+
      '<div class="field"><label>静息心率</label><input class="input" id="wHr" type="number" inputmode="numeric" placeholder="68"></div></div>'+
      '<div class="field"><label>活动消耗 (kcal)</label><input class="input" id="wCal" type="number" inputmode="numeric" placeholder="420"></div>'+
      '<button class="btn btn-primary btn-block mt12" id="wSave">保存</button>';
    var box=App.modal(html);
    box.querySelector('[data-close]').addEventListener('click',App.closeModal);
    box.querySelector('#wSave').addEventListener('click',function(){
      var date=box.querySelector('#wDate').value||today();
      var steps=box.querySelector('#wSteps').value;
      var hr=box.querySelector('#wHr').value;
      var cal=box.querySelector('#wCal').value;
      if(!steps&&!hr&&!cal){App.toast('请至少填一项');return;}
      App.Storage.push('fitness_watch',{id:App.Util.uid(),date:date,steps:steps||'--',hr:hr||'--',cal:cal||'--',ts:Date.now()});
      App.closeModal();App.toast('已录入');refresh();
    });
  }

  function bind(root){
    App.Util.qsa('[data-quick]',root).forEach(function(el){
      el.addEventListener('click', function(){ quickCheckin(el.dataset.quick); refresh(); });
    });
    App.Util.qsa('[data-act]',root).forEach(function(el){
      el.addEventListener('click', function(){
        var a=el.dataset.act; if(a==='custom') openCustom(); else if(a==='watch') openWatch();
      });
    });
    var bSave=root.querySelector('#bSave');
    if(bSave) bSave.addEventListener('click', function(){ saveBody(root); });
  }

  function refresh(){
    var c=document.getElementById('viewContainer'); if(!c) return;
    c.innerHTML=render(); bind(c); setTimeout(drawCharts,0);
  }
  function mount(c){ bind(c); setTimeout(drawCharts,0); }
  return { title:title, render:render, mount:mount, refresh:refresh, quickCheckin:quickCheckin };
})();
