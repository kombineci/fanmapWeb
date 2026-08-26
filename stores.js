/* ════════════════════════════════════════════════════════════════════════════
   MAĞAZA ADRESLERİ — SİTEDE DOLDURULACAK TEK YER

   🔴 Sitenin başka hiçbir dosyasında mağaza bağlantısı YOK. Ana sayfadaki indirme
   düğmeleri de, davet bağlantısı sayfasındaki (404.html) üç kart da buradan
   besleniyor. Lansman günü aşağıdaki iki satırı doldurmak yeter — hiçbir HTML'e
   dokunmadan bütün site canlanır.

   ⚠️ BOŞ bırakmak GÜVENLİ ve bugünkü durum bu: boşken düğmeler "çok yakında"
   hâlinde kalıyor, hiçbir yere gitmiyor. Yani bu dosya uygulama mağazaya
   çıkmadan da yayında durabilir; yarım bir düğme kullanıcıya görünmez.

   Beklenen biçim:
     ios     : 'https://apps.apple.com/tr/app/fanmap/id<NUMARA>'
     android : 'https://play.google.com/store/apps/details?id=<PAKET_ADI>'

   ⚠️ Adresi doldurduktan sonra `test/router.test.mjs` yine yeşil dönmeli —
   testler iki durumu da (boş/dolu) ayrı ayrı tutuyor.
   ════════════════════════════════════════════════════════════════════════════ */
window.FANMAP_STORES = {
    ios: '',
    android: ''
};
