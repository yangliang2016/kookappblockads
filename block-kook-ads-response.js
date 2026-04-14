// block-kook-ads-response.js
// 响应阶段：已知广告端点直接替换为空响应，其余 JSON 递归清除广告字段

var url = $request.url;
var body = $response.body;

if (!body) { $done({}); return; }

// ── 1. 已知广告端点：直接返回空，不解析 JSON ──────────────────────────────
var BLOCK_PATTERNS = [
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
];

var EMPTY = '{"code":0,"data":{"list":[],"items":[],"total":0,"has_more":false}}';

if (BLOCK_PATTERNS.some(function(p) { return p.test(url); })) {
  $done({ body: EMPTY });
  return;
}

// ── 2. 其余 API：解析 JSON，递归清除广告字段 ─────────────────────────────
if (body.charAt(0) !== '{' && body.charAt(0) !== '[') {
  $done({});
  return;
}

var obj;
try { obj = JSON.parse(body); } catch(e) { $done({}); return; }

var AD_KEYS = {
  splash: 1, splash_ad: 1, splashAd: 1,
  startupAd: 1, startup_ad: 1, startup_page: 1, startupPage: 1,
  openScreenAd: 1, open_screen_ad: 1, openAd: 1, open_ad: 1,
  launchAd: 1, launch_ad: 1, launchPage: 1, launch_page: 1,
  interstitial: 1, fullscreen_ad: 1, fullscreenAd: 1,
  ad: 1, ads: 1, adList: 1, ad_list: 1,
  advert: 1, adverts: 1, advertisement: 1, advertisements: 1,
  banner: 1, banners: 1, banner_ad: 1, bannerAd: 1,
  popup: 1, popups: 1, popup_ad: 1, popupAd: 1,
  promotion: 1, promotions: 1, promotionList: 1, promotion_list: 1,
  recommendAds: 1, recommend_ads: 1,
  floatAd: 1, float_ad: 1,
  marketBanner: 1, market_banner: 1,
};

function clean(v) {
  if (!v || typeof v !== 'object') return v;
  if (Array.isArray(v)) return v.map(clean);
  var r = {};
  for (var k in v) {
    if (AD_KEYS[k]) {
      var orig = v[k];
      r[k] = Array.isArray(orig) ? [] : (orig && typeof orig === 'object') ? {} : null;
    } else {
      r[k] = clean(v[k]);
    }
  }
  return r;
}

var cleaned = JSON.stringify(clean(obj));
$done(cleaned !== body ? { body: cleaned } : {});
