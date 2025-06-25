
// Typing animation
const texts = ["Auto Panel Creator", "Pterodactyl API", "Joocode Developer", "Server Management"];
let textIndex = 0;
let charIndex = 0;
const typingElement = document.getElementById("typing");

function typeText() {
  if (charIndex < texts[textIndex].length) {
    typingElement.textContent += texts[textIndex].charAt(charIndex);
    charIndex++;
    setTimeout(typeText, 100);
  } else {
    setTimeout(eraseText, 2000);
  }
}

function eraseText() {
  if (charIndex > 0) {
    typingElement.textContent = texts[textIndex].substring(0, charIndex - 1);
    charIndex--;
    setTimeout(eraseText, 50);
  } else {
    textIndex = (textIndex + 1) % texts.length;
    setTimeout(typeText, 500);
  }
}

// Start typing animation
typeText();

document.getElementById("panelForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const username = document.getElementById("username").value.toLowerCase();
  const email = document.getElementById("email").value.toLowerCase();
  const size = document.getElementById("size").value;
  const resultBox = document.getElementById("result");

  // Convert size ke RAM dalam MB
  let ram = 1024; // default 1GB
  if (size === "2gb") ram = 2048;
  else if (size === "3gb") ram = 3072;
  else if (size === "4gb") ram = 4096;
  else if (size === "5gb") ram = 5120;
  else if (size === "6gb") ram = 6144;
  else if (size === "7gb") ram = 7168;
  else if (size === "8gb") ram = 8192;
  else if (size === "9gb") ram = 9216;
  else if (size === "10gb") ram = 10240;
  else if (size === "unlimited") ram = 0; // unlimited

  resultBox.innerHTML = "Membuat panel...";

  try {
    // Gunakan URL relatif untuk menggunakan domain yang sama
    const res = await fetch("https://93435678-da55-4c8f-bc50-31bad0d1b364-00-2w31z89v7uzss.sisko.replit.dev/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email, size })
    });

    // Check if response is JSON
    const contentType = res.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await res.text();
      resultBox.innerHTML = "Server error: Bukan response JSON. Server mungkin offline atau ada masalah.";
      console.error('Non-JSON response:', text);
      return;
    }

    const data = await res.json();

    if (data.error || data.errors) {
      resultBox.innerHTML = "Gagal: " + (data.error || data.errors || "Unknown Error");
      return;
    }

      resultBox.innerHTML = `
      » Panel berhasil dibuat! «<br/><br/>
      緒 Domain: ${data.panel_url}<br/>
      緒 Username: ${data.username}<br/>
      緒 Password: ${data.password}<br/>
      緒 Email: ${data.email}<br/>
      緒 Server ID: ${data.server_id}
    `;
  } catch (err) {
    resultBox.innerHTML = "Error saat request: " + err.message;
  }
});
