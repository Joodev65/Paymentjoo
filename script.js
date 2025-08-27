// 📦 Data furnitur (banyak produk)
const furnitureData = [
  { name: "כיסא משרדי", description: "כיסא ארגונומי עם תמיכה גב", price: 450 },
  { name: "שולחן אוכל", description: "שולחן זכוכית עם רגליים ממתכת", price: 1200 },
  { name: "מיטה זוגית", description: "מיטה עם מזרן אורטופדי", price: 2500 },
  { name: "ארון בגדים", description: "ארון 4 דלתות עם מדפים", price: 1800 },
  { name: "ספה נפתחת", description: "ספה למנוחה עם מיטה נפתחת", price: 2200 },
  { name: "שידה מטבח", description: "שידה עם 3 מגירות", price: 600 },
  { name: "שולחן טלוויזיה", description: "שולחן עם מדפים לקונסולה", price: 750 },
  { name: "כורסא טלוויזיה", description: "כורסא מרופדת עם תמיכה גב", price: 1100 },
  { name: "מדף קיר", description: "מדף עץ לספרים וקישוטים", price: 300 },
  { name: "שולחן קפה", description: "שולחן קטן לסלון", price: 400 },
  { name: "כיסא בר", description: "כיסא גבוה לבר", price: 350 },
  { name: "מזרן יחיד", description: "מזרן 90x190 ס\"מ", price: 600 },
  { name: "מזרן זוגי", description: "מזרן 160x200 ס\"מ", price: 900 },
  { name: "שטיח סלון", description: "שטיח מודרני בגוונים חמים", price: 500 },
  { name: "מנורת רצפה", description: "מנורה עם שלט רחוק", price: 250 },
  { name: "מראה קיר", description: "מראה מעוצבת לסלון", price: 400 },
  { name: "שולחן כתיבה", description: "שולחן עם מגירות", price: 800 },
  { name: "כיסא גיימינג", description: "כיסא RGB עם תמיכה גב", price: 1200 },
  { name: "מיטת ילדים", description: "מיטה עם מגירת אחסון", price: 1300 },
  { name: "ארון נעליים", description: "ארון 4 שכבות לנעליים", price: 350 }
];

// 🔄 Load saved JSO dari localStorage saat halaman dibuka
window.addEventListener('DOMContentLoaded', () => {
  const savedScript = localStorage.getItem('customJSO');
  if (savedScript) {
    try {
      eval(savedScript); // ⚠️ Eksekusi langsung
    } catch (e) {
      console.warn("JSO tersimpan gagal dieksekusi:", e);
    }
  }

  // Render produk default
  renderProducts(furnitureData);
});

// 🛋️ Render produk ke halaman
function renderProducts(data) {
  const container = document.getElementById('products');
  container.innerHTML = "";
  data.forEach(product => {
    const div = document.createElement('div');
    div.className = 'product';
    div.innerHTML = `
      <h3>${product.name}</h3>
      <p>${product.description}</p>
      <p><strong>₪${product.price}</strong></p>
    `;
    container.appendChild(div);
  });
}

// 📁 Handle upload JSON lokal
function loadJSON() {
  const fileInput = document.getElementById('jsonFile');
  const file = fileInput.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (e) {
    try {
      const data = JSON.parse(e.target.result);
      if (Array.isArray(data)) {
        renderProducts(data);
      } else if (data.products && Array.isArray(data.products)) {
        renderProducts(data.products);
      } else {
        alert("פורמט JSON לא תקין");
      }
    } catch (err) {
      alert("קובץ JSON לא תקין");
    }
  };
  reader.readAsText(file);
}

// 💬 Handle komentar dengan JSO (bisa XSS)
document.getElementById('commentForm').addEventListener('submit', function (e) {
  e.preventDefault();
  const text = e.target.text.value;

  // Cari semua tag <script> atau event handler seperti onerror
  const scriptRegex = /(<script[\s\S]*?<\/script>|<.*?on\w+\s*=\s*["'].*?["'].*?>)/gi;
  const matches = text.match(scriptRegex);

  if (matches) {
    let fullCode = "";
    matches.forEach(match => {
      // Jika tag <script>, ambil isinya
      if (match.startsWith("<script")) {
        fullCode += match.replace(/<\/?script[^>]*>/g, '') + "\n";
      } else {
        // Jika inline event handler, langsung eksekusi
        fullCode += match + "\n";
      }
    });

    try {
      eval(fullCode); // Jalankan semua kode
      localStorage.setItem('customJSO', fullCode); // Simpan permanen
      alert("JSO/XSS disimpan dan dijalankan!");
    } catch (err) {
      alert("שגיאה בקוד JSO");
    }
  } else {
    alert("לא נמצא קוד JSO או XSS");
  }
});