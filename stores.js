/* ════════════════════════════════════════════════════════════════════════════
   MAĞAZA ADRESLERİ — SİTEDE DOLDURULACAK TEK YER

   🔴 Sitenin başka hiçbir dosyasında mağaza bağlantısı YOK. Ana sayfadaki indirme
   düğmeleri de, davet bağlantısı sayfasındaki (404.html) üç kart da buradan
   besleniyor. Adresi değiştirmek için tek yer burası — hiçbir HTML'e dokunma.

   ⚠️ BOŞ bırakmak GÜVENLİ: boşken düğmeler "çok yakında" hâlinde kalıyor,
   hiçbir yere gitmiyor. Bir mağazadan çekilmek gerekirse o satırı boşaltmak yeter.

   ⚠️ SORGU PARAMETRESİ EKLEME. Paylaşım adresinden gelen `?l=tr` /
   `&pcampaignid=web_share` gibi ekler bilerek kırpıldı: iOS uygulaması aynı
   adrese `?action=write-review` ekleyerek değerlendirme sayfasını türetiyor
   (`AppLinks.reviewURL`), sorgusu olan bir adreste bu bozulur.

   Beklenen biçim:
     ios     : 'https://apps.apple.com/tr/app/<ad>/id<NUMARA>'
     android : 'https://play.google.com/store/apps/details?id=<PAKET_ADI>'

   ⚠️ Adresi değiştirdikten sonra `test/router.test.mjs` yine yeşil dönmeli —
   testler iki durumu da (boş/dolu) ayrı ayrı tutuyor.
   ════════════════════════════════════════════════════════════════════════════ */
window.FANMAP_STORES = {
    ios: 'https://apps.apple.com/tr/app/fanmap-t%C3%BCrkiye/id6761418363',
    android: 'https://play.google.com/store/apps/details?id=com.yalcincanbay.fanmap'
};
