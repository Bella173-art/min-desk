/* ============================================================
   Util · 通用工具函数
   挂载到 window.App.Util
   ============================================================ */
(function(){
  window.App = window.App || {};

  var QUOTES = [
    "今天也把生活收拾得清清爽爽，再出发。",
    "慢慢来，比较快。",
    "把每一件小事做好，就是大事。",
    "稳住节奏，你比你以为的更靠谱。",
    "别急，好结果正在路上。",
    "先完成，再完美。",
    "今天的小努力，是明天的底气。",
    "允许自己慢慢变好。",
    "专注此刻，效率会自己长出来。",
    "把复杂拆成简单，就不可怕了。",
    "休息也是生产力，别硬撑。",
    "你的坚持，时间看得见。",
    "做好今天，就赢了大半。",
    "清清爽爽地开始，轻轻松松地结束。",
    "记得喝水，记得抬头看看天。",
    "Oscar 在等你回家～摇尾巴的那种。",
    "好习惯是攒出来的，不急。",
    "今天也要好好吃饭好好干活。",
    "把待办一件件划掉，真的很爽。",
    "你很棒，继续。"
  ];

  var Util = {
    /* ---- 日期 ---- */
    pad2: function(n){ n=+n; return n<10 ? '0'+n : ''+n; },

    todayKey: function(d){
      d = d || new Date();
      return d.getFullYear()+'-'+Util.pad2(d.getMonth()+1)+'-'+Util.pad2(d.getDate());
    },
    // 标准日期对象 -> key
    dateKey: function(d){ return Util.todayKey(d); },

    monthKey: function(d){
      d = d || new Date();
      return d.getFullYear()+'-'+Util.pad2(d.getMonth()+1);
    },

    // 星期几 中文
    weekCN: function(d){
      d = d || new Date();
      return ['日','一','二','三','四','五','六'][d.getDay()];
    },

    // 开屏用：2026年7月30日 星期四
    longDate: function(d){
      d = d || new Date();
      return d.getFullYear()+'年'+(d.getMonth()+1)+'月'+d.getDate()+'日 星期'+Util.weekCN(d);
    },

    // 友好时间：刚刚 / x分钟前 / x小时前 / MM-DD
    fromNow: function(ts){
      var diff = Date.now() - ts;
      if(diff < 60000) return '刚刚';
      if(diff < 3600000) return Math.floor(diff/60000)+'分钟前';
      if(diff < 86400000) return Math.floor(diff/3600000)+'小时前';
      var d = new Date(ts);
      return Util.pad2(d.getMonth()+1)+'-'+Util.pad2(d.getDate());
    },

    /* ---- 随机鼓励语 ---- */
    randomQuote: function(){
      return QUOTES[Math.floor(Math.random()*QUOTES.length)];
    },

    /* ---- 杂项 ---- */
    uid: function(){
      return Date.now().toString(36)+Math.random().toString(36).slice(2,7);
    },
    escape: function(s){
      if(s==null) return '';
      return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
        .replace(/"/g,'&quot;').replace(/'/g,'&#39;');
    },

    // 金额格式化 1234.5 -> ¥1,234.5 ; 1234 -> ¥1,234
    money: function(n){
      if(n==null || isNaN(n)) n=0;
      var neg = n<0; n=Math.abs(n);
      var s = n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g,',').replace(/\.?0+$/,'');
      return (neg?'-':'')+'¥'+s;
    },

    // BMI
    bmi: function(weightKg, heightCm){
      if(!weightKg || !heightCm) return null;
      var h = heightCm/100;
      var v = weightKg/(h*h);
      return Math.round(v*10)/10;
    },
    bmiLevel: function(bmi){
      if(bmi==null) return {t:'--',c:'gray'};
      if(bmi<18.5) return {t:'偏瘦',c:'blue'};
      if(bmi<24) return {t:'正常',c:'green'};
      if(bmi<28) return {t:'偏胖',c:'orange'};
      return {t:'肥胖',c:'red'};
    },

    // 由生日算 X个月X天（按真实日历逐月减，1个月按当月实际天数算）
    ageDetail: function(birthStr){
      if(!birthStr) return null;
      var b = new Date(birthStr);
      if(isNaN(b.getTime())) return null;
      var now = new Date();
      if(now<b) return {months:0, days:0, daysToBirthday:0, totalDays:0};
      // 总天数
      var totalDays = Math.floor((now-b)/(86400000));
      // 按真实日历逐月减，算出满月数和剩余天数
      var months = (now.getFullYear()-b.getFullYear())*12 + (now.getMonth()-b.getMonth());
      var anchor = new Date(b.getFullYear(), b.getMonth()+months, b.getDate());
      if(anchor>now){ months--; anchor = new Date(b.getFullYear(), b.getMonth()+months, b.getDate()); }
      var days = Math.floor((now-anchor)/(86400000));
      // 距下次生日
      var nextB = new Date(now.getFullYear(), b.getMonth(), b.getDate());
      if(nextB < now) nextB.setFullYear(now.getFullYear()+1);
      var daysToNext = Math.ceil((nextB-now)/86400000);
      return {months:Math.max(0,months), days:Math.max(0,days), totalDays:totalDays, daysToBirthday:daysToNext};
    },

    qs: function(sel, root){ return (root||document).querySelector(sel); },
    qsa: function(sel, root){ return Array.prototype.slice.call((root||document).querySelectorAll(sel)); },

    // 绑定事件委托
    on: function(el, type, handler){
      if(!el) return;
      el.addEventListener(type, handler);
    },

    // 创建元素简写
    el: function(tag, cls, html){
      var e=document.createElement(tag);
      if(cls) e.className=cls;
      if(html!=null) e.innerHTML=html;
      return e;
    }
  };

  App.Util = Util;
})();
