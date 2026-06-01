# Great Mind AI — Merkezi Veri Toplama Kurulumu

Tüm öğrencilerin etkileşim ve analiz verileri **tek bir Google Sheets**'te,
**hiç kayıp olmadan** toplanır. Kurulum 5 dakika, **bir kez** yapılır.

> Mimari: Uygulama → Google Apps Script (webhook) → Google Sheets
> (Statik site doğrudan Sheet'e yazamaz; Apps Script köprü görevi görür.)

---

## Adım 1: Google Sheet Oluştur

1. [sheets.google.com](https://sheets.google.com) → **Boş tablo**
2. Adını **"Great Mind AI — Veri"** yap
3. **Başlık satırını yazmana gerek yok** — kod ilk çalıştığında otomatik oluşturur.

---

## Adım 2: Apps Script Kodu

1. Sheet'te üst menü: **Uzantılar → Apps Script**
2. Açılan editördeki her şeyi sil, aşağıdaki kodu yapıştır:

```javascript
// Great Mind AI — Merkezi Veri Toplayıcı
const SHEET_NAME = 'Veriler';

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(30000); // eşzamanlı yazımları sıraya al (kayıp olmasın)
  try {
    const data = JSON.parse(e.postData.contents);
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);

    // Tüm olası alanlar (sıralı sütunlar)
    const COLS = [
      'eventId','ts','tarih','saat','event','userId','email','username',
      'lang','device','xp','streak','totalChats','reportCount','badgeCount',
      // sohbet / quiz
      'character','charId','category','msgCount','quizScore','quizPct',
      // analiz raporu
      'reportId','student','konu','sinif','dusunmeBecerisi','gozlemOdagi',
      'puan10','puanToplam12','ozet','oneri','arastirmaciNotu',
      // 6 kriter puanı + kanıt
      'k_isimle_hitap','kanit_isimle_hitap','k_nezaket','kanit_nezaket',
      'k_gorev_odak','kanit_gorev_odak','k_merak_soru','kanit_merak_soru',
      'k_dusunme_beceri','kanit_dusunme_beceri','k_sosyal_etki','kanit_sosyal_etki'
    ];

    // Başlık satırı yoksa oluştur
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(COLS);
      sheet.setFrozenRows(1);
    }

    // İstanbul saatiyle tarih/saat ekle
    const now = new Date();
    data.tarih = Utilities.formatDate(now, 'Europe/Istanbul', 'dd.MM.yyyy');
    data.saat  = Utilities.formatDate(now, 'Europe/Istanbul', 'HH:mm:ss');

    // Satırı sütun sırasına göre diz
    const row = COLS.map(function(c){ return (c in data) ? data[c] : ''; });
    sheet.appendRow(row);

    return ContentService.createTextOutput(JSON.stringify({ok:true}))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ok:false, error:String(err)}))
      .setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

function doGet() {
  return ContentService.createTextOutput(JSON.stringify({ok:true, service:'Great Mind AI'}))
    .setMimeType(ContentService.MimeType.JSON);
}
```

3. **Kaydet** (💾 veya Ctrl+S)

---

## Adım 3: Web App Olarak Yayınla

1. Sağ üstte **Dağıt → Yeni dağıtım**
2. ⚙️ (dişli) → **Web uygulaması**
3. Ayarlar:
   - **Açıklama:** Great Mind AI
   - **Çalıştıran:** **Ben** (kendi hesabın)
   - **Erişimi olanlar:** **Herkes** ← ÇOK ÖNEMLİ
4. **Dağıt** → Google izinlerini onayla (kendi hesabın için güvenli)
5. Çıkan **Web Uygulaması URL'sini kopyala**
   *(`https://script.google.com/macros/s/XXXX.../exec` biçiminde)*

---

## Adım 4: URL'yi Bağla — İki Yol

### A) Otomatik (önerilen, tüm öğrenciler için)
Bu `/exec` URL'sini **bana ver**; uygulamaya gömerim. O andan itibaren
**her öğrenci hiçbir ayar yapmadan** otomatik bu Sheet'e veri gönderir.

### B) Manuel (tek cihaz için)
1. **https://usoyrac.github.io/greatmindai/** aç
2. Sağ üstte **📊** → URL'yi yapıştır → **Kaydet**
   (📊✓ olur = veri toplama aktif)

---

## Toplanan Veriler (kapsamlı)

| Grup | Sütunlar |
|---|---|
| Kimlik | eventId, ts, tarih, saat, userId, **email**, username |
| Olay | event (app_open / chat_start / chat_end / quiz_complete / **report_created** / report_note / onboarding_complete) |
| Bağlam | lang, device, xp, streak, totalChats, reportCount, badgeCount |
| Sohbet/Quiz | character, charId, category, msgCount, quizScore, quizPct |
| **Analiz raporu** | reportId, student, konu, sinif, dusunmeBecerisi, gozlemOdagi, puan10, puanToplam12, ozet, oneri, arastirmaciNotu |
| **6 kriter** | k_* (0-2 puan) + kanit_* (sohbetten alıntı) — isimle hitap, nezaket, göreve odaklılık, merak, düşünme becerisi, sosyal etkileşim |

### Kayıpsızlık garantisi
- Her olay önce cihazda **kuyruğa** alınır, sonra gönderilir.
- İnternet yoksa / gönderim başarısızsa olay **kuyrukta kalır**, çevrimiçi
  olunca / uygulama tekrar açılınca **otomatik gönderilir**.
- `sendBeacon` + `keepalive` ile sayfa kapanırken bile veri ulaşır.
- Apps Script tarafında `LockService` ile eşzamanlı yazımlar sıraya alınır.

---

## Gizlilik (KVKK)
- Sohbet metinlerinin tamamı toplanmaz — yalnızca analiz metrikleri ve
  araştırma için seçilmiş kanıt alıntıları.
- E-posta yalnızca araştırmacının öğrencileri ayırt etmesi içindir.
- Konum, telefon gibi kişisel veri toplanmaz.
- Her cihaz ayrıca anonim bir `userId` ile de işaretlenir.
