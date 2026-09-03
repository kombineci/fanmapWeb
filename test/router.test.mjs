// 404.html yönlendiricisini gerçek DOM olmadan sınar: sayfadaki script'i
// minik bir document/location taklidiyle çalıştırıp hangi kartın açıldığına bakar.
import fs from 'fs';

const SRC = fs.readFileSync(process.argv[2], 'utf8');
const script = SRC.match(/<script>([\s\S]*?)<\/script>/)[1];

function run(pathname, { ua = 'Mozilla/5.0 (Macintosh)', touch = 0, stores = null } = {}) {
  const shown = [];
  const nodes = {};
  const created = [];
  const node = (id) => (nodes[id] ??= {
    id, _hidden: true, textContent: '', href: '', classList: { add() {}, remove() {} },
    setAttribute() {}, addEventListener() {},
    get hidden() { return this._hidden; },
    set hidden(v) { this._hidden = v; if (v === false) shown.push(this.id); },
  });

  const doc = {
    title: '',
    getElementById: node,
    createElement: (tag) => {
      const el = { tag, style: {}, className: '', textContent: '', href: '', rel: '',
                   setAttribute() {}, select() {}, appendChild() {} };
      created.push(el);
      return el;
    },
    addEventListener() {},
    body: { appendChild() {}, removeChild() {} },
    execCommand: () => true,
  };
  const loc = { pathname, origin: 'https://fanmaptr.com' };

  // Mağaza kutuları gerçek kap gibi davransın: içine eklenen düğümü saklasınlar.
  for (const id of ['inviteStores', 'clanStores', 'refStores']) {
    const box = node(id);
    box.children = [];
    box.appendChild = (el) => box.children.push(el);
    box.classList = { _c: new Set(), add(c) { this._c.add(c); }, remove(c) { this._c.delete(c); } };
  }

  // 🔴 Adresler sayfaya `stores.js` üzerinden giriyor (`window.FANMAP_STORES`).
  // Test de o yoldan besliyor: kaynağı regex'le değiştirseydik, sayfa bir gün
  // adresleri başka yerden okumaya başladığında test bunu göremezdi.
  const win = { location: loc, addEventListener() {} };
  if (stores) win.FANMAP_STORES = { ios: stores.ios ?? '', android: stores.android ?? '' };

  new Function('document', 'location', 'navigator', 'window', 'setTimeout',
               'clearTimeout', 'console', script)
    (doc, loc, { userAgent: ua, maxTouchPoints: touch },
     win, () => 0, () => {}, console);

  const storeBox = (id) => (nodes[id]?.children ?? []).map((e) => ({
    tag: e.tag, text: e.textContent, href: e.href, cls: e.className }));

  return { shown, title: doc.title, open: nodes.openApp?.href ?? '',
           stores: storeBox('inviteStores'),
           clanStores: storeBox('clanStores'),
           refStores: storeBox('refStores'),
           handle: nodes.handle?.textContent ?? '',
           step: nodes.inviteStep?.textContent ?? '',
           handleRowHidden: nodes.handleRow?._hidden ?? null };
}

let fail = 0;
const t = (ad, kosul, detay = '') => {
  if (kosul) { console.log(`  ok  ${ad}`); }
  else { console.log(`NOT OK  ${ad}  ${detay}`); fail++; }
};

const uid = 'sBP1GkIg57MfKtGOk0FkUIBr2lg2';

console.log('— arkadaş: davet kodu (üretim biçimi)');
let r = run('/arkadas/k/K7M2QX');
t('davet kartı açılıyor', r.shown.includes('invite'), JSON.stringify(r.shown));
t('kod kutuda görünüyor', r.handle === 'K7M2QX', r.handle);
t('özel şema kodu taşıyor', r.open === 'fanmap://arkadas/k/K7M2QX', r.open);
t('🔴 adım metni BAĞLANTIYI söylüyor, kodu değil',
  /bağlantıyı yapıştır/i.test(r.step), r.step);

console.log('— arkadaş: Android v1.27 uid biçimi');
r = run(`/arkadas/u/${uid}`);
t('🔴 davet kartı açılıyor (eskiden notfound idi)', r.shown.includes('invite'), JSON.stringify(r.shown));
t('uid EKRANA yazılmıyor', r.handleRowHidden === true && !r.handle.includes(uid), r.handle);
t('özel şema uid taşıyor', r.open === `fanmap://arkadas/u/${uid}`, r.open);

console.log('— arkadaş: eski ad biçimi');
r = run('/arkadas/ahmet');
t('davet kartı açılıyor', r.shown.includes('invite'), JSON.stringify(r.shown));
t('ad kutuda görünüyor', r.handle === 'ahmet', r.handle);

console.log('— klan ve davet yolları yutulmuyor');
r = run('/klan/BJK');
t('yalnız klan kartı', r.shown.includes('clan') && !r.shown.includes('invite'), JSON.stringify(r.shown));
r = run('/davet/K7M2QX');
t('yalnız davet kartı', r.shown.includes('referral') && !r.shown.includes('invite'), JSON.stringify(r.shown));

console.log('— bozuk girdiler dürüstçe notfound');
for (const yol of ['/arkadas/k/ahmet', '/arkadas/u/ahmet', `/arkadas/u/${uid}X!`,
                   '/arkadas/u', '/arkadas/k', '/arkadas/ab',
                   `/arkadas/${'a'.repeat(21)}`, '/gizlilik', '/']) {
  r = run(yol);
  t(`${yol} → notfound`, r.shown.includes('notfound') && !r.shown.includes('invite'),
    JSON.stringify(r.shown));
}


// ─────────────────────────────────────────────────────────────────────────────
// MAĞAZA SATIRI
//
// 🔴 Bu blok tek bir şeyi koruyor: mağaza adresleri BOŞKEN yayına yarım bir
// düğme çıkmasın. Sayfa uygulama mağazaya çıkmadan önce de yayında duruyor.
// ─────────────────────────────────────────────────────────────────────────────
const IPHONE = { ua: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)' };
const IPAD   = { ua: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)', touch: 5 };
const ANDROID= { ua: 'Mozilla/5.0 (Linux; Android 14; Pixel 8)' };
const MASA   = { ua: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)', touch: 0 };
const DOLU   = { ios: 'https://apps.apple.com/tr/app/fanmap/id123',
                 android: 'https://play.google.com/store/apps/details?id=x' };

console.log('— mağaza adresleri BOŞKEN (bugünkü durum)');
for (const [ad, cihaz] of [['iPhone', IPHONE], ['Android', ANDROID], ['masaüstü', MASA]]) {
  r = run('/arkadas/k/K7M2QX', cihaz);
  t(`${ad}: yarım düğme YOK, "yakında" yazısı var`,
    r.stores.length === 1 && r.stores[0].tag === 'span' && /yakında/.test(r.stores[0].text),
    JSON.stringify(r.stores));
}

console.log('— mağaza adresleri DOLUYKEN');
r = run('/arkadas/k/K7M2QX', { ...IPHONE, stores: DOLU });
t('iPhone YALNIZ App Store görüyor',
  r.stores.length === 1 && r.stores[0].href === DOLU.ios, JSON.stringify(r.stores));
r = run('/arkadas/k/K7M2QX', { ...ANDROID, stores: DOLU });
t('Android YALNIZ Play görüyor',
  r.stores.length === 1 && r.stores[0].href === DOLU.android, JSON.stringify(r.stores));
r = run('/arkadas/k/K7M2QX', { ...MASA, stores: DOLU });
t('masaüstü İKİSİNİ birden görüyor', r.stores.length === 2, JSON.stringify(r.stores));
r = run('/arkadas/k/K7M2QX', { ...IPAD, stores: DOLU });
t('🔴 iPad masaüstü sanılmıyor — yalnız App Store',
  r.stores.length === 1 && r.stores[0].href === DOLU.ios, JSON.stringify(r.stores));

console.log('— yalnız bir mağaza hazırsa');
r = run('/arkadas/k/K7M2QX', { ...MASA, stores: { ios: DOLU.ios, android: '' } });
t('masaüstünde tek düğme', r.stores.length === 1 && r.stores[0].href === DOLU.ios,
  JSON.stringify(r.stores));
r = run('/arkadas/k/K7M2QX', { ...ANDROID, stores: { ios: DOLU.ios, android: '' } });
t('Android hazır değilken "yakında" görüyor',
  r.stores.length === 1 && r.stores[0].tag === 'span', JSON.stringify(r.stores));

console.log('— üç kartın da indirme satırı besleniyor');
r = run('/klan/BJK', { ...IPHONE, stores: DOLU });
t('klan kartı', r.clanStores.length === 1 && r.clanStores[0].href === DOLU.ios,
  JSON.stringify(r.clanStores));
r = run('/davet/K7M2QX', { ...IPHONE, stores: DOLU });
t('davet kartı', r.refStores.length === 1 && r.refStores[0].href === DOLU.ios,
  JSON.stringify(r.refStores));


console.log('— stores.js sitedeki TEK yer');
{
  const kok = new URL('..', import.meta.url).pathname;
  const cfg = fs.readFileSync(kok + 'stores.js', 'utf8');
  // 🔴 Uygulama artık iki mağazada da yayında: adresler DOLU olmalı ve
  // sorgu parametresi TAŞIMAMALI — iOS tarafı bu adrese `?action=write-review`
  // ekleyerek değerlendirme sayfasını türetiyor, sorgulu adreste bu bozulur.
  const ios = (cfg.match(/ios:\s*'([^']*)'/) || [])[1] ?? '';
  const android = (cfg.match(/android:\s*'([^']*)'/) || [])[1] ?? '';
  t('stores.js iOS adresi dolu ve sorgusuz',
    /^https:\/\/apps\.apple\.com\/[^?#]+\/id\d+$/.test(ios), ios);
  t('stores.js Android adresi dolu ve tek sorgusu paket adı',
    /^https:\/\/play\.google\.com\/store\/apps\/details\?id=[\w.]+$/.test(android), android);

  for (const dosya of ['404.html', 'index.html']) {
    const html = fs.readFileSync(kok + dosya, 'utf8');
    t(`${dosya} stores.js'i yüklüyor`, html.includes('src="/stores.js"'));
    // 🔴 Asıl iddia: HTML'e gömülü ikinci bir mağaza adresi OLMAMALI. Olsaydı
    // lansman günü biri doldurulur, diğeri unutulurdu.
    const gomulu = html.match(/https:\/\/(apps\.apple\.com|play\.google\.com)[^"']*/g) || [];
    t(`${dosya} içinde gömülü mağaza adresi yok`, gomulu.length === 0, gomulu.join(', '));
  }

  // 🔴 HER indirme düğmesi `data-store` TAŞIMALI — canlandırma
  // `querySelectorAll('[data-store]')` ile yapılıyor. Nitelik unutulan düğme
  // sessizce ölü kalıyor: "Çok Yakında" yazısıyla, tıklanamaz hâlde, hiçbir
  // hata üretmeden. Lansmandan sonra sayfanın üstündeki iki düğme tam olarak
  // bu yüzden günlerce "Çok Yakında" gösterdi.
  {
    const html = fs.readFileSync(kok + 'index.html', 'utf8');
    const dugmeler = html.match(/<span class="store[^>]*>/g) || [];
    const eksik = dugmeler.filter(d => !d.includes('data-store='));
    t('index.html: her indirme düğmesinde data-store var',
      dugmeler.length > 0 && eksik.length === 0,
      `${dugmeler.length} düğme, ${eksik.length} eksik: ${eksik.join(' | ')}`);

    // İki mağaza da temsil edilmeli — biri unutulursa o platform hiç canlanmaz.
    t('index.html: iOS ve Android düğmeleri var',
      html.includes('data-store="ios"') && html.includes('data-store="android"'));
  }

  // 🔴 Akıllı afişteki sayısal kimlik `stores.js`'teki adresle AYNI olmalı.
  // Safari etiketi sayfa ayrıştırılırken okuduğu için kimlik HTML'e gömülü
  // kalmak zorunda; bu test iki yerin ayrışmasını engelliyor.
  {
    const html = fs.readFileSync(kok + 'index.html', 'utf8');
    const afis = (html.match(/apple-itunes-app"\s+content="app-id=(\d+)"/) || [])[1] ?? '';
    const iosId = (cfg.match(/ios:\s*'[^']*\/id(\d+)'/) || [])[1] ?? '';
    t('index.html akıllı afiş kimliği stores.js ile aynı',
      afis !== '' && afis === iosId, `afiş=${afis} stores=${iosId}`);
  }
}

console.log(fail === 0 ? '\nTÜMÜ GEÇTİ' : `\n${fail} HATA`);
process.exit(fail === 0 ? 0 : 1);
