# Lansman ve barındırma notları

## 1. Lansman günü: `stores.js`

Uygulama mağazalara çıktığında **tek dosya** doldurulacak:

```js
window.FANMAP_STORES = {
    ios: 'https://apps.apple.com/tr/app/fanmap/id<NUMARA>',
    android: 'https://play.google.com/store/apps/details?id=<PAKET_ADI>'
};
```

Bu iki satır şunları birden canlandırıyor:

- **Ana sayfa** (`index.html`) — "Çok Yakında" düğmeleri tıklanabilir olur, altındaki
  "çok yakında" cümlesi kendiliğinden gizlenir.
- **Davet sayfası** (`404.html`) — arkadaş, grup ve davet kartlarının üçünde de
  indirme satırı çıkar; telefonda **yalnız kendi mağazası** (iPhone'da Play düğmesi
  göstermek, dokunulduğunda hiçbir işe yaramayan bir seçenek sunmaktır), masaüstünde
  ikisi birden.
- **"Uygulamada Aç"** düğmesine mağaza yedeği bağlanır: uygulama açılmazsa ~1,4 sn
  sonra mağazaya düşer. (Sayfa açılırken DEĞİL, düğmeye basınca — otomatik denemede
  iOS Safari uygulaması olmayan kişide "adres geçersiz" uyarısı çıkarıyor.)

⚠️ Boş bırakmak güvenli ve bugünkü durum bu: hiçbir yarım düğme yayına çıkmıyor.

Doğrulama: `node test/router.test.mjs 404.html` → 36 test, boş ve dolu durumların
ikisini de ayrı ayrı tutuyor.

---

## 2. Ertelenen: GitHub Pages → Firebase Hosting

**Durum: hazır, UYGULANMADI.** DNS'e dokunulmadı.

**Neden gerekiyor:** paylaşılan davet bağlantılarının WhatsApp/X önizleme kartı
çıkmıyor. Sebep tek şey: `/arkadas/**`, `/klan/**`, `/davet/**` yolları **HTTP 404**
dönüyor ve önizleme botlarının çoğu 404 gövdesini ayrıştırmıyor. Sayfa zaten doğru
içeriği ve og: etiketlerini taşıyor — eksik olan yalnız **durum kodu**.

GitHub Pages statik: `/arkadas/k/K7M2QX` gibi **değişken** yolları sunamıyor, istek
404 sayfasına düşüyor. Firebase Hosting'in `rewrites` kuralı aynı sayfayı **200** ile
sunuyor. Uygulamada ve bağlantı biçiminde hiçbir değişiklik yok.

**Neden ertelendi:** uygulama henüz mağazalarda değil, yani sahada paylaşılan davet
bağlantısı yok — kartın bugün izleyicisi yok. Lansmandan hemen önce yapılacak.

⚠️ **Derin bağlantı BUGÜN DE çalışıyor.** iOS adresi AASA ile eşleştiriyor, sayfayı
hiç çekmiyor. Bu taşıma uygulaması OLMAYAN kişi için.

### Hazır duran dosyalar

| Dosya | Ne |
|---|---|
| `firebase.json` | üç yol ailesi → `404.html` rewrite (200), AASA/assetlinks için `application/json` başlığı |
| `.firebaserc` | proje: `fanmap-481ea` |

🔴 **`ignore` listesinde `**/.*` YOK, bilerek.** Firebase'in varsayılan şablonunda o
desen var ve `.well-known/` klasörünü de eler. Elenirse `apple-app-site-association`
yayından kalkar ve **evrensel bağlantılar yeni kurulumlarda sessizce ölür** — hiçbir
yerde hata görünmeden. `.git` ise açıkça eleniyor (`public: "."` bütün depoyu yüklüyor).

⚠️ `cleanUrls` KAPALI. Açık olsaydı `/privacy-policy.html` → `/privacy-policy`
yönlendirmesi yapardı; o adres App Store Connect'te gizlilik URL'si olarak kayıtlı.

### Taşıma adımları

1. **Önce yayına almadan dene:**
   ```
   firebase hosting:channel:deploy onizleme --expires 7d
   ```
   Çıkan geçici adreste kontrol et:
   ```
   curl -o /dev/null -w '%{http_code}\n' <adres>/arkadas/k/K7M2QX   # 200
   curl -o /dev/null -w '%{http_code}\n' <adres>/klan/BJK           # 200
   curl -o /dev/null -w '%{http_code}\n' <adres>/davet/K7M2QX       # 200
   curl -o /dev/null -w '%{http_code}\n' <adres>/olmayan-sayfa      # 404
   curl -s <adres>/.well-known/apple-app-site-association | head -3 # JSON gelmeli
   ```

2. **Yayına al:** `firebase deploy --only hosting`
   (Alan adını DEĞİŞTİRMEZ; site `*.web.app` adresinde yayına girer.)

3. **Alan adını bağla:** Firebase Console → Hosting → "Özel alan adı ekle" →
   `fanmaptr.com`. Konsolun verdiği A kayıtlarını Cloudflare'de **GitHub Pages'in A
   kayıtlarıyla değiştir** (185.199.108–111.153), `www` CNAME'ini de güncelle.

4. **Taşıma sonrası doğrula** — aynı `curl` listesi, bu kez `https://fanmaptr.com`
   üzerinde.

5. **Kartı gör:** bağlantıyı WhatsApp'ta kendine gönder. Kart çıkmıyorsa önce durum
   kodunu kontrol et — 404 dönüyorsa DNS hâlâ GitHub'ı gösteriyordur.

### DNS riskleri (ölçüldü, 2026-08-26)

| | |
|---|---|
| Alan adı yönetimi | Cloudflare (NS: `ali`/`wells.ns.cloudflare.com`) |
| Cloudflare proxy | **KAPALI** (gri bulut) — 🔴 kapalı KALMALI, açılırsa Firebase sertifikası çakışır |
| E-posta | Cloudflare Email Routing aktif (MX + SPF) — ✅ **taşıma bunlara dokunmuyor** |
| Kayıt TTL'i | 300 sn → geri dönüş ~5 dakika |
| Tek gerçek risk | DNS çevrildikten sonra Firebase sertifikası çıkana kadarki pencere (dakikalar, nadiren 24 sa) |

⚠️ **Geri dönüş:** A kayıtlarını GitHub Pages'inkilere geri almak yeter; `CNAME`
dosyası bu depoda duruyor, silinmedi.

### Maliyet

Firebase Hosting ücretsiz sınırı: 10 GB depolama, **360 MB/gün** trafik (Blaze
planında da aynı — proje zaten Blaze'de, plan değişikliği yok). Sitenin tamamı
456 KB. Ziyaret başına: davet sayfası ~10 KB (günde ~36.000 ziyaret ücretsiz), ana
sayfa ~110 KB (~3.300 ziyaret) — ağırlığı `turkey-map.svg` yapıyor (gzip 101 KB).
Aşımda GB başına ~0,15 $.
