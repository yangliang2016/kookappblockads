// ══════════════════════════════════════════════════════════════════
// block-kook-redirect.js
// 用途：Stash response 脚本，拦截 KOOK / 开黑啦 网页中的 App 跳转逻辑
// 拦截范围：
//   · kook://     自定义 URL Scheme（现用名）
//   · kaiheila:// 自定义 URL Scheme（旧称开黑啦）
//   · window.location / location.href 指向 App Store 的跳转
//   · window.open 打开 App Scheme 的调用
//   · 动态注入防御脚本，覆盖运行时赋值
// ══════════════════════════════════════════════════════════════════

var body = $response.body;

// 只处理 HTML 响应，跳过二进制/JSON 等内容
if (!body || body.indexOf('<') === -1) {
  $done({});
  return;
}

var modified = false;

// ── 1. 静态替换：kook:// / kaiheila:// scheme ──────────────────
var newBody = body
  // href="kook://..." 或 href='kook://...'
  .replace(/(href\s*=\s*["'])(kook|kaiheila):\/\/[^"']*(["'])/gi,
           '$1javascript:void(0)$3')
  // location.href = "kook://..."
  .replace(/(location(?:\.href)?\s*=\s*["'])(kook|kaiheila):\/\/[^"']*(["'])/gi,
           '$1javascript:void(0)$3')
  // window.open("kook://...")
  .replace(/(window\.open\s*\(\s*["'])(kook|kaiheila):\/\/[^"']*(["'])/gi,
           '$1javascript:void(0)$3')
  // 变量赋值：var url = "kook://..."
  .replace(/(=\s*["'])(kook|kaiheila):\/\/[^\s"'`\)>]*(["'`])/g,
           '$1javascript:void(0)$3');

// ── 2. 静态替换：window.location 跳 App Store ────────────────
newBody = newBody
  .replace(
    /window\.location(?:\.href)?\s*=\s*(["'])https?:\/\/(apps|itunes)\.apple\.com[^"']*\1/gi,
    'void(0) /* kook-appstore-blocked */'
  )
  .replace(
    /location(?:\.href)?\s*=\s*(["'])https?:\/\/(apps|itunes)\.apple\.com[^"']*\1/gi,
    'void(0) /* kook-appstore-blocked */'
  );

if (newBody !== body) {
  modified = true;
  body = newBody;
}

// ── 3. 动态防御：注入到 <head> ────────────────────────────────
// 覆盖运行时对 location.href 的动态赋值和 window.open 的调用
var guardScript = [
  '<script>',
  '(function(){',
  '  "use strict";',
  // 拦截 window.open
  '  var _origOpen = window.open;',
  '  window.open = function(u, t, f) {',
  '    if (u && /^(kook|kaiheila):\/\//i.test(u)) { return null; }',
  '    return _origOpen ? _origOpen.apply(this, arguments) : null;',
  '  };',
  // 拦截 location.href setter
  '  try {',
  '    var locDesc = Object.getOwnPropertyDescriptor(Location.prototype, "href");',
  '    if (locDesc && locDesc.set) {',
  '      Object.defineProperty(location, "href", {',
  '        set: function(u) {',
  '          if (u && (',
  '            /^(kook|kaiheila):\/\//i.test(u) ||',
  '            /https?:\\/\\/(apps|itunes)\\.apple\\.com/i.test(u)',
  '          )) { return; }',
  '          locDesc.set.call(this, u);',
  '        },',
  '        get: locDesc.get,',
  '        configurable: true',
  '      });',
  '    }',
  '  } catch(e) {}',
  // 拦截 document.createElement("iframe") 用于 scheme 跳转的 trick
  '  var _origCreateElement = document.createElement.bind(document);',
  '  document.createElement = function(tag) {',
  '    var el = _origCreateElement(tag);',
  '    if (tag && tag.toLowerCase() === "iframe") {',
  '      var ifrDesc = Object.getOwnPropertyDescriptor(HTMLIFrameElement.prototype, "src");',
  '      if (ifrDesc && ifrDesc.set) {',
  '        Object.defineProperty(el, "src", {',
  '          set: function(u) {',
  '            if (u && /^(kook|kaiheila):\/\//i.test(u)) { return; }',
  '            ifrDesc.set.call(this, u);',
  '          },',
  '          get: ifrDesc.get,',
  '          configurable: true',
  '        });',
  '      }',
  '    }',
  '    return el;',
  '  };',
  '})();',
  '<\/script>'
].join('\n');

// 注入到 <head> 标签之后（尽量早执行）
if (body.indexOf('</head>') !== -1 || body.indexOf('<head') !== -1) {
  body = body.replace(/(<head[^>]*>)/i, '$1\n' + guardScript + '\n');
  modified = true;
}

$done(modified ? { body: body } : {});
