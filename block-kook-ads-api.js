// block-kook-ads-api.js
// 在请求发出前拦截广告 API，直接返回空 JSON，不等服务器响应
// type: request — 比 response 更可靠，不需要读取响应体

var url = $request.url;

var AD_PATTERNS = [
  /\/ad-placement/,
  /\/product\/list/,
  /\/product\/red-dot/,
  /\/product-category\/index/,
  /\/item\/token-count/,
  /\/promotion/,
  /\/splash/,
  /\/popup/,
  /\/banner/,
  /\/activity/,
  /\/advertis/,
  /\/announce/,
  /\/gift\/(list|recommend)/,
];

var isAdEndpoint = AD_PATTERNS.some(function(p) { return p.test(url); });

if (!isAdEndpoint) {
  $done({});
  return;
}

// 直接返回空数据，请求不会到达服务器
$done({
  response: {
    status: 200,
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: '{"code":0,"data":{}}'
  }
});
