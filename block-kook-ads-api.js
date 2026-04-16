// block-kook-ads-api.js
// 请求阶段拦截：对已知广告端点直接返回空 JSON，不发出网络请求
// 注：顶层 return 在 JavaScriptCore evaluateScript 中是 SyntaxError，用 if/else 代替

var url = $request.url;

var AD_PATTERNS = [
  /\/ad-placement/,
  /\/advertis/,
  /\/splash/,
  /\/startup/,
  /\/open-screen/,
  /\/open-ad/,
  /\/launch-page/,
  /\/preload/,
  /\/banner/,
  /\/popup/,
  /\/promotion/,
  /\/product\/list/,
  /\/product\/red-dot/,
  /\/product-category/,
  /\/item\/token-count/,
  /\/item\/bag/,
  /\/item\/list/,
  /\/activity/,
  /\/coupon/,
  /\/redpacket/,
  /\/gift\/(list|recommend)/,
  /\/task\/list/,
  /\/announce/,
  /\/card\/recommend/,
  /\/market/,
  /\/mall/,
  /\/discover\//,
  /\/explore\//,
  /\/recommend\//,
  /\/vip-expression/,
];

if (AD_PATTERNS.some(function(p) { return p.test(url); })) {
  $done({
    response: {
      status: 200,
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: '{"code":0,"data":{"list":[],"items":[],"total":0,"has_more":false}}'
    }
  });
} else {
  $done({});
}
