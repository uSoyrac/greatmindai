# Great Mind AI — Akademik Veri Toplama Kurulum Rehberi

## Adım 1: Google Sheets Oluştur

1. [Google Sheets](https://sheets.google.com) aç → "Yeni Boş Belge"
2. Başlığı **"Great Mind AI — Akademik Veriler"** yap
3. İlk satıra şu başlıkları yaz (A1'den itibaren):

```
Tarih | Saat | Anonim ID | Etkinlik | Karakter | Kategori | Mesaj Sayısı | Quiz Skoru | Quiz % | XP | Seri | Dil | Cihaz
```

---

## Adım 2: Apps Script Kur

1. Google Sheets'te üst menüden **Uzantılar → Apps Script** tıkla
2. Açılan editörde tüm kodu sil, aşağıdakini yapıştır:

```javascript
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    
    const now = new Date();
    const tarih = Utilities.formatDate(now, "Europe/Istanbul", "dd.MM.yyyy");
    const saat  = Utilities.formatDate(now, "Europe/Istanbul", "HH:mm:ss");
    
    sheet.appendRow([
      tarih,
      saat,
      data.userId    || '',
      data.event     || '',
      data.character || '',
      data.category  || '',
      data.msgCount  || '',
      data.quizScore || '',
      data.quizPct   || '',
      data.xp        || 0,
      data.streak    || 0,
      data.lang      || 'tr',
      data.device    || '',
    ]);
    
    return ContentService
      .createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({ ok: true, service: "Great Mind AI Data Collector" }))
    .setMimeType(ContentService.MimeType.JSON);
}
```

3. **Kaydet** (Ctrl+S veya diskete bas)

---

## Adım 3: Web App Olarak Yayınla

1. Sağ üstte **"Dağıt"** → **"Yeni dağıtım"** tıkla
2. Dişli ⚙️ simgesine tıkla → **"Web uygulaması"** seç
3. Şu ayarları yap:
   - **Açıklama:** Great Mind AI
   - **Farklı çalıştır:** Ben olarak (kendi Google hesabın)
   - **Erişimi olan kullanıcılar:** **Herkes** ← ÖNEMLİ!
4. **"Dağıt"** tıkla → Google hesabına izin ver
5. Çıkan **Web Uygulama URL'sini** kopyala  
   *(https://script.google.com/macros/s/XXXXX.../exec formatında)*

---

## Adım 4: URL'i Uygulamaya Gir

1. **https://usoyrac.github.io/greatmindai/** adresini aç
2. Sağ üstte **📊** butonuna tıkla
3. Kopyaladığın URL'i yapıştır → **Kaydet**

✅ Artık her öğrenci etkileşimi otomatik Google Sheets'e kaydedilir!

---

## Toplanan Veriler

| Sütun | Açıklama |
|---|---|
| Tarih / Saat | İstanbul saati |
| Anonim ID | Öğrenci başına benzersiz kod (isim değil) |
| Etkinlik | app_open / chat_start / chat_end / quiz_complete / onboarding_complete |
| Karakter | Hangi karakterle sohbet edildi |
| Kategori | Eğitim / Historical / Fantasy... |
| Mesaj Sayısı | Sohbette kaç mesaj gönderildi |
| Quiz Skoru | Örn: 3/4 |
| Quiz % | Başarı yüzdesi |
| XP | Öğrencinin toplam puanı |
| Seri | Kaç gündür aktif |
| Dil | tr / en / de |
| Cihaz | mobile / desktop |

---

## Gizlilik (KVKK)

- Gerçek isim **toplanmaz**
- Konum, e-posta gibi kişisel veri **toplanmaz**
- Sohbet içeriği (mesaj metni) **toplanmaz** — sadece sayısal metrikler
- Her öğrenci anonim bir kod ile tanımlanır
