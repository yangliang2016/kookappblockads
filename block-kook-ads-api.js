// block-kook-ads-api.js
// 拦截 KOOK App 广告相关 API 响应，递归清空所有数组字段防止广告/弹窗展示

var url = $request.url;
var body = $response.body;

// 广告相关端点，其余 API 直接放行
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

if (!isAdEndpoint || !body) {
  $done({});
  return;
}

try {
  var json = JSON.parse(body);

  // 递归清空所有数组，归零所有计数字段，无论字段名是什么
  function wipeArrays(obj) {
    if (!obj || typeof obj !== 'object') return;
    var keys = Object.keys(obj);
    for (var i = 0; i < keys.length; i++) {
      var k = keys[i];
      if (Array.isArray(obj[k])) {
        obj[k] = [];
      } else if (typeof obj[k] === 'number' &&
                 /^(total|count|size|num|page_total|page_count|page_size)$/i.test(k)) {
        obj[k] = 0;
      } else if (obj[k] && typeof obj[k] === 'object') {
        wipeArrays(obj[k]);
      }
    }
  }

  if (json.data !== undefined) {
    if (Array.isArray(json.data)) {
      json.data = [];
    } else if (json.data && typeof json.data === 'object') {
      wipeArrays(json.data);
    }
  }

  $done({ body: JSON.stringify(json) });
} catch (e) {
  $done({});
}
