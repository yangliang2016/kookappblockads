// block-kook-ads-api.js
// 请求阶段拦截：对已知广告端点直接返回空 JSON，不发出网络请求
// 注：若 Stash 不支持 request 脚本返回伪响应，由 block-kook-ads-response.js 兜底

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

if (!AD_PATTERNS.some(function(p) { return p.test(url); })) {
  $done({});
  return;
}

$done({
  response: {
    status: 200,
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: '{"code":0,"data":{"list":[],"items":[],"total":0,"has_more":false}}'
  }
});
