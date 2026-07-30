/* ============================================================
   宠物Oscar · 生日设置/年龄计算 + 驱虫·体重·换粮·爱吃食物·备注
   数据: oscar_birthday oscar_name oscar_deworm oscar_weight oscar_food oscar_love oscar_memo
   ============================================================ */
App.Views = App.Views || {};
App.Views.pet = (function(){
  var title = '宠物Oscar';

  function birthday(){ return App.Storage.get('oscar_birthday'); }
  function petName(){ return App.Storage.get('oscar_name')||'Oscar'; }
  function today(){ return App.Util.todayKey(); }

  // 通用新增弹窗配置
  var CARDS = {
    oscar_deworm: {popTitle:'新增驱虫记录', fields:[
      {key:'date', label:'日期', type:'date', def:today()},
      {key:'type', label:'类型', type:'select', opts:['内驱虫','外驱虫','内外驱虫']},
      {key:'note', label:'药品 / 备注', type:'text', placeholder:'品牌或剂量'}
    ]},
    oscar_weight: {popTitle:'记录体重', fields:[
      {key:'date', label:'日期', type:'date', def:today()},
      {key:'weight', label:'体重 (kg)', type:'number', placeholder:'12.5'}
    ]},
    oscar_food: {popTitle:'换粮记录', fields:[
      {key:'date', label:'日期', type:'date', def:today()},
      {key:'brand', label:'狗粮品牌', type:'text', placeholder:'如 皇家'},
      {key:'note', label:'备注', type:'text', placeholder:'过渡期 / 适口性'}
    ]}
  };

  function renderHead(){
    var b=birthday(), age=App.Util.ageDetail(b);
    var h='<div class="card" style="text-align:center;background:linear-gradient(135deg,#EAF4FD,#F5FAFF);padding-top:20px">';
    h+='<div id="petAvatar" style="width:110px;height:110px;margin:0 auto 10px"></div>';
    h+='<div style="font-size:24px;font-weight:800">'+App.Util.escape(petName())+'</div>';
    if(age){
      h+='<div class="muted sm" style="margin-top:4px">出生 '+b+'　·　'+age.months+'个月 '+age.days+'天</div>';
      if(age.daysToBirthday>0){
        var toMonths = Math.floor(age.daysToBirthday/30), toDays = age.daysToBirthday%30;
        var toTxt = toMonths>0 ? (toMonths+'个月'+toDays+'天') : (age.daysToBirthday+'天');
        h+='<div style="margin-top:8px"><span class="chip chip-orange">🎂 距生日 '+toTxt+'</span></div>';
      } else if(age.daysToBirthday===0){
        h+='<div style="margin-top:8px"><span class="chip chip-orange">🎂 今天是生日！</span></div>';
      }
    } else {
      h+='<div class="muted sm" style="margin-top:4px">还没设置生日，点下方按钮设置</div>';
    }
    h+='<button class="btn btn-outline btn-sm mt12" data-act="setting">⚙ 设置生日 / 名字</button>';
    h+='</div>';
    return h;
  }

  function recCard(ico,name,key,addLabel,renderItem){
    var list=App.Storage.getList(key).slice().sort(function(a,b){return b.ts-a.ts;});
    var h='<div class="card"><div class="card-title"><span class="ico">'+ico+'</span>'+name+'<span class="more">'+list.length+'条</span></div>';
    if(!list.length) h+='<div class="empty"><span class="ico">'+ico+'</span>暂无记录</div>';
    else h+=list.map(renderItem).join('');
    h+='<button class="btn btn-outline btn-block btn-sm mt8" data-add="'+key+'">'+addLabel+'</button>';
    h+='</div>';
    return h;
  }

  function render(){
    var h=renderHead();

    h+=recCard('💊','驱虫记录','oscar_deworm','➕ 新增驱虫记录',function(r){
      return '<div class="list-item"><div class="li-main"><div class="li-title">'+r.date+' <span class="chip chip-blue">'+App.Util.escape(r.type||'')+'</span></div>'+
        (r.note?'<div class="li-sub">'+App.Util.escape(r.note)+'</div>':'')+'</div>'+
        '<button class="btn btn-sm btn-ghost" data-del="oscar_deworm:'+r.id+'" style="padding:5px 9px">删除</button></div>';
    });

    h+=recCard('⚖️','体重历史','oscar_weight','➕ 记录体重',function(r){
      return '<div class="list-item"><div class="li-main"><div class="li-title">'+r.date+'</div>'+
        '<div class="li-sub">'+App.Util.escape(r.weight||'')+' kg</div></div>'+
        '<button class="btn btn-sm btn-ghost" data-del="oscar_weight:'+r.id+'" style="padding:5px 9px">删除</button></div>';
    });
    // 体重趋势图
    h+='<div class="card"><div class="card-title"><span class="ico">📉</span>体重趋势</div><canvas class="chart-box" id="petWeightChart" style="height:170px"></canvas></div>';

    h+=recCard('🦴','换狗粮','oscar_food','➕ 换粮记录',function(r){
      return '<div class="list-item"><div class="li-main"><div class="li-title">'+r.date+(r.brand?' · '+App.Util.escape(r.brand):'')+'</div>'+
        (r.note?'<div class="li-sub">'+App.Util.escape(r.note)+'</div>':'')+'</div>'+
        '<button class="btn btn-sm btn-ghost" data-del="oscar_food:'+r.id+'" style="padding:5px 9px">删除</button></div>';
    });

    // 爱吃食物（内联）
    var love=App.Storage.getList('oscar_love');
    h+='<div class="card"><div class="card-title"><span class="ico">🍖</span>爱吃食物<span class="more">'+love.length+'种</span></div>';
    h+='<div class="field" style="display:flex;gap:8px;margin-bottom:10px"><input class="input" id="loveInput" placeholder="如 冻干鸡胸肉"><button class="btn btn-primary btn-sm" id="loveAdd">添加</button></div>';
    if(love.length){
      h+='<div class="flex" style="flex-wrap:wrap;gap:6px">';
      h+=love.map(function(x){ return '<span class="chip chip-blue">'+App.Util.escape(x.food)+' <span data-del="oscar_love:'+x.id+'" style="cursor:pointer;margin-left:2px">✕</span></span>'; }).join('');
      h+='</div>';
    } else h+='<div class="muted sm center">添加 Oscar 爱吃的小零食吧</div>';
    h+='</div>';

    // 自定义备注（内联）
    var memo=App.Storage.getList('oscar_memo');
    h+='<div class="card"><div class="card-title"><span class="ico">📝</span>自定义备注</div>';
    h+='<div class="field" style="display:flex;gap:8px;margin-bottom:8px"><input class="input" id="memoInput" placeholder="随手记点什么…"><button class="btn btn-primary btn-sm" id="memoAdd">添加</button></div>';
    if(memo.length){
      h+=memo.slice().sort(function(a,b){return b.ts-a.ts;}).map(function(m){
        return '<div class="list-item"><div class="li-main"><div class="li-title sm">'+App.Util.escape(m.text)+'</div><div class="li-sub">'+App.Util.fromNow(m.ts)+'</div></div>'+
          '<button class="btn btn-sm btn-ghost" data-del="oscar_memo:'+m.id+'" style="padding:5px 9px">删除</button></div>';
      }).join('');
    }
    h+='</div>';

    h+='<div style="text-align:center;padding:8px 0 20px"><div id="petFooter" style="width:70px;height:70px;margin:0 auto;opacity:.8"></div><div class="muted xs" style="margin-top:6px">Oscar 陪你一起记录生活 🐾</div></div>';
    return h;
  }

  function drawWeight(){
    var c=document.getElementById('petWeightChart'); if(!c) return;
    var data=App.Storage.getList('oscar_weight').slice().sort(function(a,b){return a.ts-b.ts;});
    var pts=data.filter(function(r){return r.weight;}).map(function(r){return {label:r.date.slice(5), value:+r.weight};});
    App.Charts.line(c, {series:[{name:'体重',color:'#5BA3E8',points:pts,fill:true}], yTicks:4, valueFmt:function(v){return v.toFixed(1);}});
  }

  function openSetting(){
    var b=birthday(), n=petName();
    var html='<div class="modal-head"><h3>⚙ 设置 Oscar 信息</h3><span class="close" data-close>✕</span></div>'+
      '<div class="field"><label>名字</label><input class="input" id="setName" value="'+App.Util.escape(n)+'"></div>'+
      '<div class="field"><label>生日</label><input class="input" id="setBirth" type="date" value="'+(b||'')+'"></div>'+
      '<div class="muted sm">生日用于自动计算年龄和生日倒计时</div>'+
      '<button class="btn btn-primary btn-block mt12" id="setSave">保存</button>';
    var box=App.modal(html);
    box.querySelector('[data-close]').addEventListener('click',App.closeModal);
    box.querySelector('#setSave').addEventListener('click',function(){
      App.Storage.set('oscar_name', box.querySelector('#setName').value.trim()||'Oscar');
      App.Storage.set('oscar_birthday', box.querySelector('#setBirth').value||null);
      App.closeModal();App.toast('已保存');refresh();
    });
  }

  function openAdd(key){
    var cfg=CARDS[key]; if(!cfg) return;
    var fh='<div class="modal-head"><h3>'+cfg.popTitle+'</h3><span class="close" data-close>✕</span></div>';
    cfg.fields.forEach(function(f){
      var def=f.def?(' value="'+f.def+'"'):'', ph=f.placeholder?(' placeholder="'+f.placeholder+'"'):'';
      if(f.type==='select'){
        fh+='<div class="field"><label>'+f.label+'</label><select class="select" id="f_'+f.key+'">'+f.opts.map(function(o){return '<option>'+o+'</option>';}).join('')+'</select></div>';
      } else {
        fh+='<div class="field"><label>'+f.label+'</label><input class="input" id="f_'+f.key+'" type="'+f.type+'"'+ph+def+'></div>';
      }
    });
    fh+='<button class="btn btn-primary btn-block mt12" id="addSave">保存</button>';
    var box=App.modal(fh);
    box.querySelector('[data-close]').addEventListener('click',App.closeModal);
    box.querySelector('#addSave').addEventListener('click',function(){
      var rec={id:App.Util.uid(), ts:Date.now()};
      cfg.fields.forEach(function(f){ rec[f.key]=box.querySelector('#f_'+f.key).value.trim(); });
      App.Storage.push(key, rec);
      App.closeModal();App.toast('已保存');refresh();
    });
    setTimeout(function(){ var first=box.querySelector('.input'); if(first) first.focus(); },100);
  }

  function bind(root){
    App.Oscar.photoInto(root.querySelector('#petAvatar'), {size:110, border:true});
    var foot=root.querySelector('#petFooter'); if(foot) App.Oscar.photoInto(foot,{size:70, border:false});
    App.Util.qsa('[data-act]',root).forEach(function(el){
      el.addEventListener('click',function(){ if(el.dataset.act==='setting') openSetting(); });
    });
    App.Util.qsa('[data-add]',root).forEach(function(el){
      el.addEventListener('click',function(){ openAdd(el.dataset.add); });
    });
    App.Util.qsa('[data-del]',root).forEach(function(el){
      el.addEventListener('click',function(){
        var p=el.dataset.del.split(':'), key=p[0], id=p[1];
        App.Storage.removeById(key,id); refresh();
      });
    });
    var loveAdd=root.querySelector('#loveAdd');
    if(loveAdd) loveAdd.addEventListener('click',function(){
      var inp=root.querySelector('#loveInput'); var v=(inp.value||'').trim();
      if(!v){App.toast('请输入食物');return;}
      App.Storage.push('oscar_love',{id:App.Util.uid(),food:v,ts:Date.now()});
      App.toast('已添加');refresh();
    });
    var memoAdd=root.querySelector('#memoAdd');
    if(memoAdd) memoAdd.addEventListener('click',function(){
      var inp=root.querySelector('#memoInput'); var v=(inp.value||'').trim();
      if(!v){App.toast('请输入内容');return;}
      App.Storage.push('oscar_memo',{id:App.Util.uid(),text:v,ts:Date.now()});
      App.toast('已添加');refresh();
    });
  }

  function refresh(){
    var c=document.getElementById('viewContainer'); if(!c)return;
    c.innerHTML=render(); bind(c); setTimeout(drawWeight,0);
  }
  function mount(c){ bind(c); setTimeout(drawWeight,0); }
  return { title:title, render:render, mount:mount, refresh:refresh };
})();
