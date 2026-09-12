let hotels = [], selected = null;
const WA = "6285828781836";
const $ = id => document.getElementById(id);

fetch("hotels.json")
  .then(r => r.json())
  .then(d => {
    hotels = d.hotels || [];
    render();
  })
  .catch(() => {
    $("grid").innerHTML =
      '<div class="empty">hotels.json tidak ditemukan. Pastikan file berada satu folder dengan index.html.</div>';
  });

function render() {
  const city = $("city").value.trim().toLowerCase();
  const group = $("group").value;

  const list = hotels.filter(h =>
    (!city ||
      `${h.name} ${h.city} ${h.province}`
        .toLowerCase()
        .includes(city)) &&
    (!group || h.group === group)
  );

  $("count").textContent = list.length;

  $("grid").innerHTML =
    list.map(h => {
      const isPromo = h.id === 23 || h.discount?.value === 20;

      return `
        <article class="card">
          <div class="pic">
            <img
              src="${h.image}"
              alt="${esc(h.name)}"
              loading="lazy"
            >

            <button class="heart">♡</button>

            ${
              isPromo
                ? `<span class="promo-badge">DISKON 20%</span>`
                : ""
            }
          </div>

          <div class="body">
            <span class="tag">${esc(h.group)}</span>

            <h3>${esc(h.name)}</h3>

            <div class="loc">
              📍 ${esc(h.city)}, ${esc(h.province)}
            </div>

            ${
              isPromo
                ? `<div class="promo-text">🏷️ Promo diskon 20%</div>`
                : ""
            }

            <div class="verify">
              ✓ Hotel nyata • sumber resmi tersedia
            </div>

            <button
              class="pick"
              onclick="openBook(${h.id})"
            >
              Pilih Hotel
            </button>
          </div>
        </article>
      `;
    }).join("") ||
    '<div class="empty">Hotel tidak ditemukan.</div>';
}

function searchHotels() {
  render();
  $("grid").scrollIntoView({
    behavior: "smooth"
  });
}

function openBook(id) {
  selected = hotels.find(h => h.id === id);

  if (!selected) return;

  $("mImg").src = selected.image;
  $("mName").textContent = selected.name;
  $("mLoc").textContent =
    `📍 ${selected.city}, ${selected.province}`;
  $("mGroup").textContent = selected.group;

  $("bIn").value = $("checkin").value;
  $("bOut").value = $("checkout").value;
  $("bGuests").value = $("guests").value;

  $("room").innerHTML = selected.rooms.map(r => {
    const discount = getDiscount(selected, r);
    const finalPrice = Math.round(
      r.price_per_night * (1 - discount / 100)
    );

    return `
      <option value="${r.id}">
        ${esc(r.name)} —
        Rp ${fmt(finalPrice)}/malam
        ${discount ? `(diskon ${discount}%)` : ""}
      </option>
    `;
  }).join("");

  $("modal").style.display = "block";

  updateSummary();
}

function closeModal() {
  $("modal").style.display = "none";
}

function nights() {
  const a = $("bIn").value;
  const b = $("bOut").value;

  if (!a || !b) return 0;

  const n = Math.round(
    (
      new Date(b + "T00:00:00") -
      new Date(a + "T00:00:00")
    ) / 86400000
  );

  return n > 0 ? n : 0;
}

/*
 * Mengambil diskon dari data hotel.
 * Jika tidak ada data diskon, default 20%
 * hanya untuk hotel Lenora.
 */
function getDiscount(hotel, room) {
  if (hotel?.discount?.value) {
    return Number(hotel.discount.value);
  }

  if (hotel?.id === 23) {
    return 20;
  }

  return 0;
}

function updateSummary() {
  if (!selected) return;

  const n = nights();

  const r = selected.rooms.find(
    x => x.id == $("room").value
  );

  if (!r) {
    $("nights").textContent = n;
    $("nightPrice").textContent = "Konfirmasi";
    $("total").textContent = "Menunggu harga";
    return;
  }

  const discount = getDiscount(selected, r);

  const price = Number(r.price_per_night);

  const discounted = Math.round(
    price * (1 - discount / 100)
  );

  const qty = Number(
    $("roomQty").value || 1
  );

  $("nights").textContent = n;

  if (discount > 0) {
    $("nightPrice").innerHTML = `
      <span class="old">
        Rp ${fmt(price)}
      </span>

      <b>
        Rp ${fmt(discounted)}
      </b>

      <small>
        (diskon ${discount}%)
      </small>
    `;
  } else {
    $("nightPrice").innerHTML =
      `<b>Rp ${fmt(price)}</b>`;
  }

  $("total").textContent =
    discounted && n
      ? `Rp ${fmt(discounted * n * qty)}`
      : "Menunggu harga";
}

["bIn", "bOut", "room", "roomQty"]
  .forEach(id => {
    $(id).addEventListener(
      "change",
      updateSummary
    );
  });

function confirmBooking() {
  if (!selected) return;

  const name = $("name").value.trim();
  const phone = $("phone").value.trim();
  const n = nights();

  const r = selected.rooms.find(
    x => x.id == $("room").value
  );

  if (!name || !phone) {
    alert(
      "Isi nama pemesan dan nomor WhatsApp terlebih dahulu."
    );
    return;
  }

  if (!n) {
    alert(
      "Pilih tanggal check-in dan check-out yang benar."
    );
    return;
  }

  if (!r) {
    alert(
      "Silakan pilih tipe kamar terlebih dahulu."
    );
    return;
  }

  const price = Number(r.price_per_night);
  const discount = getDiscount(selected, r);

  const discounted = Math.round(
    price * (1 - discount / 100)
  );

  const qty = Number(
    $("roomQty").value || 1
  );

  const total = discounted * n * qty;

  const proof =
    $("proof").files[0]?.name ||
    "Belum dilampirkan";

  const msg = `Halo, saya ingin konfirmasi booking hotel.

Nama: ${name}
No. HP: ${phone}

Hotel: ${selected.name}
Lokasi: ${selected.city}, ${selected.province}

Check-in: ${$("bIn").value}
Check-out: ${$("bOut").value}
Jumlah malam: ${n}
Tamu: ${$("bGuests").value}

Tipe kamar: ${r.name}
Jumlah kamar: ${qty}

Harga normal/malam: Rp ${fmt(price)}
Diskon: ${discount}%
Harga setelah diskon/malam: Rp ${fmt(discounted)}

Total setelah diskon: Rp ${fmt(total)}

Bukti pembayaran: ${proof}

Mohon konfirmasi ketersediaan kamar, harga, dan total pembayaran sebelum saya melakukan transfer.

Rekening pembayaran:
OCBC NISP
940810293248
a.n. Winda Sintia`;

  window.open(
    `https://wa.me/${WA}?text=${encodeURIComponent(msg)}`,
    "_blank"
  );
}

$("topWa").onclick = () => {
  const msg =
    "Halo, saya ingin menanyakan booking hotel.";

  window.open(
    `https://wa.me/${WA}?text=${encodeURIComponent(msg)}`,
    "_blank"
  );
};

window.addEventListener("click", e => {
  if (e.target.id === "modal") {
    closeModal();
  }
});

function fmt(n) {
  return Number(n).toLocaleString("id-ID");
}

function esc(s) {
  return String(s).replace(
    /[&<>"']/g,
    c => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"
    }[c])
  );
}
