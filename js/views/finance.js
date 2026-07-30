/* ============================================================
   财务记账 · 本月总览(收入/支出/结余) + 收入/支出表单 + 明细
   数据 finance_records: {id,type,amount,category,note,date,month,ts}
   ============================================================ */
App.Views = App.Views || {};
App.Views.finance = (function(){
  var title = '财务';
  var viewMonth = null; // null = 本月

  function curMonth(){ return viewMonth || App.Util.monthKey(); }
  function isThisMonth(){ return !viewMonth; }
  function monthLabel(){ return isThisMonth() ? '本月' : curMonth().slice(0,4)+'年'+(+curMonth().slice(5))+'月'; }

  function monthRecords(){
    var mk = curMonth();
    return App.Storage.getList('finance_records').filter(function(r){ return r.month===mk; });
  }
  function summary(){
    var income=0, expense=0;
    monthRecords().forEach(function(r){ if(r.type==='收入') income+=+r.amount||0; else expense+=+r.amount||0; });
    return {income:income, expense:expense, balance:income-expense};
  }

  var incomeCats  = ['工资','兼职','理财收益','退款','其他'];
  var expenseCats = ['餐饮','交通','购物','生活缴费','娱乐','宠物Oscar','健身','学习','其他'];

  function formHtml(type){
    var cats = type==='收入' ? incomeCats : expenseCats;
    var opts = cats.map(function(c){ return '<option>'+c+'</option>'; }).join('');
    return '<div class="modal-head"><h3>'+(type==='收入'?'➕ 记一笔收入':'➖ 记一笔支出')+'</h3><span class="close" data-close>✕</span></div>'+
      '<div class="field"><label>金额（元）</label><input class="input" id="fAmount" type="number" step="0.01" inputmode="decimal" placeholder="0.00" ></div>'+
      '<div class="field"><label>分类</label><select class="select" id="fCat">'+opts+'</select></div>'+
      '<div class="field"><label>备注</label><input class="input" id="fNote" placeholder="可选"></div>'+
      '<div class="field"><label>日期</label><input class="input" id="fDate" type="date" value="'+App.Util.todayKey()+'"></div>'+
      '<button class="btn btn-primary btn-block mt12" id="fSave">保存</button>';
  }

  function openForm(type){
    var box = App.modal(formHtml(type));
    box.querySelector('[data-close]').addEventListener('click', App.closeModal);
    box.querySelector('#fSave').addEventListener('click', function(){
      var amt = parseFloat(box.querySelector('#fAmount').value);
      if(!amt || amt<=0){ App.toast('请输入金额'); return; }
      var cat = box.querySelector('#fCat').value;
      var note= box.querySelector('#fNote').value.trim();
      var date= box.querySelector('#fDate').value || App.Util.todayKey();
      var d = new Date(date+'T00:00:00');
      var rec = {id:App.Util.uid(), type:type, amount:amt, category:cat, note:note,
        date:date, month:App.Util.monthKey(d), ts:Date.now()};
      App.Storage.push('finance_records', rec);
      App.closeModal();
      App.toast('已记录 '+type);
      // 回到本月方便看到新记录
      viewMonth = null;
      refresh();
    });
    setTimeout(function(){ box.querySelector('#fAmount').focus(); }, 100);
  }

  function detailHtml(){
    var recs = monthRecords().slice().sort(function(a,b){ return b.ts-a.ts; });
    if(!recs.length) return '<div class="empty"><span class="ico">🧾</span>'+monthLabel()+'还没有记账记录</div>';
    return recs.map(function(r){
      var isIn = r.type==='收入';
      var sign = isIn ? '+' : '-';
      return '<div class="list-item">'+
        '<div class="li-main"><div class="li-title">'+App.Util.escape(r.category)+
          (r.note?' <span class="muted sm">· '+App.Util.escape(r.note)+'</span>':'')+'</div>'+
        '<div class="li-sub">'+r.date+'</div></div>'+
        '<div style="text-align:right">'+
          '<div class="bold" style="color:'+(isIn?'var(--green)':'var(--red)')+'">'+sign+App.Util.money(r.amount).replace('¥','')+'</div>'+
          '<button class="btn btn-sm btn-ghost" data-del="'+r.id+'" style="padding:3px 8px;margin-top:4px">删除</button>'+
        '</div>'+
      '</div>';
    }).join('');
  }

  function render(){
    var s = summary();
    return ''+
    '<div class="card" style="text-align:center;background:linear-gradient(135deg,#EAF4FD,#F5FAFF)">'+
      '<div class="muted sm" style="margin-bottom:6px">'+monthLabel()+'结余</div>'+
      '<div style="font-size:32px;font-weight:800;color:'+(s.balance>=0?'var(--green)':'var(--red)')+'">'+App.Util.money(s.balance)+'</div>'+
      '<div class="flex" style="justify-content:center;gap:30px;margin-top:12px">'+
        '<div><div class="muted sm">收入</div><div class="bold" style="color:var(--green)">'+App.Util.money(s.income)+'</div></div>'+
        '<div><div class="muted sm">支出</div><div class="bold" style="color:var(--red)">'+App.Util.money(s.expense)+'</div></div>'+
      '</div>'+
    '</div>'+
    '<div class="flex" style="gap:10px;margin-bottom:14px">'+
      '<button class="btn btn-outline btn-block" data-form="支出">➖ 记支出</button>'+
      '<button class="btn btn-primary btn-block" data-form="收入">➕ 记收入</button>'+
    '</div>'+
    '<div class="card"><div class="card-title"><span class="ico">🧾</span>明细'+
      '<div style="margin-left:auto" class="flex aic">'+
        '<button class="btn btn-sm btn-ghost" data-pm="-1">‹</button>'+
        '<span class="sm" data-today style="margin:0 8px;cursor:pointer">'+monthLabel()+'</span>'+
        '<button class="btn btn-sm btn-ghost" data-pm="1">›</button>'+
      '</div></div>'+
      '<div id="finDetail">'+detailHtml()+'</div></div>';
  }

  function bind(root){
    App.Util.qsa('[data-form]', root).forEach(function(el){
      el.addEventListener('click', function(){ openForm(el.dataset.form); });
    });
    App.Util.qsa('[data-pm]', root).forEach(function(el){
      el.addEventListener('click', function(){
        var mk=curMonth(), y=+mk.slice(0,4), m=+mk.slice(5);
        m += (+el.dataset.pm);
        if(m<1){ m=12; y--; } if(m>12){ m=1; y++; }
        viewMonth = y+'-'+App.Util.pad2(m);
        refresh();
      });
    });
    App.Util.qsa('[data-today]', root).forEach(function(el){
      el.addEventListener('click', function(){ viewMonth=null; refresh(); });
    });
    App.Util.qsa('[data-del]', root).forEach(function(el){
      el.addEventListener('click', function(){
        App.Storage.removeById('finance_records', el.dataset.del);
        refresh();
      });
    });
  }

  function refresh(){
    var c=document.getElementById('viewContainer'); if(!c) return;
    c.innerHTML=render(); bind(c);
  }
  function mount(c){ bind(c); }
  return { title:title, render:render, mount:mount, refresh:refresh };
})();
