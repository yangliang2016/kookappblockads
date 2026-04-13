// block-kook-ads-api.js
// 在请求发出前拦截广告 API，直接返回空 JSON，不等服务器响应
// type: request — 比 response 更可靠，不需要读取响应体

var url = $request.url;

var AD_PATTERNS = [
  // 开屏 / 启动广告
  /\/splash/,
  /\/startup/,
  /\/launch-page/,
  /\/open-screen/,
  /\/open-ad/,
  /\/preload/,
  // 弹窗 / banner
  /\/popup/,
  /\/banner/,
  /\/ad-placement/,
  /\/advertis/,
  // 推荐 / 发现
  /\/recommend/,
  /\/card\/recommend/,
  /\/home-recommend/,
  /\/discovery/,
  /\/explore/,
  // 商城 / 活动
  /\/product\/list/,
  /\/product\/red-dot/,
  /\/product-category\/index/,
  /\/item\/token-count/,
  /\/promotion/,
  /\/activity/,
  /\/coupon/,
  /\/redpacket/,
  /\/gift\/(list|recommend)/,
  /\/task\/list/,
  // 公告 / 徽标
  /\/announce/,
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
    body: '{"code":0,"data":{"list":[],"items":[],"ads":[],"total":0,"has_more":false}}'
  }
});
