// block-kook-ads-response.js
// 处理 kookapp.cn /api/ 路径的 JSON 响应，递归清除开屏广告、splash 等字段
// type: response

var body = $response.body;

// 只处理 JSON（body 以 { 或 [ 开头）
if (!body || (body.charAt(0) !== '{' && body.charAt(0) !== '[')) {
  $done({});
  return;
}

var obj;
try {
  obj = JSON.parse(body);
} catch (e) {
  $done({});
  return;
}

// 广告相关 key（遇到则置空，不删除 key 以免 App 崩溃）
var AD_KEYS = {
  // 开屏 / 启动广告
  splash: 1, splash_ad: 1, splash_ads: 1,
  splashAd: 1, splashAds: 1,
  startupAd: 1, startup_ad: 1, startup_page: 1, startupPage: 1,
  openScreenAd: 1, open_screen_ad: 1, openAd: 1, open_ad: 1,
  launchAd: 1, launch_ad: 1, launchPage: 1, launch_page: 1,
  interstitial: 1, fullscreen_ad: 1, fullscreenAd: 1,
  // 通用广告
  ad: 1, ads: 1, adList: 1, ad_list: 1,
  advert: 1, adverts: 1,
  advertisement: 1, advertisements: 1,
  // banner / 弹窗
  banner: 1, banners: 1, banner_ad: 1, bannerAd: 1,
  popup: 1, popups: 1, popup_ad: 1, popupAd: 1,
  // 推广 / 活动
  promotion: 1, promotions: 1,
  recommendAds: 1, recommend_ads: 1,
};

function clean(v) {
  if (!v || typeof v !== 'object') return v;
  if (Array.isArray(v)) return v.map(clean);
  var r = {};
  for (var k in v) {
    if (AD_KEYS[k]) {
      // 保留 key，置为同类型的空值，防止 App 因字段缺失崩溃
      var orig = v[k];
      r[k] = Array.isArray(orig) ? []
            : (orig && typeof orig === 'object') ? {}
            : null;
    } else {
      r[k] = clean(v[k]);
    }
  }
  return r;
}

var cleaned = JSON.stringify(clean(obj));
$done(cleaned !== body ? { body: cleaned } : {});
