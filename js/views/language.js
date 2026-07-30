/* ============================================================
   语言学习 · 英语(扇贝单词卡/生词本/口语·商务模板/BBC·TED) · 韩语(短句跟读+笔记/网站) · 笔记(视频剪辑/外贸谈判)
   数据: words newwords study_log ko_notes notes_video notes_deal
   ============================================================ */
App.Views = App.Views || {};
App.Views.language = (function(){
  var title = '语言学习';
  var sub = 'en';           // en | ko | notes
  var curIdx = 0, flipped = false, bookIdx = 0, bookFlipped = false;

  /* ---------- 内置素材 ---------- */
  var ORAL = [
    {en:"How's everything going?", zh:"最近怎么样？"},
    {en:"Long time no see!", zh:"好久不见！"},
    {en:"Could you say that again, please?", zh:"能麻烦再说一遍吗？"},
    {en:"I really appreciate your help.", zh:"非常感谢你的帮助。"},
    {en:"Sounds good to me.", zh:"听起来不错。"},
    {en:"Let me think about it.", zh:"让我考虑一下。"},
    {en:"I couldn't agree more.", zh:"我完全同意。"},
    {en:"Take your time.", zh:"慢慢来，不急。"}
  ];
  var BUSINESS = [
    {scene:"询盘与报价", lines:[
      {en:"We're interested in your chemical products.", zh:"我们对你们的化工产品很感兴趣。"},
      {en:"Could you send us a formal quotation?", zh:"能给我们发一份正式报价吗？"},
      {en:"Sure, here's our offer, valid for 15 days.", zh:"好的，这是我们的报价，15天内有效。"}
    ]},
    {scene:"价格谈判", lines:[
      {en:"Your price is a bit on the high side.", zh:"你们的价格偏高了一些。"},
      {en:"We can offer a discount for larger quantities.", zh:"如果数量大，我们可以给折扣。"},
      {en:"Let's meet halfway on the price.", zh:"价格上我们各让一步吧。"}
    ]},
    {scene:"确认订单与发货", lines:[
      {en:"We'd like to place a trial order first.", zh:"我们想先下一个试单。"},
      {en:"When can you ship the goods?", zh:"什么时候能发货？"},
      {en:"Shipment will be made within 15 days after payment.", zh:"付款后15天内发货。"}
    ]}
  ];
  var KO_SENT = [
    {id:'k1', ko:"안녕하세요", roman:"an-nyeong-ha-se-yo", zh:"你好"},
    {id:'k2', ko:"감사합니다", roman:"gam-sa-ham-ni-da", zh:"谢谢"},
    {id:'k3', ko:"죄송합니다", roman:"joe-song-ham-ni-da", zh:"对不起"},
    {id:'k4', ko:"네, 맞아요", roman:"ne, ma-ja-yo", zh:"是的，没错"},
    {id:'k5', ko:"이름이 뭐예요?", roman:"i-reu-mi mwo-ye-yo?", zh:"你叫什么名字？"},
    {id:'k6', ko:"얼마예요?", roman:"eol-ma-ye-yo?", zh:"多少钱？"},
    {id:'k7', ko:"도와주세요", roman:"do-wa-ju-se-yo", zh:"请帮帮我"},
    {id:'k8', ko:"맛있어요!", roman:"ma-sisseo-yo!", zh:"很好吃！"}
  ];
  var LINKS_EN = [
    {ico:"📻", name:"BBC Learning English", url:"https://www.bbc.co.uk/learningenglish", desc:"权威英语听力与课程"},
    {ico:"🎤", name:"TED Talks", url:"https://www.ted.com", desc:"精彩演讲练听力"}
  ];
  var LINKS_KO = [
    {ico:"📖", name:"Talk To Me In Korean", url:"https://talktomeinkorean.com", desc:"人气韩语入门课程"},
    {ico:"🏫", name:"世宗学堂 (세종학당)", url:"https://www.iksi.or.kr", desc:"官方韩语学习平台"}
  ];

  /* ---------- 数据 ---------- */
  function words(){ return App.Storage.getList('words'); }
  function newwords(){ return App.Storage.getList('newwords'); }
  function studyLog(){ return App.Storage.getList('study_log'); }
  function todayCount(){
    var t=App.Util.todayKey(), r=studyLog().find(function(x){return x.date===t;});
    return r?r.count:0;
  }
  function totalCount(){ return studyLog().reduce(function(s,x){return s+(+x.count||0);},0); }
  function addStudyCount(n){
    var t=App.Util.todayKey(), log=studyLog(), f=log.find(function(x){return x.date===t;});
    if(f) f.count+=n; else log.push({date:t,count:n});
    App.Storage.setList('study_log', log);
  }
  function addNewword(w){
    var nw=newwords();
    if(!nw.some(function(x){return x.word===w.word;})){
      App.Storage.push('newwords', {id:App.Util.uid(), word:w.word, meaning:w.meaning, phonetic:w.phonetic||'', example:w.example||'', ts:Date.now()});
    }
  }

  /* ---------- 单词书进度 ---------- */
  function books(){ return (App.Wordbooks||[]).concat(App.Storage.getList('custom_books')); }
  function curBookId(){ return App.Storage.get('wb_current', books()[0]?books()[0].id:''); }
  function setBook(id){ App.Storage.set('wb_current', id); bookIdx=0; bookFlipped=false; }
  function wbProgress(){ return App.Storage.get('wb_progress', {}); }
  function bookProgress(id){ var p=wbProgress(); if(!p[id]){ p[id]={}; } return p[id]; }
  function setBookKnown(id, word){ var p=wbProgress(); p[id]=p[id]||{}; p[id][word]=1; App.Storage.set('wb_progress',p); }
  function resetBook(id){ var p=wbProgress(); delete p[id]; App.Storage.set('wb_progress',p); bookIdx=0; bookFlipped=false; }
  function curBookObj(){ var bid=curBookId(); return books().find(function(x){return x.id===bid;}) || books()[0] || null; }
  function bookMastered(id){ var b=books().find(function(x){return x.id===id;}); if(!b)return 0; var p=bookProgress(id); return b.words.filter(function(w){return p[w.word]===1;}).length; }
  function bookLeftList(id){ var b=books().find(function(x){return x.id===id;}); if(!b)return []; var p=bookProgress(id); return b.words.filter(function(w){return p[w.word]!==1;}); }
  function bookLeft(id){ return bookLeftList(id).length; }

  /* ---------- 英语子页 ---------- */
  function renderEn(){
    var ws=words(), nw=newwords();
    var h='';
    // 统计 + 录入
    h+='<div class="card"><div class="card-title"><span class="ico">📚</span>英语学习'+
      '<button class="btn btn-sm btn-ghost" data-act="addword" style="margin-left:auto">➕ 录入单词</button></div>';
    h+='<div class="stat-grid">'+
      '<div class="stat-card"><div class="label">今日学习</div><div class="value green">'+todayCount()+'</div></div>'+
      '<div class="stat-card"><div class="label">累计学习</div><div class="value">'+totalCount()+'</div></div>'+
      '<div class="stat-card"><div class="label">生词本</div><div class="value red">'+nw.length+'</div></div>'+
    '</div></div>';

    h+=renderBookCard();

    // 学习卡片
    h+='<div class="card">';
    if(!ws.length){
      h+='<div class="empty"><span class="ico">📝</span>还没有单词，点上方"录入单词"开始学习</div>';
    } else {
      curIdx = curIdx % ws.length;
      var w = ws[curIdx];
      h+='<div style="text-align:center;margin-bottom:6px"><span class="muted sm">第 '+(curIdx+1)+' / '+ws.length+' 词</span></div>';
      h+='<div class="word-card" data-flip>';
      h+='<div class="wc-word">'+App.Util.escape(w.word)+'</div>';
      h+='<div class="wc-phonetic">'+(w.phonetic?App.Util.escape(w.phonetic):'')+'</div>';
      if(flipped){
        if(w.meaning) h+='<div class="wc-meaning">'+App.Util.escape(w.meaning)+'</div>';
        if(w.example) h+='<div class="wc-example">'+App.Util.escape(w.example)+'</div>';
      } else {
        h+='<div class="muted sm" style="margin-top:10px">👆 点击卡片查看释义</div>';
      }
      h+='</div>';
      h+='<div class="flex" style="gap:10px;margin-top:14px">'+
        '<button class="btn btn-outline btn-block" data-study="no">😵 不认识</button>'+
        '<button class="btn btn-primary btn-block" data-study="yes">😊 认识</button>'+
      '</div>';
    }
    h+='</div>';

    // 生词本
    h+='<div class="card"><div class="card-title"><span class="ico">🔖</span>生词本 <span class="more">'+nw.length+' 词</span></div>';
    if(!nw.length){ h+='<div class="empty"><span class="ico">✨</span>暂无生词，学习时点"不认识"会自动加入</div>'; }
    else {
      h+=nw.slice(0,20).map(function(w){
        return '<div class="list-item"><div class="li-main"><div class="li-title">'+App.Util.escape(w.word)+
          (w.meaning?' <span class="muted sm">· '+App.Util.escape(w.meaning)+'</span>':'')+'</div>'+
          (w.example?'<div class="li-sub">'+App.Util.escape(w.example)+'</div>':'')+'</div>'+
          '<button class="btn btn-sm btn-ghost" data-nwdel="'+w.id+'" style="padding:5px 9px">删除</button></div>';
      }).join('');
      if(nw.length>20) h+='<div class="muted sm center mt8">仅显示前20个</div>';
    }
    h+='</div>';

    // 常用口语
    h+='<div class="card"><div class="card-title"><span class="ico">💬</span>常用口语</div>';
    h+=ORAL.map(function(o){
      return '<div class="rec-row"><div><div class="bold sm">'+App.Util.escape(o.en)+'</div><div class="muted xs">'+App.Util.escape(o.zh)+'</div></div></div>';
    }).join('');
    h+='</div>';

    // 商务英语
    h+='<div class="card"><div class="card-title"><span class="ico">🤝</span>外贸商务英语对话</div>';
    h+=BUSINESS.map(function(g){
      var s='<div class="section-title">'+App.Util.escape(g.scene)+'</div>';
      s+=g.lines.map(function(l){
        return '<div class="rec-row"><div><div class="bold sm">'+App.Util.escape(l.en)+'</div><div class="muted xs">'+App.Util.escape(l.zh)+'</div></div></div>';
      }).join('');
      return s;
    }).join('');
    h+='</div>';

    // 外部资源
    h+='<div class="card"><div class="card-title"><span class="ico">🔗</span>英语学习资源（外部跳转）</div>';
    h+=linkCards(LINKS_EN);
    h+='</div>';

    return h;
  }

  /* ---------- 单词书打卡练习卡片 ---------- */
  function renderBookCard(){
    var b=curBookObj(); if(!b) return '';
    var bid=b.id, mastered=bookMastered(bid), total=b.words.length, left=bookLeft(bid);
    var pct= total? Math.round(mastered/total*100):0;
    var h='<div class="card"><div class="card-title"><span class="ico">📖</span>单词书打卡练习<button class="btn btn-sm btn-ghost" data-act="importbook" style="margin-left:auto">📥 导入词书</button></div>';
    /* 词书选择 */
    h+='<div class="muted sm" style="margin-bottom:6px">选择词书</div>';
    h+='<div class="flex" style="gap:8px;flex-wrap:wrap;margin-bottom:14px">';
    var baseBtn='display:inline-flex;align-items:center;gap:4px;padding:6px 13px;border-radius:20px;font-size:13px;border:1px solid var(--line);background:#fff;color:var(--ink);cursor:pointer;';
    books().forEach(function(bk){
      var sel=(bk.id===bid);
      h+='<button data-book="'+bk.id+'" style="'+baseBtn+(sel?'background:var(--blue);color:#fff;border-color:var(--blue);':'')+'">'+bk.ico+' '+App.Util.escape(bk.name)+'</button>';
    });
    h+='</div>';
    /* 当前词书信息 */
    h+='<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">';
    h+='<div><div class="bold">'+b.ico+' '+App.Util.escape(b.name)+'</div><div class="muted xs">'+App.Util.escape(b.desc)+'</div></div>';
    h+='<div style="text-align:right"><div class="muted xs">已掌握</div><div style="font-size:20px;font-weight:800;color:var(--green)">'+mastered+'<span class="muted sm">/'+total+'</span></div>'+(b.id.indexOf('custom_')===0?'<button class="btn btn-sm btn-ghost" data-delbook="'+b.id+'" style="margin-top:6px">🗑️ 删除词书</button>':'')+'</div>';
    h+='</div>';
    /* 进度条 */
    h+='<div style="height:8px;background:var(--line-soft);border-radius:4px;overflow:hidden;margin-bottom:14px"><div style="height:100%;width:'+pct+'%;background:var(--blue);border-radius:4px"></div></div>';
    /* 练习区 */
    if(left===0){
      h+='<div class="empty" style="margin-top:6px"><span class="ico">🎉</span>这本词书已全部掌握！</div>';
      h+='<button class="btn btn-outline btn-block btn-sm" style="margin-top:10px" data-resetbook="'+bid+'">↩️ 重置进度重新练习</button>';
    } else {
      var list=bookLeftList(bid);
      bookIdx = bookIdx % list.length;
      var w=list[bookIdx];
      h+='<div style="text-align:center;margin:6px 0"><span class="muted sm">还剩 '+left+' 词 · 第 '+(bookIdx+1)+' 个</span></div>';
      h+='<div class="word-card" data-bookflip>';
      h+='<div class="wc-word">'+App.Util.escape(w.word)+'</div>';
      h+='<div class="wc-phonetic">'+(w.phonetic?App.Util.escape(w.phonetic):'')+'</div>';
      if(bookFlipped){
        if(w.meaning) h+='<div class="wc-meaning">'+App.Util.escape(w.meaning)+'</div>';
        if(w.example) h+='<div class="wc-example">'+App.Util.escape(w.example)+'</div>';
      } else {
        h+='<div class="muted sm" style="margin-top:10px">👆 点击卡片查看释义</div>';
      }
      h+='</div>';
      h+='<div class="flex" style="gap:10px;margin-top:14px">'+
        '<button class="btn btn-outline btn-block" data-bookstudy="no">😵 不认识</button>'+
        '<button class="btn btn-primary btn-block" data-bookstudy="yes">😊 认识</button>'+
      '</div>';
      h+='<button class="btn btn-ghost btn-sm btn-block" style="margin-top:8px" data-resetbook="'+bid+'">↩️ 重置进度</button>';
    }
    h+='</div>';
    return h;
  }

  function linkCards(arr){
    return arr.map(function(l){
      return '<a class="link-card" href="'+l.url+'" target="_blank" rel="noopener">'+
        '<span class="lc-ico">'+l.ico+'</span><div class="lc-main"><div class="lc-title">'+App.Util.escape(l.name)+'</div>'+
        '<div class="lc-sub">'+App.Util.escape(l.desc)+'</div></div><span class="lc-arrow">›</span></a>';
    }).join('');
  }

  /* ---------- 韩语子页 ---------- */
  function renderKo(){
    var notes = App.Storage.get('ko_notes',{});
    var h='';
    h+='<div class="card"><div class="card-title"><span class="ico">🇰🇷</span>韩语入门短句跟读</div>';
    h+='<div class="muted sm" style="margin-bottom:8px">跟读短句，在笔记框里记录你的发音要点</div>';
    h+=KO_SENT.map(function(s){
      return '<div style="padding:10px 0;border-bottom:1px solid var(--line-soft)">'+
        '<div style="font-size:19px;font-weight:700">'+s.ko+'</div>'+
        '<div class="muted sm">['+s.roman+']  '+s.zh+'</div>'+
        '<input class="input" style="margin-top:6px" data-ko="'+s.id+'" placeholder="笔记：发音/语法要点…" value="'+App.Util.escape(notes[s.id]||'')+'">'+
      '</div>';
    }).join('');
    h+='</div>';
    h+='<div class="card"><div class="card-title"><span class="ico">🔗</span>韩语学习网站（外部跳转）</div>';
    h+=linkCards(LINKS_KO);
    h+='</div>';
    return h;
  }

  /* ---------- 笔记子页 ---------- */
  function renderNotes(){
    var v=App.Storage.getList('notes_video'), d=App.Storage.getList('notes_deal');
    var h='';
    h+=noteCard('🎬','视频剪辑笔记','notes_video',v);
    h+=noteCard('🤝','外贸谈判笔记','notes_deal',d);
    return h;
  }
  function noteCard(ico,name,key,list){
    var h='<div class="card"><div class="card-title"><span class="ico">'+ico+'</span>'+name+'</div>';
    h+='<div class="field"><label>标题</label><input class="input" id="'+key+'_t" placeholder="简短标题"></div>';
    h+='<div class="field"><label>内容</label><textarea class="textarea" id="'+key+'_c" placeholder="详细记录…"></textarea></div>';
    h+='<button class="btn btn-primary btn-block btn-sm" data-note="'+key+'">保存</button>';
    h+='<div class="divider"></div>';
    if(!list.length){ h+='<div class="empty"><span class="ico">🗒️</span>还没有记录</div>'; }
    else {
      h+=list.slice().sort(function(a,b){return b.ts-a.ts;}).map(function(n){
        return '<div class="list-item"><div class="li-main"><div class="li-title">'+App.Util.escape(n.title||'(无标题)')+'</div>'+
          '<div class="li-sub" style="white-space:pre-wrap">'+App.Util.escape(n.content)+'</div>'+
          '<div class="li-sub">'+App.Util.fromNow(n.ts)+'</div></div>'+
          '<button class="btn btn-sm btn-ghost" data-notedel="'+key+':'+n.id+'" style="padding:5px 9px">删除</button></div>';
      }).join('');
    }
    h+='</div>';
    return h;
  }

  /* ---------- 主 render ---------- */
  function render(){
    var content = sub==='en' ? renderEn() : (sub==='ko' ? renderKo() : renderNotes());
    return ''+
    '<div class="tabs">'+
      '<div class="tab '+(sub==='en'?'active':'')+'" data-sub="en">🇬🇧 英语</div>'+
      '<div class="tab '+(sub==='ko'?'active':'')+'" data-sub="ko">🇰🇷 韩语</div>'+
      '<div class="tab '+(sub==='notes'?'active':'')+'" data-sub="notes">🗒️ 笔记</div>'+
    '</div>'+content;
  }

  /* ---------- 录入单词弹窗 ---------- */
  function openAddWord(){
    var html='<div class="modal-head"><h3>录入单词</h3><span class="close" data-close>✕</span></div>'+
      '<div class="field"><label>单词</label><input class="input" id="awWord" placeholder="apple"></div>'+
      '<div class="field"><label>音标 (可选)</label><input class="input" id="awPh" placeholder="/ˈæpl/"></div>'+
      '<div class="field"><label>释义</label><input class="input" id="awMean" placeholder="n. 苹果"></div>'+
      '<div class="field"><label>例句 (可选)</label><textarea class="textarea" id="awEx" placeholder="I eat an apple every day."></textarea></div>'+
      '<button class="btn btn-primary btn-block mt12" id="awSave">保存</button>';
    var box=App.modal(html);
    box.querySelector('[data-close]').addEventListener('click',App.closeModal);
    box.querySelector('#awSave').addEventListener('click',function(){
      var w=(box.querySelector('#awWord').value||'').trim();
      if(!w){App.toast('请输入单词');return;}
      var rec={id:App.Util.uid(), word:w, phonetic:(box.querySelector('#awPh').value||'').trim(),
        meaning:(box.querySelector('#awMean').value||'').trim(), example:(box.querySelector('#awEx').value||'').trim(), ts:Date.now()};
      App.Storage.push('words',rec);
      App.closeModal();App.toast('已录入');refresh();
    });
    setTimeout(function(){box.querySelector('#awWord').focus();},100);
  }

  /* ---------- 导入词书弹窗 ---------- */
  function openImportBook(){
    var html='<div class="modal-head"><h3>导入词书</h3><span class="close" data-close>✕</span></div>'+
      '<div class="field"><label>词书名称</label><input class="input" id="ibName" placeholder="如：我的四级词表"></div>'+
      '<div class="field"><label>描述 (可选)</label><input class="input" id="ibDesc" placeholder="简短说明"></div>'+
      '<div class="field"><label>词表内容</label><textarea class="textarea" id="ibText" style="min-height:200px" placeholder="每行一个单词，支持三种格式：单词  或  单词,释义  或  单词,音标,释义"></textarea></div>'+
      '<div class="muted sm" style="margin-bottom:10px">例：apple  或  apple,苹果  或  apple,/aepl/,苹果</div>'+
      '<button class="btn btn-primary btn-block" id="ibSave">解析并保存</button>';
    var box=App.modal(html);
    box.querySelector('[data-close]').addEventListener('click',App.closeModal);
    box.querySelector('#ibSave').addEventListener('click',function(){
      var name=(box.querySelector('#ibName').value||'').trim();
      var text=(box.querySelector('#ibText').value||'').trim();
      if(!name){App.toast('请输入词书名称');return;}
      if(!text){App.toast('请粘贴词表内容');return;}
      var ws=[];
      text.split(/\n/).forEach(function(line){
        line=line.trim(); if(!line) return;
        var p=line.split(',').map(function(s){return s.trim();});
        var w={word:p[0]||'', phonetic:'', meaning:'', example:''};
        if(p.length>=3){ w.phonetic=p[1]; w.meaning=p[2]; }
        else if(p.length===2){ w.meaning=p[1]; }
        if(w.word) ws.push(w);
      });
      if(!ws.length){App.toast('未解析到有效单词');return;}
      var book={id:'custom_'+App.Util.uid(), name:name, desc:(box.querySelector('#ibDesc').value||'').trim()||('导入词书 · '+ws.length+'词'), ico:'📥', words:ws};
      App.Storage.push('custom_books', book);
      App.Storage.set('wb_current', book.id);
      bookIdx=0; bookFlipped=false;
      App.closeModal(); App.toast('已导入 '+ws.length+' 词'); refresh();
    });
    setTimeout(function(){box.querySelector('#ibName').focus();},100);
  }

  /* ---------- 事件 ---------- */
  function bind(root){
    App.Util.qsa('[data-sub]',root).forEach(function(el){
      el.addEventListener('click',function(){ sub=el.dataset.sub; refresh(); });
    });
    App.Util.qsa('[data-act]',root).forEach(function(el){
      el.addEventListener('click',function(){ if(el.dataset.act==='addword') openAddWord(); else if(el.dataset.act==='importbook') openImportBook(); });
    });
    // 翻面
    App.Util.qsa('[data-flip]',root).forEach(function(el){
      el.addEventListener('click',function(){ flipped=!flipped; refresh(); });
    });
    // 认识/不认识
    App.Util.qsa('[data-study]',root).forEach(function(el){
      el.addEventListener('click',function(){
        var ws=words(); if(!ws.length) return;
        var w=ws[curIdx];
        if(el.dataset.study==='no'){ addNewword(w); App.toast('已加入生词本'); }
        addStudyCount(1);
        curIdx=(curIdx+1)%ws.length; flipped=false;
        refresh();
      });
    });
    // 删除自定义词书
    App.Util.qsa('[data-delbook]',root).forEach(function(el){
      el.addEventListener('click',function(){
        var id=el.dataset.delbook;
        var list=App.Storage.getList('custom_books').filter(function(b){return b.id!==id;});
        App.Storage.set('custom_books',list);
        if(curBookId()===id) App.Storage.set('wb_current', books()[0]?books()[0].id:'');
        bookIdx=0; bookFlipped=false;
        App.toast('词书已删除'); refresh();
      });
    });
    // 词书选择
    App.Util.qsa('[data-book]',root).forEach(function(el){
      el.addEventListener('click',function(){ setBook(el.dataset.book); refresh(); });
    });
    // 词书卡片翻面
    App.Util.qsa('[data-bookflip]',root).forEach(function(el){
      el.addEventListener('click',function(){ bookFlipped=!bookFlipped; refresh(); });
    });
    // 词书认识/不认识
    App.Util.qsa('[data-bookstudy]',root).forEach(function(el){
      el.addEventListener('click',function(){
        var bid=curBookId(), list=bookLeftList(bid); if(!list.length) return;
        var w=list[bookIdx];
        if(el.dataset.bookstudy==='no'){ addNewword(w); App.toast('已加入生词本'); }
        else { setBookKnown(bid, w.word); }
        addStudyCount(1);
        bookIdx++; bookFlipped=false; refresh();
      });
    });
    // 词书重置进度
    App.Util.qsa('[data-resetbook]',root).forEach(function(el){
      el.addEventListener('click',function(){ resetBook(el.dataset.resetbook); App.toast('进度已重置'); refresh(); });
    });
    // 删除生词
    App.Util.qsa('[data-nwdel]',root).forEach(function(el){
      el.addEventListener('click',function(){ App.Storage.removeById('newwords',el.dataset.nwdel); refresh(); });
    });
    // 韩语笔记失焦保存
    App.Util.qsa('[data-ko]',root).forEach(function(el){
      el.addEventListener('change',function(){
        var notes=App.Storage.get('ko_notes',{});
        notes[el.dataset.ko]=el.value;
        App.Storage.set('ko_notes',notes);
        App.toast('已保存笔记');
      });
    });
    // 笔记保存
    App.Util.qsa('[data-note]',root).forEach(function(el){
      el.addEventListener('click',function(){
        var key=el.dataset.note;
        var t=root.querySelector('#'+key+'_t').value.trim()||'(无标题)';
        var c=root.querySelector('#'+key+'_c').value.trim();
        if(!c){App.toast('请输入内容');return;}
        App.Storage.push(key,{id:App.Util.uid(),title:t,content:c,ts:Date.now()});
        App.toast('已保存');refresh();
      });
    });
    // 笔记删除
    App.Util.qsa('[data-notedel]',root).forEach(function(el){
      el.addEventListener('click',function(){
        var p=el.dataset.notedel.split(':'), key=p[0], id=p[1];
        App.Storage.removeById(key,id); refresh();
      });
    });
  }

  function refresh(){
    var c=document.getElementById('viewContainer'); if(!c)return;
    c.innerHTML=render(); bind(c);
  }
  function mount(c){ bind(c); }
  return { title:title, render:render, mount:mount, refresh:refresh };
})();
