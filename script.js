let hotels=[], selected=null;
const WA="6285828781836";
fetch("hotels.json").then(r=>r.json()).then(d=>{hotels=d.hotels;render()});
function render(){
 const city=(document.getElementById("city").value||"").toLowerCase().trim();
 const group=document.getElementById("group").value;
 const data=hotels.filter(h=>(!city||`${h.name} ${h.city} ${h.province}`.toLowerCase().includes(city))&&(!group||h.group===group));
 document.getElementById("count").textContent=data.length;
 document.getElementById("hotelGrid").innerHTML=data.map(h=>`<article class="card"><div class="photo">🏨</div><div class="content"><div class="tag">${h.group}</div><h3>${h.name}</h3><div class="loc">📍 ${h.city}, ${h.province}</div><div class="real">✓ Hotel nyata • sumber resmi tersedia</div><button onclick="openBook(${h.id})">Pilih Hotel</button></div></article>`).join("");
}
function searchHotels(){render();document.getElementById("hotelGrid").scrollIntoView({behavior:"smooth"})}
function openBook(id){selected=hotels.find(h=>h.id===id);document.getElementById("mName").textContent=selected.name;document.getElementById("mLoc").textContent=`${selected.city}, ${selected.province}`;document.getElementById("modal").style.display="block"}
function closeModal(){document.getElementById("modal").style.display="none"}
function confirmWA(){
 if(!selected)return;
 const name=document.getElementById("bookName").value.trim(), phone=document.getElementById("bookPhone").value.trim();
 if(!name||!phone){alert("Mohon isi nama dan nomor HP.");return}
 const msg=`Halo, saya ingin konfirmasi booking hotel.%0A%0ANama: ${encodeURIComponent(name)}%0ANo. HP: ${encodeURIComponent(phone)}%0AHotel: ${encodeURIComponent(selected.name)}%0AKota: ${encodeURIComponent(selected.city)}%0ACheck-in: ${encodeURIComponent(document.getElementById("checkin").value||"-")}%0ACheck-out: ${encodeURIComponent(document.getElementById("checkout").value||"-")}%0ATamu: ${encodeURIComponent(document.getElementById("guests").value)}%0AJumlah kamar: ${encodeURIComponent(document.getElementById("rooms").value)}%0ACatatan: ${encodeURIComponent(document.getElementById("note").value||"-")}%0A%0AMohon konfirmasi harga, ketersediaan, dan total pembayaran.%0A%0ARekening pembayaran: OCBC NISP 940810293248 a.n. Winda Sintia`;
 window.open(`https://wa.me/${WA}?text=${msg}`,"_blank");
}
document.getElementById("topWa").onclick=()=>window.open(`https://wa.me/${WA}?text=Halo%2C%20saya%20ingin%20menanyakan%20booking%20hotel.`,"_blank");
window.onclick=e=>{if(e.target.id==="modal")closeModal()}
