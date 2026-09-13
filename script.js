let hotels=[];
async function loadHotels(){
  if(hotels.length)return hotels;
  const r=await fetch("hotels.json",{cache:"no-store"});
  if(!r.ok)throw new Error("hotels.json tidak dapat dibaca.");
  const d=await r.json();
  hotels=Array.isArray(d)?d:(d.hotels||d.data||[]);
  return hotels;
}
const val=(h,keys,fb="")=>{for(const k of keys)if(h&&h[k]!==undefined&&h[k]!==null&&h[k]!=="")return h[k];return fb};
const id=(h,i=0)=>val(h,["id","hotel_id","hotelId"],i);
const name=h=>val(h,["name","nama","hotel_name","hotelName"],"Hotel");
const city=h=>val(h,["city","kota","location","lokasi"],"Indonesia");
const price=h=>Number(val(h,["price","harga","harga_per_malam","price_per_night"],0))||0;
const rating=h=>val(h,["rating","rate"],"—");
const image=h=>val(h,["image","image_url","imageUrl","photo","foto","thumbnail"],"https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1000&q=80");
const desc=h=>val(h,["description","deskripsi"],"Hotel nyaman dengan fasilitas yang sesuai untuk kebutuhan perjalanan Anda.");
const rupiah=n=>n?new Intl.NumberFormat("id-ID",{style:"currency",currency:"IDR",maximumFractionDigits:0}).format(n):"Harga tersedia";
function card(h,i){return `<article class="hotel-card"><img src="${image(h)}" alt="${name(h)}" onerror="this.src='https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1000&q=80'"><div class="hotel-body"><h3>${name(h)}</h3><p>📍 ${city(h)}</p><p class="rating">★ ${rating(h)}</p><div class="price">${rupiah(price(h))} <small>/ malam</small></div><a class="btn" href="detail.html?id=${encodeURIComponent(id(h,i))}">Lihat Detail</a></div></article>`}
async function initHome(){
  const box=document.getElementById("featuredHotels"); if(!box)return;
  try{const d=await loadHotels();box.innerHTML=d.slice(0,6).map(card).join("")||"<p>Data hotel belum tersedia.</p>";
  }catch(e){box.innerHTML=`<p class="error">${e.message}</p>`}
  const f=document.getElementById("homeSearch");
  if(f)f.addEventListener("submit",e=>{e.preventDefault();const q=document.getElementById("homeCity").value.trim();location.href="hotels.html"+(q?"?city="+encodeURIComponent(q):"")});
}
async function initHotels(){
  const list=document.getElementById("hotelList");if(!list)return;
  try{
    const d=await loadHotels(),s=document.getElementById("hotelSearch"),c=document.getElementById("cityFilter"),count=document.getElementById("hotelCount");
    const cities=[...new Set(d.map(city))].filter(Boolean).sort();
    c.innerHTML='<option value="">Semua kota</option>'+cities.map(x=>`<option>${x}</option>`).join("");
    const initial=new URLSearchParams(location.search).get("city");if(initial){s.value=initial}
    function render(){
      const q=s.value.toLowerCase().trim(), selected=c.value.toLowerCase();
      const f=d.filter(h=>(!q||(name(h)+" "+city(h)).toLowerCase().includes(q))&&(!selected||city(h).toLowerCase()===selected));
      count.textContent=`Menampilkan ${f.length} dari ${d.length} hotel`;
      list.innerHTML=f.length?f.map(h=>card(h,d.indexOf(h))).join(""):"<p>Hotel tidak ditemukan.</p>";
    }
    s.addEventListener("input",render);c.addEventListener("change",render);render();
  }catch(e){list.innerHTML=`<p class="error">${e.message}</p>`}
}
async function selectedHotel(){const q=new URLSearchParams(location.search).get("id");const d=await loadHotels();return d.find((h,i)=>String(id(h,i))===String(q))||null}
async function initDetail(){
  const box=document.getElementById("hotelDetail");if(!box)return;
  try{const h=await selectedHotel();if(!h){box.innerHTML="<p>Hotel tidak ditemukan. <a href='hotels.html'>Kembali ke daftar hotel</a></p>";return}
  box.innerHTML=`<article class="detail-card"><img src="${image(h)}" alt="${name(h)}"><div class="detail-body"><div class="eyebrow">DETAIL HOTEL</div><h1>${name(h)}</h1><div class="detail-meta"><span>📍 ${city(h)}</span><span>★ ${rating(h)}</span></div><div class="price">${rupiah(price(h))} <small>/ malam</small></div><p>${desc(h)}</p><br><a class="btn" style="background:#2879e8;color:#fff;padding:13px 20px;border-radius:9px;font-weight:750" href="booking.html?id=${encodeURIComponent(id(h,hotels.indexOf(h)))}">Pesan Sekarang</a></div></article>`;
  }catch(e){box.innerHTML=`<p class="error">${e.message}</p>`}
}
async function initBooking(){
  const box=document.getElementById("bookingHotel"),form=document.getElementById("bookingForm");
  if(!box||!form)return;

  try{
    const h=await selectedHotel();

    if(!h){
      box.innerHTML="<p>Belum ada hotel yang dipilih. <a href='hotels.html'>Pilih hotel</a></p>";
      return;
    }

    box.innerHTML=`<img src="${image(h)}" alt="${name(h)}"><h2>${name(h)}</h2><p>📍 ${city(h)}</p><div class="price">${rupiah(price(h))} <small>/ malam</small></div>`;

    form.addEventListener("submit",e=>{
      e.preventDefault();

      const d=new FormData(form);
      const booking={
        hotelId:id(h,hotels.indexOf(h)),
        hotelName:name(h),
        city:city(h),
        price:price(h),
        guestName:d.get("name"),
        phone:d.get("phone"),
        checkin:d.get("checkin"),
        checkout:d.get("checkout"),
        guests:d.get("guests"),
        createdAt:new Date().toISOString()
      };

      localStorage.setItem("bookingHotelData",JSON.stringify(booking));

      location.href="payment.html";
    });

  }catch(e){
    box.innerHTML=`<p class="error">${e.message}</p>`;
  }
}

async function initPayment(){
  const summary=document.getElementById("paymentSummary");
  const button=document.getElementById("paymentButton");
  const message=document.getElementById("paymentMessage");

  if(!summary||!button)return;

  let booking=null;

  try{
    booking=JSON.parse(localStorage.getItem("bookingHotelData")||"null");
  }catch(e){
    booking=null;
  }

  if(!booking){
    summary.innerHTML=`
      <p>Data booking belum tersedia.</p>
      <a class="btn" href="hotels.html">Pilih Hotel</a>
    `;
    button.disabled=true;
    return;
  }

  summary.innerHTML=`
    <div class="payment-summary-row"><span>Hotel</span><b>${booking.hotelName}</b></div>
    <div class="payment-summary-row"><span>Lokasi</span><b>${booking.city}</b></div>
    <div class="payment-summary-row"><span>Nama</span><b>${booking.guestName}</b></div>
    <div class="payment-summary-row"><span>WhatsApp</span><b>${booking.phone}</b></div>
    <div class="payment-summary-row"><span>Check-in</span><b>${booking.checkin}</b></div>
    <div class="payment-summary-row"><span>Check-out</span><b>${booking.checkout}</b></div>
    <div class="payment-summary-row"><span>Tamu</span><b>${booking.guests}</b></div>
    <hr>
    <div class="payment-total"><span>Harga mulai</span><strong>${rupiah(booking.price)} / malam</strong></div>
  `;

  button.addEventListener("click",()=>{
    const selected=document.querySelector('input[name="paymentMethod"]:checked')?.value||"bank";
    const labels={bank:"Transfer Bank",qris:"QRIS",cash:"Bayar di Hotel"};

    message.className="success";
    message.innerHTML=`
      <b>Pesanan siap diproses.</b><br>
      Metode: ${labels[selected]}<br><br>
      <small>Untuk pembayaran nyata, sambungkan tombol ini ke payment gateway resmi. Saat ini transaksi belum menerima atau memproses uang.</small>
    `;
  });
}

document.addEventListener("DOMContentLoaded",()=>{const y=document.getElementById("year");if(y)y.textContent=new Date().getFullYear();document.querySelector(".menu-btn")?.addEventListener("click",()=>document.querySelector(".nav")?.classList.toggle("open"));initHome();initHotels();initDetail();initBooking();initPayment()});
