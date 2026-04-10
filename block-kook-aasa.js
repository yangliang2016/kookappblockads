// block-kook-aasa.js
// 拦截 apple-app-site-association 请求，返回空 JSON
// iOS 收到空 {} 后认为该域名未配置 Universal Link，不再自动唤起 App
// 比 reject 更可靠：reject 会触发重试并使用缓存，空 200 会覆盖缓存

$done({
  response: {
    status: 200,
    headers: {
      'Content-Type': 'application/json'
    },
    body: '{}'
  }
});
