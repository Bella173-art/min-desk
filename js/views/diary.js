/* ============================================================
   日记 · 按日期写日记，本地保存历史
   数据: diaries [{date,content,ts}]  (date 唯一)
   ============================================================ */
App.Views = App.Views || {};
App.Views.diary = (function(){
  var title = '日记';
  var selDate = null;
  function today(){ return App.Util.todayKey(); }
  function diaries(){ return App.Storage.getList('diaries'); }
  function getDiary(date){ return diaries().find(function(d){return d.date===date;}); }

  function render(){
    if(!selDate) selDate=today();
    var d=getDiary(selDate);
    var h='';
    h+='<div class="card"><div class="card-title"><span class="ico">📔</span>写日记</div>';
    h+='<div class="field"><label>日期</label><input class="input" id="diaryDate" type="date" value="'+selDate+'"></div>';
    h+='<div class="field"><label>今日记录</label><textarea class="textarea" id="diaryContent" style="min-height:170px;line-height:1.8" placeholder="今天发生了什么，心情如何…">'+(d?App.Util.escape(d.content):'')+'</textarea></div>';
    h+='<div class="flex" style="gap:10px"><button class="btn btn-primary btn-block" id="diarySave">保存</button>';
    if(d) h+='<button class="btn btn-outline" id="diaryDel" style="width:84px;flex:none">删除</button>';
    h+='</div></div>';

    var all=diaries().slice().sort(function(a,b){ return a.date<b.date?1:-1; });
    h+='<div class="card"><div class="card-title"><span class="ico">📚</span>历史日记<span class="more">'+all.length+' 篇</span></div>';
    if(!all.length) h+='<div class="empty"><span class="ico">📔</span>还没有写日记，从今天开始吧</div>';
    else h+=all.map(function(x){
      return '<div class="list-item" data-load="'+x.date+'" style="cursor:pointer"><div class="li-main"><div class="li-title">'+x.date+'</div>'+
        '<div class="li-sub">'+App.Util.escape(x.content.slice(0,46))+(x.content.length>46?'…':'')+'</div></div>'+
        '<span class="lc-arrow" style="color:var(--text-mute)">›</span></div>';
    }).join('');
    h+='</div>';
    return h;
  }

  function bind(root){
    var dateInput=root.querySelector('#diaryDate');
    dateInput.addEventListener('change', function(){ selDate=dateInput.value||today(); refresh(); });
    root.querySelector('#diarySave').addEventListener('click', function(){
      var content=root.querySelector('#diaryContent').value.trim();
      var list=diaries(), f=list.find(function(x){return x.date===selDate;});
      if(f){ f.content=content; f.ts=Date.now(); }
      else list.push({date:selDate, content:content, ts:Date.now()});
      App.Storage.setList('diaries', list);
      App.toast(content?'已保存':'已清空');
      refresh();
    });
    var del=root.querySelector('#diaryDel');
    if(del) del.addEventListener('click', function(){
      if(confirm('删除 '+selDate+' 的日记？')){
        App.Storage.setList('diaries', diaries().filter(function(x){return x.date!==selDate;}));
        selDate=today(); App.toast('已删除'); refresh();
      }
    });
    App.Util.qsa('[data-load]',root).forEach(function(el){
      el.addEventListener('click', function(){ selDate=el.dataset.load; refresh(); });
    });
  }

  function refresh(){ var c=document.getElementById('viewContainer'); if(!c) return; c.innerHTML=render(); bind(c); }
  function mount(c){ bind(c); }
  return {title:title,render:render,mount:mount,refresh:refresh};
})();
