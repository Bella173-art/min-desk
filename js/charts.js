/* ============================================================
   Charts · 轻量 Canvas 折线图（无第三方依赖）
   挂载到 window.App.Charts
   ============================================================ */
(function(){
  window.App = window.App || {};

  function setupHiDPI(canvas){
    var dpr = window.devicePixelRatio || 1;
    var w = canvas.clientWidth || canvas.parentNode.clientWidth || 300;
    var h = canvas.clientHeight || 200;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    var ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);
    return {ctx:ctx, w:w, h:h};
  }

  /**
   * 画折线图
   * canvas: DOM
   * config: {
   *   series:[{name,color,points:[{label,value}],dash,fill}],
   *   yUnit:'', height:200, yTicks:4, showLegend:true,
   *   min, max, valueFmt
   * }
   */
  function line(canvas, config){
    if(!canvas) return;
    config = config || {};
    var series = config.series || [];
    var padL = 44, padR = 14, padT = 14, padB = 26;
    var env = setupHiDPI(canvas);
    var ctx = env.ctx, W = env.w, H = env.h;
    ctx.clearRect(0,0,W,H);

    if(!series.length || !series[0].points.length){
      ctx.fillStyle = '#A6B2BF'; ctx.font='13px sans-serif';
      ctx.textAlign='center';
      ctx.fillText('暂无数据', W/2, H/2);
      return;
    }

    // 计算数据范围
    var allVals = [];
    series.forEach(function(s){
      s.points.forEach(function(p){ if(p.value!=null) allVals.push(p.value); });
    });
    var dmin = config.min!=null?config.min:Math.min.apply(null,allVals);
    var dmax = config.max!=null?config.max:Math.max.apply(null,allVals);
    if(dmin===dmax){ dmin-=1; dmax+=1; }
    // 留一点边距
    var span = dmax-dmin;
    dmin -= span*0.08; dmax += span*0.08;

    var labels = series[0].points.map(function(p){return p.label;});
    var n = labels.length;
    var plotW = W - padL - padR;
    var plotH = H - padT - padB;

    function x(i){ return padL + (n<=1?plotW/2:plotW*i/(n-1)); }
    function y(v){
      if(dmax===dmin) return padT+plotH/2;
      return padT + plotH*(1-(v-dmin)/(dmax-dmin));
    }

    // 网格 + Y轴刻度
    var ticks = config.yTicks||4;
    ctx.font = '10px sans-serif';
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'right';
    for(var t=0;t<=ticks;t++){
      var val = dmin + (dmax-dmin)*t/ticks;
      var gy = y(val);
      ctx.strokeStyle = '#EEF3F8';
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(padL,gy); ctx.lineTo(W-padR,gy); ctx.stroke();
      ctx.fillStyle = '#A6B2BF';
      var fmt = config.valueFmt || function(v){return Math.round(v*10)/10;};
      ctx.fillText(fmt(val), padL-6, gy);
    }

    // X轴标签（稀疏显示，最多 6 个）
    ctx.fillStyle = '#7C8A99';
    ctx.textAlign='center'; ctx.textBaseline='top';
    var step = Math.max(1, Math.ceil(n/6));
    for(var i=0;i<n;i+=step){
      ctx.fillText(labels[i], x(i), H-padB+6);
    }
    if((n-1) % step !==0 && n>1){ ctx.fillText(labels[n-1], x(n-1), H-padB+6); }

    // 画每条线
    series.forEach(function(s){
      var pts = s.points;
      // 填充区域
      if(s.fill){
        ctx.beginPath();
        ctx.moveTo(x(0), y(pts[0].value));
        for(var i=0;i<pts.length;i++){ ctx.lineTo(x(i), y(pts[i].value)); }
        ctx.lineTo(x(pts.length-1), padT+plotH);
        ctx.lineTo(x(0), padT+plotH);
        ctx.closePath();
        ctx.fillStyle = (s.fillColor||s.color)+'22';
        ctx.fill();
      }
      // 折线
      ctx.beginPath();
      for(var i=0;i<pts.length;i++){
        var px=x(i), py=y(pts[i].value);
        if(i===0) ctx.moveTo(px,py); else ctx.lineTo(px,py);
      }
      ctx.strokeStyle = s.color;
      ctx.lineWidth = s.lw||2.2;
      if(s.dash){ ctx.setLineDash(s.dash); } else { ctx.setLineDash([]); }
      ctx.lineJoin='round'; ctx.lineCap='round';
      ctx.stroke();
      ctx.setLineDash([]);
      // 数据点
      for(var i=0;i<pts.length;i++){
        var px=x(i), py=y(pts[i].value);
        ctx.beginPath(); ctx.arc(px,py,3.2,0,Math.PI*2);
        ctx.fillStyle='#fff'; ctx.fill();
        ctx.lineWidth=2; ctx.strokeStyle=s.color; ctx.stroke();
      }
    });

    // 图例
    if(config.showLegend && series.length>1){
      var lx = padL, ly = padT-2;
      ctx.textBaseline='middle'; ctx.textAlign='left'; ctx.font='11px sans-serif';
      series.forEach(function(s){
        ctx.fillStyle=s.color;
        ctx.fillRect(lx, ly-5, 16, 3);
        ctx.fillStyle='#7C8A99';
        ctx.fillText(s.name, lx+22, ly-3);
        lx += 28 + ctx.measureText(s.name).width + 10;
      });
    }
  }

  App.Charts = { line: line };
})();
