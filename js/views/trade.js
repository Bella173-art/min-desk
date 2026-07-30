/* ============================================================
   外贸 · 汇率查询(跳转+本地记录) + 行业资讯跳转 + 客户档案 + 合规笔记
   数据: trade_fx trade_customers trade_compliance
   ============================================================ */
App.Views = App.Views || {};
App.Views.trade = (function(){
  var title = '外贸';
  function today(){ return App.Util.todayKey(); }

  var FX_LINKS = [
    {ico:'💱', name:'XE 实时汇率换算', url:'https://www.xe.com/currencyconverter/', desc:'全球货币实时汇率换算'},
    {ico:'🏦', name:'中国银行外汇牌价', url:'https://www.boc.cn/sourcedb/whpj/', desc:'人民币外汇牌价查询'}
  ];
  var NEWS_LINKS = [
    {ico:'🏭', name:'化工网 ChemMade', url:'https://www.chemmade.com', desc:'化工产品与行业资讯'},
    {ico:'🌐', name:'中国化工网', url:'https://www.chemnet.com.cn', desc:'化工行业综合门户'},
    {ico:'📊', name:'商务部', url:'https://www.mofcom.gov.cn', desc:'外贸政策与权威资讯'}
  ];
  var PAIRS = ['USD/CNY','EUR/CNY','JPY/CNY','GBP/CNY','KRW/CNY'];

  function linkCards(arr){
    return arr.map(function(l){
      return '<a class="link-card" href="'+l.url+'" target="_blank" rel="noopener">'+
        '<span class="lc-ico">'+l.ico+'</span><div class="lc-main"><div class="lc-title">'+l.name+'</div>'+
        '<div class="lc-sub">'+l.desc+'</div></div><span class="lc-arrow">›</span></a>';
    }).join('');
  }

  function render(){
    var h='';
    // 汇率
    h+='<div class="card"><div class="card-title"><span class="ico">💱</span>汇率查询</div>';
    h+='<div class="muted sm" style="margin-bottom:8px">点击下方网站查询实时汇率，也可本地记录参考汇率</div>';
    h+=linkCards(FX_LINKS);
    var fx=App.Storage.getList('trade_fx').slice().sort(function(a,b){return b.ts-a.ts;});
    if(fx.length){
      h+='<div class="divider"></div><div class="section-title">本地参考汇率记录</div>';
      h+=fx.slice(0,10).map(function(r){
        return '<div class="rec-row"><div><div class="bold sm">'+App.Util.escape(r.pair)+'</div><div class="muted xs">'+r.date+'</div></div>'+
          '<div class="bold" style="color:var(--blue-deep)">'+App.Util.escape(r.rate)+'</div>'+
          '<button class="btn btn-sm btn-ghost" data-delfx="'+r.id+'" style="padding:3px 8px">删除</button></div>';
      }).join('');
    }
    h+='<button class="btn btn-outline btn-block btn-sm mt8" data-act="fx">➕ 记录参考汇率</button>';
    h+='</div>';

    // 行业资讯
    h+='<div class="card"><div class="card-title"><span class="ico">📰</span>化工外贸行业资讯</div>'+linkCards(NEWS_LINKS)+'</div>';

    // 客户档案
    var cs=App.Storage.getList('trade_customers');
    h+='<div class="card"><div class="card-title"><span class="ico">📇</span>客户档案<span class="more">'+cs.length+' 位</span></div>';
    if(!cs.length) h+='<div class="empty"><span class="ico">📇</span>还没有客户档案</div>';
    else h+=cs.slice().sort(function(a,b){return b.ts-a.ts;}).map(function(c){
      return '<div class="list-item" data-cust="'+c.id+'" style="cursor:pointer"><div class="li-main"><div class="li-title">'+
        App.Util.escape(c.name)+' <span class="chip chip-blue">'+App.Util.escape(c.country||'')+'</span></div>'+
        '<div class="li-sub">'+App.Util.escape(c.company||'')+(c.product?' · '+App.Util.escape(c.product):'')+'</div></div>'+
        '<button class="btn btn-sm btn-ghost" data-delcust="'+c.id+'" style="padding:5px 9px">删除</button></div>';
    }).join('');
    h+='<button class="btn btn-primary btn-block btn-sm mt8" data-act="cust">➕ 新增客户档案</button>';
    h+='</div>';

    // 合规笔记
    var cp=App.Storage.getList('trade_compliance');
    h+='<div class="card"><div class="card-title"><span class="ico">📋</span>化工产品出口合规笔记</div>';
    h+='<div class="field"><label>标题</label><input class="input" id="cp_t" placeholder="如 危险品分类 / MSDS"></div>';
    h+='<div class="field"><label>内容</label><textarea class="textarea" id="cp_c" placeholder="合规要点、证书、申报流程…"></textarea></div>';
    h+='<button class="btn btn-primary btn-block btn-sm" data-act="cpsave">保存笔记</button>';
    if(cp.length){
      h+='<div class="divider"></div>';
      h+=cp.slice().sort(function(a,b){return b.ts-a.ts;}).map(function(n){
        return '<div class="list-item"><div class="li-main"><div class="li-title">'+App.Util.escape(n.title||'(无标题)')+'</div>'+
          '<div class="li-sub" style="white-space:pre-wrap">'+App.Util.escape(n.content)+'</div>'+
          '<div class="li-sub">'+App.Util.fromNow(n.ts)+'</div></div>'+
          '<button class="btn btn-sm btn-ghost" data-delcp="'+n.id+'" style="padding:5px 9px">删除</button></div>';
      }).join('');
    }
    h+='</div>';
    return h;
  }

  function openFx(){
    var html='<div class="modal-head"><h3>记录参考汇率</h3><span class="close" data-close>✕</span></div>'+
      '<div class="field"><label>货币对</label><select class="select" id="fxPair">'+PAIRS.map(function(p){return '<option>'+p+'</option>';}).join('')+'</select></div>'+
      '<div class="field"><label>汇率</label><input class="input" id="fxRate" type="number" step="0.0001" inputmode="decimal" placeholder="如 7.25"></div>'+
      '<div class="field"><label>日期</label><input class="input" id="fxDate" type="date" value="'+today()+'"></div>'+
      '<button class="btn btn-primary btn-block mt12" id="fxSave">保存</button>';
    var box=App.modal(html);
    box.querySelector('[data-close]').addEventListener('click',App.closeModal);
    box.querySelector('#fxSave').addEventListener('click',function(){
      var rate=box.querySelector('#fxRate').value.trim();
      if(!rate){App.toast('请输入汇率');return;}
      App.Storage.push('trade_fx',{id:App.Util.uid(),pair:box.querySelector('#fxPair').value,rate:rate,date:box.querySelector('#fxDate').value||today(),ts:Date.now()});
      App.closeModal();App.toast('已保存');refresh();
    });
    setTimeout(function(){box.querySelector('#fxRate').focus();},100);
  }

  function openCust(){
    var html='<div class="modal-head"><h3>新增客户档案</h3><span class="close" data-close>✕</span></div>'+
      '<div class="field"><label>客户姓名</label><input class="input" id="cuName" placeholder="如 Mr. John"></div>'+
      '<div class="row"><div class="field"><label>公司</label><input class="input" id="cuCompany" placeholder="公司名称"></div>'+
      '<div class="field"><label>国家 / 地区</label><input class="input" id="cuCountry" placeholder="如 德国"></div></div>'+
      '<div class="field"><label>主营产品</label><input class="input" id="cuProduct" placeholder="化工产品"></div>'+
      '<div class="field"><label>联系方式</label><input class="input" id="cuContact" placeholder="邮箱 / WhatsApp"></div>'+
      '<div class="field"><label>备注</label><textarea class="textarea" id="cuNote" placeholder="谈判进度、偏好等"></textarea></div>'+
      '<button class="btn btn-primary btn-block mt12" id="cuSave">保存</button>';
    var box=App.modal(html);
    box.querySelector('[data-close]').addEventListener('click',App.closeModal);
    box.querySelector('#cuSave').addEventListener('click',function(){
      var name=(box.querySelector('#cuName').value||'').trim();
      if(!name){App.toast('请输入客户姓名');return;}
      App.Storage.push('trade_customers',{id:App.Util.uid(),name:name,company:box.querySelector('#cuCompany').value.trim(),country:box.querySelector('#cuCountry').value.trim(),product:box.querySelector('#cuProduct').value.trim(),contact:box.querySelector('#cuContact').value.trim(),note:box.querySelector('#cuNote').value.trim(),ts:Date.now()});
      App.closeModal();App.toast('已保存');refresh();
    });
    setTimeout(function(){box.querySelector('#cuName').focus();},100);
  }

  function viewCust(id){
    var c=App.Storage.getList('trade_customers').find(function(x){return x.id===id;}); if(!c)return;
    var html='<div class="modal-head"><h3>'+App.Util.escape(c.name)+'</h3><span class="close" data-close>✕</span></div>';
    function row(l,v){ return '<div class="rec-row"><span class="muted sm" style="width:80px">'+l+'</span><span style="flex:1">'+App.Util.escape(v||'-')+'</span></div>'; }
    html+=row('公司',c.company)+row('国家 / 地区',c.country)+row('主营产品',c.product)+row('联系方式',c.contact);
    if(c.note) html+='<div class="field"><label>备注</label><div class="sm" style="white-space:pre-wrap;line-height:1.7">'+App.Util.escape(c.note)+'</div></div>';
    var box=App.modal(html);
    box.querySelector('[data-close]').addEventListener('click',App.closeModal);
  }

  function bind(root){
    App.Util.qsa('[data-act]',root).forEach(function(el){
      el.addEventListener('click',function(){
        var a=el.dataset.act;
        if(a==='fx') openFx();
        else if(a==='cust') openCust();
        else if(a==='cpsave'){
          var t=root.querySelector('#cp_t').value.trim()||'(无标题)';
          var c=root.querySelector('#cp_c').value.trim();
          if(!c){App.toast('请输入内容');return;}
          App.Storage.push('trade_compliance',{id:App.Util.uid(),title:t,content:c,ts:Date.now()});
          App.toast('已保存');refresh();
        }
      });
    });
    App.Util.qsa('[data-delfx]',root).forEach(function(el){el.addEventListener('click',function(){App.Storage.removeById('trade_fx',el.dataset.delfx);refresh();});});
    App.Util.qsa('[data-delcust]',root).forEach(function(el){el.addEventListener('click',function(e){e.stopPropagation();App.Storage.removeById('trade_customers',el.dataset.delcust);refresh();});});
    App.Util.qsa('[data-cust]',root).forEach(function(el){el.addEventListener('click',function(){viewCust(el.dataset.cust);});});
    App.Util.qsa('[data-delcp]',root).forEach(function(el){el.addEventListener('click',function(){App.Storage.removeById('trade_compliance',el.dataset.delcp);refresh();});});
  }
  function refresh(){var c=document.getElementById('viewContainer');if(!c)return;c.innerHTML=render();bind(c);}
  function mount(c){bind(c);}
  return {title:title,render:render,mount:mount,refresh:refresh};
})();
