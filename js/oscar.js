/* ============================================================
   Oscar · 边牧贴纸（手绘 SVG）+ 真实照片
   挂载到 window.App.Oscar
   ============================================================ */
(function(){
  window.App = window.App || {};

  // Oscar 真实照片（红白边牧水彩画）
  var PHOTO = 'assets/oscar.jpg';

  // 核心边牧脸部 SVG（不含外层 svg 标签，便于内联）
  function faceInner(o){
    o = o || {};
    var blush = o.blush !== false;
    var s = '';
    // 耳朵
    s += '<path d="M55,58 C42,18 60,6 74,16 C82,28 78,53 68,68 Z" fill="#2B2B2B"/>';
    s += '<path d="M145,58 C158,18 140,6 126,16 C118,28 122,53 132,68 Z" fill="#2B2B2B"/>';
    s += '<path d="M60,52 C55,28 64,18 72,24 C76,32 74,50 68,60 Z" fill="#E89BAE"/>';
    s += '<path d="M140,52 C145,28 136,18 128,24 C124,32 126,50 132,60 Z" fill="#E89BAE"/>';
    // 头部黑色主体
    s += '<ellipse cx="100" cy="112" rx="61" ry="57" fill="#2B2B2B"/>';
    // 白色鼻梁（爱尔兰标记）
    s += '<path d="M100,58 C109,60 113,74 112,98 C111,122 107,140 100,150 C93,140 89,122 88,98 C87,74 91,60 100,58 Z" fill="#FFFFFF"/>';
    // 白色嘴/下巴围脖
    s += '<path d="M66,134 Q100,166 134,134 Q136,150 100,160 Q64,150 66,134 Z" fill="#FFFFFF"/>';
    // 眼睛（落在黑色区眼眶）
    s += '<ellipse cx="79" cy="100" rx="7" ry="8" fill="#2B2B2B"/>';
    s += '<ellipse cx="121" cy="100" rx="7" ry="8" fill="#2B2B2B"/>';
    s += '<circle cx="81" cy="97" r="2.4" fill="#fff"/>';
    s += '<circle cx="123" cy="97" r="2.4" fill="#fff"/>';
    // 腮红
    if(blush){
      s += '<ellipse cx="68" cy="118" rx="7" ry="4.5" fill="#F2A6B5" opacity="0.55"/>';
      s += '<ellipse cx="132" cy="118" rx="7" ry="4.5" fill="#F2A6B5" opacity="0.55"/>';
    }
    // 鼻子
    s += '<ellipse cx="100" cy="128" rx="8" ry="6" fill="#2B2B2B"/>';
    s += '<ellipse cx="97" cy="126" rx="2" ry="1.4" fill="#fff" opacity="0.6"/>';
    // 嘴
    s += '<path d="M100,134 L100,141" stroke="#2B2B2B" stroke-width="2" fill="none" stroke-linecap="round"/>';
    s += '<path d="M100,141 Q90,150 82,146" stroke="#2B2B2B" stroke-width="2" fill="none" stroke-linecap="round"/>';
    s += '<path d="M100,141 Q110,150 118,146" stroke="#2B2B2B" stroke-width="2" fill="none" stroke-linecap="round"/>';
    // 小舌头
    s += '<path d="M95,144 Q100,152 105,144 Q103,148 100,149 Q97,148 95,144 Z" fill="#F2A6B5"/>';
    return s;
  }

  App.Oscar = {
    // 纯脸部 SVG 字符串（含 svg 标签），可设置宽高
    faceSVG: function(o){
      o = o || {};
      var size = o.size || 100;
      return '<svg viewBox="0 0 200 200" width="'+size+'" height="'+size+'" xmlns="http://www.w3.org/2000/svg">'
        + faceInner(o)
        + '</svg>';
    },
    // 带圆形浅蓝背景的贴纸版
    sticker: function(o){
      o = o || {};
      var size = o.size || 100;
      var bg = o.bg || '#EAF4FD';
      return '<svg viewBox="0 0 220 220" width="'+size+'" height="'+size+'" xmlns="http://www.w3.org/2000/svg">'
        + '<circle cx="110" cy="110" r="106" fill="'+bg+'"/>'
        + '<g transform="translate(10,10)">' + faceInner(o) + '</g>'
        + '</svg>';
    },
    // 把贴纸塞进某个元素
    into: function(el, o){
      if(!el) return;
      el.innerHTML = App.Oscar.sticker(o);
    },
    // 用于开屏大背景（半透明大图）
    bigBG: function(o){
      o = o||{};
      return App.Oscar.faceSVG({size:o.size||230, blush:true});
    },
    // ===== 真实照片相关 =====
    PHOTO: PHOTO,
    // 生成 <img> 标签（默认圆形裁剪）
    photo: function(o){
      o = o || {};
      var size = o.size || 96;
      var radius = o.radius != null ? o.radius : '50%';
      var fit = o.fit || 'cover';
      var border = o.border ? 'box-shadow:0 2px 10px rgba(91,163,232,.18);' : '';
      return '<img src="'+PHOTO+'" alt="Oscar" width="'+size+'" height="'+size+
        '" style="display:block;width:'+size+'px;height:'+size+'px;object-fit:'+fit+
        ';border-radius:'+radius+';background:#EAF4FD;'+border+'">';
    },
    // 把照片塞进某个元素
    photoInto: function(el, o){
      if(!el) return;
      el.innerHTML = App.Oscar.photo(o);
    }
  };
})();
