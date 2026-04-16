// block-kook-redirect.js
// 拦截 KOOK / 开黑啦 网页中的 App 跳转逻辑
// 注：用 IIFE 包裹，避免顶层 return 在 JavaScriptCore 中引发 SyntaxError

(function () {
  var body = $response.body;

  // 只处理 HTML 响应，跳过 JSON / 二进制等
  if (!body || body.indexOf('<') === -1) {
    $done({});
    return;
  }

  var modified = false;
  var newBody = body;

  // 1. 静态替换：href / location.href / window.open 中的 scheme
  newBody = newBody
    .replace(/(href\s*=\s*["'])(kook|kaiheila):\/\/[^"']*(["'])/gi, '$1javascript:void(0)$3')
    .replace(/(location(?:\.href)?\s*=\s*["'])(kook|kaiheila):\/\/[^"']*(["'])/gi, '$1javascript:void(0)$3')
    .replace(/(window\.open\s*\(\s*["'])(kook|kaiheila):\/\/[^"']*(["'])/gi, '$1javascript:void(0)$3')
    .replace(/(=\s*["'])(kook|kaiheila):\/\/[^\s"'`\)>]*(["'`])/g, '$1javascript:void(0)$3');

  // 2. 静态替换：指向 App Store 的 location 跳转
  newBody = newBody
    .replace(/window\.location(?:\.href)?\s*=\s*(["'])https?:\/\/(apps|itunes)\.apple\.com[^"']*\1/gi, 'void(0)/*blocked*/')
    .replace(/location(?:\.href)?\s*=\s*(["'])https?:\/\/(apps|itunes)\.apple\.com[^"']*\1/gi, 'void(0)/*blocked*/');

  if (newBody !== body) {
    modified = true;
    body = newBody;
  }

  // 3. 动态防御：注入到 <head>，覆盖运行时跳转
  var guardScript = '<script>(function(){'
    + '"use strict";'
    + 'var _o=window.open;'
    + 'window.open=function(u,t,f){'
    + 'if(u&&/^(kook|kaiheila):\\/\\//i.test(u))return null;'
    + 'return _o?_o.apply(this,arguments):null;'
    + '};'
    + 'try{'
    + 'var d=Object.getOwnPropertyDescriptor(Location.prototype,"href");'
    + 'if(d&&d.set){'
    + 'Object.defineProperty(location,"href",{'
    + 'set:function(u){'
    + 'if(u&&(/^(kook|kaiheila):\\/\\//i.test(u)||/https?:\\/\\/(apps|itunes)\\.apple\\.com/i.test(u)))return;'
    + 'd.set.call(this,u);'
    + '},'
    + 'get:d.get,configurable:true'
    + '});'
    + '}'
    + '}catch(e){}'
    + 'var _ce=document.createElement.bind(document);'
    + 'document.createElement=function(tag){'
    + 'var el=_ce(tag);'
    + 'if(tag&&tag.toLowerCase()==="iframe"){'
    + 'var fd=Object.getOwnPropertyDescriptor(HTMLIFrameElement.prototype,"src");'
    + 'if(fd&&fd.set){'
    + 'Object.defineProperty(el,"src",{'
    + 'set:function(u){if(u&&/^(kook|kaiheila):\\/\\//i.test(u))return;fd.set.call(this,u);},'
    + 'get:fd.get,configurable:true'
    + '});'
    + '}'
    + '}'
    + 'return el;'
    + '};'
    + '})();<\/script>';

  if (body.indexOf('<head') !== -1) {
    body = body.replace(/(<head[^>]*>)/i, '$1\n' + guardScript);
    modified = true;
  }

  $done(modified ? { body: body } : {});
})();
