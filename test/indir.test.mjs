// indir/index.html yönlendiricisini gerçek DOM olmadan sınar: stores.js ve sayfa
// script'ini minik bir document/location taklidiyle çalıştırıp nereye gidildiğine bakar.
// Çalıştır: node test/indir.test.mjs
import fs from 'fs';

const SRC = fs.readFileSync(new URL('../indir/index.html', import.meta.url), 'utf8');
const STORES_JS = fs.readFileSync(new URL('../stores.js', import.meta.url), 'utf8');
const script = SRC.match(/<script>([\s\S]*?)<\/script>/)[1];

function run({ ua, touch = 0, search = '' }) {
  const nodes = {};
  const node = (id) => (nodes[id] ??= { id, hidden: true, href: '', textContent: '' });
  const loc = { search, replaced: null, replace(u) { this.replaced = u; } };
  const win = {};
  new Function('window', STORES_JS)(win);
  new Function('window', 'document', 'navigator', 'location', script)(
    win, { getElementById: node }, { userAgent: ua, maxTouchPoints: touch }, loc);
  return { gitti: loc.replaced, ios: node('ios'), android: node('android'), S: win.FANMAP_STORES };
}

let fail = 0;
const t = (ad, kosul, detay = '') => {
  console.log(`${kosul ? '✅' : '❌'} ${ad}${kosul ? '' : '  → ' + detay}`);
  if (!kosul) fail++;
};

const IPHONE  = { ua: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Instagram 300.0.0.0' };
const IPAD    = { ua: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)', touch: 5 };
const ANDROID = { ua: 'Mozilla/5.0 (Linux; Android 14; Pixel 8; wv) AppleWebKit/537.36 Chrome/120 Mobile Safari/537.36 Instagram 300.0.0.0 Android' };
const MASA    = { ua: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)', touch: 0 };

let r = run(IPHONE);
t('iPhone (Instagram) → App Store', r.gitti === r.S.ios, r.gitti);
t('iPhone: Play düğmesi gizli', r.android.hidden && !r.ios.hidden);

r = run(IPAD);
t('iPad (Macintosh + dokunmatik) → App Store', r.gitti === r.S.ios, r.gitti);

r = run(ANDROID);
t('Android (Instagram) → Google Play', r.gitti === r.S.android, r.gitti);
t('Android: App Store düğmesi gizli', r.ios.hidden && !r.android.hidden);

r = run({ ...ANDROID, search: '?utm_source=instagram&utm_campaign=sayfa1&fbclid=xyz' });
t('Android: utm → Play referrer, yabancı parametre atılıyor',
  r.gitti === r.S.android + '&referrer=' + encodeURIComponent('utm_source=instagram&utm_campaign=sayfa1'), r.gitti);

r = run({ ...IPHONE, search: '?utm_source=instagram' });
t('iPhone: App Store adresine sorgu eklenmiyor', r.gitti === r.S.ios, r.gitti);

r = run(MASA);
t('Masaüstü: yönlendirme yok, iki düğme de görünür', r.gitti === null && !r.ios.hidden && !r.android.hidden);
t('Düğme adresleri stores.js ile aynı', r.ios.href === r.S.ios && r.android.href === r.S.android);

console.log(fail ? `\n${fail} test KALDI` : '\nHepsi geçti');
process.exit(fail ? 1 : 0);
