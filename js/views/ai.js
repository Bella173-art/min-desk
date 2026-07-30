/* ============================================================
   AI · 对话界面框架（仅 UI，预留输入输出框，未接入后端）
   数据: ai_chats [{id,role,text,ts}]
   ============================================================ */
App.Views = App.Views || {};
App.Views.ai = (function(){
  var title = 'AI';

  function chats(){ return App.Storage.getList('ai_chats'); }

  function render(){
    var list=chats();
    var h='<div class="card" style="padding:0;overflow:hidden">';
    h+='<div class="card-title" style="padding:14px 16px 8px;margin-bottom:0"><span class="ico">🤖</span>AI 对话'+
      '<span class="more" data-clear style="cursor:pointer">清空</span></div>';
    h+='<div class="muted sm" style="padding:0 16px 10px">仅界面框架，未接入后端。输入会保存在本地。</div>';
    h+='<div id="chatArea" class="chat-area" style="padding:0 16px 10px;max-height:52vh;overflow-y:auto">';
    if(!list.length){
      h+='<div class="bubble bot">你好，敏 👋 这里是 AI 对话的占位界面，输入框和回复区已就绪，但后端调用尚未接入，无法真正对话。</div>';
    } else {
      h+=list.map(function(m){
        return '<div class="bubble '+(m.role==='user'?'user':'bot')+'">'+App.Util.escape(m.text)+'</div>';
      }).join('');
    }
    h+='</div>';
    h+='<div class="chat-input" style="padding:8px 16px 14px"><input class="input" id="aiInput" placeholder="输入消息…" style="flex:1">'+
      '<button class="btn btn-primary" id="aiSend">发送</button></div>';
    h+='</div>';
    h+='<div class="muted xs center" style="margin-top:6px">提示：当前为纯前端 Demo，回复为固定占位文本</div>';
    return h;
  }

  function send(root){
    var inp=root.querySelector('#aiInput'); var v=(inp.value||'').trim();
    if(!v) return;
    App.Storage.push('ai_chats',{id:App.Util.uid(),role:'user',text:v,ts:Date.now()});
    App.Storage.push('ai_chats',{id:App.Util.uid(),role:'bot',text:'（AI 回复占位：后端未接入，暂无法回答。这是预留的对话界面。）',ts:Date.now()});
    refresh();
  }

  function bind(root){
    var inp=root.querySelector('#aiInput'), btn=root.querySelector('#aiSend');
    btn.addEventListener('click', function(){ send(root); });
    inp.addEventListener('keydown', function(e){ if(e.key==='Enter') send(root); });
    var cl=root.querySelector('[data-clear]');
    if(cl) cl.addEventListener('click', function(){
      if(confirm('清空所有对话记录？')){ App.Storage.setList('ai_chats',[]); refresh(); }
    });
    var area=root.querySelector('#chatArea'); if(area) area.scrollTop=area.scrollHeight;
    setTimeout(function(){ inp.focus(); },100);
  }

  function refresh(){
    var c=document.getElementById('viewContainer'); if(!c) return;
    c.innerHTML=render(); bind(c);
    var area=c.querySelector('#chatArea'); if(area) area.scrollTop=area.scrollHeight;
  }
  function mount(c){ bind(c); }
  return {title:title,render:render,mount:mount,refresh:refresh};
})();
