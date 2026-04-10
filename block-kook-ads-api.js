// block-kook-ads-api.js
// 拦截 KOOK App 广告相关 API 响应，清空返回数据防止广告/弹窗展示
// 覆盖范围：广告位列表、商城商品、促销活动、开屏广告、横幅广告

var url = $request.url;
var body = $response.body;

// 仅处理以下广告相关端点，其余 API 直接放行
var AD_PATTERNS = [
  /\/ad-placement(?:s)?(?:\/|$)/,      // 广告位列表（开机广告主要来源）
  /\/product(?:s)?\/list/,             // 商城商品列表
  /\/product(?:s)?\/red-dot/,          // 商城红点提示
  /\/product-category\/index/,         // 商品分类
  /\/item\/token-count/,               // 道具/代币数量（驱动购买弹窗）
  /\/promotion(?:s)?(?:\/|$)/,         // 促销活动（含 promotion/ongoing）
  /\/(?:splash|startup)(?:\/|$)/,      // 开屏广告
  /\/popup(?:\/|$)/,                   // 弹窗广告
  /\/banner(?:s)?(?:\/|$)/,            // 横幅广告
  /\/activity(?:s|ies)?(?:\/|$)/,      // 活动
  /\/advertis(?:ing|ement)?(?:\/|$)/,  // 广告
  /\/gift(?:s)?\/(?:list|recommend)/,  // 礼物推荐
  /\/announce(?:ment)?(?:s)?(?:\/|$)/, // 公告（含广告类公告）
];

var isAdEndpoint = AD_PATTERNS.some(function(p) { return p.test(url); });

if (!isAdEndpoint || !body) {
  $done({});
  return;
}

try {
  var json = JSON.parse(body);

  function clearList(obj) {
    if (!obj) return;
    if (Array.isArray(obj.items))  obj.items  = [];
    if (Array.isArray(obj.list))   obj.list   = [];
    if (Array.isArray(obj.data) && obj !== json) obj.data = [];
    if (typeof obj.total   === 'number') obj.total   = 0;
    if (typeof obj.count   === 'number') obj.count   = 0;
    if (obj.meta && typeof obj.meta.total === 'number') obj.meta.total = 0;
  }

  if (json.data) {
    if (Array.isArray(json.data)) {
      json.data = [];
    } else {
      clearList(json.data);
    }
  }

  $done({ body: JSON.stringify(json) });
} catch (e) {
  // JSON 解析失败，直接放行原始响应
  $done({});
}
