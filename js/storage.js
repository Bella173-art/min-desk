/* ============================================================
   Storage · localStorage 统一封装（前缀 min_，JSON 序列化）
   挂载到 window.App.Storage
   ============================================================ */
(function(){
  window.App = window.App || {};
  var PREFIX = 'min_';
  function k(key){ return PREFIX + key; }

  App.Storage = {
    get: function(key, def){
      try{
        var raw = localStorage.getItem(k(key));
        if(raw === null) return def !== undefined ? def : null;
        return JSON.parse(raw);
      }catch(e){ return def !== undefined ? def : null; }
    },
    set: function(key, val){
      try{ localStorage.setItem(k(key), JSON.stringify(val)); return true; }
      catch(e){ console.warn('[Storage] set 失败', key, e); return false; }
    },
    remove: function(key){ localStorage.removeItem(k(key)); },
    has: function(key){ return localStorage.getItem(k(key)) !== null; },

    /* ---- 列表便捷操作 ---- */
    getList: function(key){
      var a = this.get(key, []);
      return Array.isArray(a) ? a : [];
    },
    push: function(key, item){
      var a = this.getList(key);
      a.push(item);
      this.set(key, a);
      return a;
    },
    unshift: function(key, item){
      var a = this.getList(key);
      a.unshift(item);
      this.set(key, a);
      return a;
    },
    updateItem: function(key, id, patch){
      var a = this.getList(key);
      for(var i=0;i<a.length;i++){
        if(a[i].id === id){ a[i] = Object.assign({}, a[i], patch); break; }
      }
      this.set(key, a);
      return a;
    },
    removeById: function(key, id){
      var a = this.getList(key).filter(function(x){ return x.id !== id; });
      this.set(key, a);
      return a;
    },
    // 覆盖整个列表（用于排序后保存）
    setList: function(key, arr){ this.set(key, arr); },

    keys: function(){
      var out=[];
      for(var i=0;i<localStorage.length;i++){
        var n=localStorage.key(i);
        if(n && n.indexOf(PREFIX)===0) out.push(n.slice(PREFIX.length));
      }
      return out;
    },
    clearAll: function(){
      this.keys().forEach(function(n){ localStorage.removeItem(k(n)); });
    }
  };
})();
