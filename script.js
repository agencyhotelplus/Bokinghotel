let hotelsCache = null;

async function loadHotels(){
  if(hotelsCache) return hotelsCache;
  const response = await fetch("hotels.json", {cache:"no-store"});
  if(!response.ok) throw new Error("hotels.json tidak dapat dibaca.");
  const data = await response.json();
  hotelsCache = Array.isArray(data) ? data : (data.hotels || data.data || []);
  return hotelsCache;
}

function getValue(h, keys, fallback=""){
  for(const key of keys){
    if(h && h[key] !== undefined && h[key] !== null && h[key] !== "") return h[key];
  }
  return fallback;
}

function hotelId(h, index){
  return getValue(h, ["id","hotel_id","hotelId"], index);
}
function hotelName(h){return getValue(h,["name","nama","hotel_name","hotelName"],"Hotel");}
function hotelCity(h){return getValue(h,["city","kota","location","lokasi"],"Indonesia");}
function hotelPrice(h){return Number(getValue(h,["price","harga","harga_per_malam","price_per_night"],0)) || 0;}
function hotelRating(h){return getValue(h,["rating","rate"],"—");}
function hotelImage(h){
  return getValue(h,["image","imageUrl","image_url","foto","photo","thumbnail"],"https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1000&q=80");
}
function rupiah(n){return n ? new Intl.NumberFormat("id-ID",{style:"currency",currency:"IDR",maximumFractionDigits:0}).format(n) : "Harga tersedia di hotel";}

function hotelCard(h,index){
  const id = encodeURIComponent(hotelId(h,index));
  return `<article class="hotel-card">
    <img src="${hotelImage(h)}" alt="${hotelName(h)}" onerror="this.src='https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1000&q=80'">
    <div class="hotel-body">
      <h3>${hotelName(h)}</h3>
      <p>📍 ${hotelCity(h)}</p>
      <p class="rating">★ ${hotelRating(h)}</p>
      <div class="price">${rupiah(hotelPrice(h))} <small>/ malam</small></div>
      <div class="card-actions"><a class="btn" href="detail.html?id=${id}">Lihat Detail</a></div>
    </div>
  </article>`;
}

async function initHome(){
  const box=document.querySelector("#featuredHotels");
  if(!box)return;
  try{
    const hotels=await loadHotels();
    box.innerHTML=hotels.slice(0,6).map((h,i)=>hotelCard(h,i)).join("");
  }catch(e){box.innerHTML=`<p class="error">${e.message}</p>`}
}

async function initHotels(){
  const list=document.querySelector("#hotelList");
  if(!list)return;
  try{
    const hotels=await loadHotels();
    const search=document.querySelector("#hotelSearch");
    const city=document.querySelector("#cityFilter");
    const cities=[...new Set(hotels.map(h=>hotelCity(h)).filter(Boolean))].sort();
    city.innerHTML='<option value="">Semua kota</option>'+cities.map(c=>`<option value="${String(c).toLowerCase()}">${c}</option>`).join("");
    function render(){
      const q=search.value.toLowerCase().trim(), c=city.value;
      const filtered=hotels.filter(h=>{
        const text=(hotelName(h)+" "+hotelCity(h)).toLowerCase();
        return (!q||text.includes(q)) && (!c||hotelCity(h).toLowerCase()===c);
      });
      document.querySelector("#hotelCount").textContent=`Menampilkan ${filtered.length} hotel`;
      list.innerHTML=filtered.length?filtered.map((h,i)=>hotelCard(h,i)).join(""):"<p>Tidak ada hotel yang cocok.</p>";
    }
    search.addEventListener("input",render); city.addEventListener("change",render); render();
  }catch(e){list.innerHTML=`<p class="error">${e.message}</p>`}
}

async function findHotelFromUrl(){
  const id=new URLSearchParams(location.search).get("id");
  const hotels=await loadHotels();
  const index=hotels.findIndex((h,i)=>String(hotelId(h,i))===String(id));
  return index>=0 ? {hotel:hotels[index],index} : null;
}

async function initDetail(){
  const box=document.querySelector("#hotelDetail");
  if(!box)return;
  try{
    const result=await findHotelFromUrl();
    if(!result){box.innerHTML="<p>Hotel tidak ditemukan. <a href='hotels.html'>Kembali ke daftar hotel</a></p>";return;}
    const h=result.hotel, id=encodeURIComponent(hotelId(h,result.index));
    box.innerHTML=`<article class="detail-card">
      <img src="${hotelImage(h)}" alt="${hotelName(h)}">
      <div class="detail-body">
        <p class="eyebrow">DETAIL HOTEL</p>
        <h1>${hotelName(h)}</h1>
        <div class="detail-meta"><span>📍 ${hotelCity(h)}</span><span>★ ${hotelRating(h)}</span></div>
        <h2>${rupiah(hotelPrice(h))} <small>/ malam</small></h2>
        <p>${getValue(h,["description","deskripsi"],"Hotel nyaman dengan fasilitas yang sesuai untuk perjalanan Anda.")}</p>
        <a class="btn" href="booking.html?id=${id}">Pesan Sekarang</a>
      </div>
    </article>`;
  }catch(e){box.innerHTML=`<p class="error">${e.message}</p>`}
}

async function initBooking(){
  const box=document.querySelector("#bookingHotel");
  const form=document.querySelector("#bookingForm");
  if(!box||!form)return;
  try{
    const result=await findHotelFromUrl();
    if(!result){box.innerHTML="<p>Hotel belum dipilih. <a href='hotels.html'>Pilih hotel</a></p>";return;}
    const h=result.hotel;
    box.innerHTML=`<img src="${hotelImage(h)}" alt="${hotelName(h)}"><h2>${hotelName(h)}</h2><p>📍 ${hotelCity(h)}</p><p class="price">${rupiah(hotelPrice(h))} / malam</p>`;
    form.addEventListener("submit",e=>{
      e.preventDefault();
      const data=new FormData(form);
      const out=document.querySelector("#bookingMessage");
      out.className="success";
      out.innerHTML=`Pemesanan untuk <b>${hotelName(h)}</b> berhasil dicatat secara demo. Silakan hubungi admin untuk konfirmasi pembayaran.`;
      form.reset();
    });
  }catch(e){box.innerHTML=`<p class="error">${e.message}</p>`}
}

document.querySelector("#year") && (document.querySelector("#year").textContent=new Date().getFullYear());
initHome();
initHotels();
initDetail();
initBooking();
