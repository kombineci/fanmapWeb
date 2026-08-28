/*
 * FanMap — site bilgilendirme şeridi ve yerel depolama tercihleri.
 *
 * Site reklam/analitik çerezi kullanmaz. Tarayıcıda yalnızca iki anahtar tutulur:
 *   fanmap_notice_v1   → şeridin kapatıldığı bilgisi
 *   fanmap_map_v1      → ana sayfadaki haritanın 24 saatlik renk önbelleği
 *   fanmap_livemap_off → canlı harita isteğinin kapatıldığı bilgisi (isteğe bağlı)
 *
 * Şerit bir "rıza duvarı" DEĞİLDİR: gösterilen depolama zorunlu/işlevseldir ve
 * ziyaretçiyi tanımlamaz. Tek üçüncü taraf isteği olan canlı harita verisi
 * çerez politikası sayfasından kapatılabilir.
 */
(function () {
    'use strict';

    var KEY = 'fanmap_notice_v1';

    function get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
    function set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }

    if (get(KEY)) return;
    if (location.pathname.indexOf('cookie-policy') !== -1) return;

    function build() {
        var style = document.createElement('style');
        style.textContent = [
            '.fm-notice{position:fixed;left:16px;right:16px;bottom:16px;z-index:9999;',
            'max-width:660px;margin:0 auto;background:#fff;color:#3f4060;',
            'border:1px solid #e9e8f5;border-radius:16px;padding:16px 18px;',
            'box-shadow:0 18px 44px rgba(20,21,42,.16);display:flex;gap:14px;',
            'align-items:center;flex-wrap:wrap;font-size:.9rem;line-height:1.6;',
            'font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;',
            'transform:translateY(12px);opacity:0;transition:opacity .35s,transform .35s}',
            '.fm-notice.in{opacity:1;transform:none}',
            '.fm-notice p{margin:0;flex:1 1 300px}',
            '.fm-notice a{color:#6366f1;text-decoration:none;font-weight:600}',
            '.fm-notice a:hover{text-decoration:underline}',
            '.fm-notice button{border:0;cursor:pointer;font:inherit;font-weight:600;',
            'padding:9px 18px;border-radius:11px;background:#14152a;color:#fff}',
            '.fm-notice button:hover{background:#6366f1}',
            '@media(max-width:520px){.fm-notice{flex-direction:column;align-items:stretch}',
            '.fm-notice button{width:100%}}'
        ].join('');
        document.head.appendChild(style);

        var box = document.createElement('div');
        box.className = 'fm-notice';
        box.setAttribute('role', 'region');
        box.setAttribute('aria-label', 'Çerez ve yerel depolama bilgilendirmesi');
        box.innerHTML =
            '<p>Bu sitede reklam veya analitik çerezi kullanılmaz. Yalnızca haritanın ' +
            'hızlı açılması için tarayıcınızda küçük bir önbellek tutulur. ' +
            '<a href="/cookie-policy.html">Ayrıntılar ve tercihler</a></p>' +
            '<button type="button">Anladım</button>';

        box.querySelector('button').addEventListener('click', function () {
            set(KEY, String(Date.now()));
            box.classList.remove('in');
            setTimeout(function () { box.remove(); }, 350);
        });

        document.body.appendChild(box);
        requestAnimationFrame(function () { box.classList.add('in'); });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', build);
    } else {
        build();
    }
})();
