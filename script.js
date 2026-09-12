let hotels=[],selected=null;
const WA="6285828781836";
const $=id=>document.getElementById(id);

fetch("hotels.json").then(r=>r.json()).then(d=>{hotels=d.hotels||[];render();}).catch(()=>{$("grid").innerHTML='<div class="empty">hotels.json tidak ditemukan. Pastikan file berada satu folder dengan index.html.</div>'});

function render(){
 const city=$("city").value.trim().toLowerCase(), group=$("group").value;
 const list=hotels.filter(h=>(!city||`${h.name} ${h.city} ${h.province}`.toLowerCase().includes(city))&&(!group||h.group===group));
 $("count").textContent=list.length;
 $("grid").innerHTML=list.map(h=>`<article class="card"><div class="pic"><img src="${h.image}" alt="${esc(h.name)}" loading="lazy"><button class="heart">♡</button></div><div class="body"><span class="tag">${esc(h.group)}</span><h3>${esc(h.name)}</h3><div class="loc">📍 ${esc(h.city)}, ${esc(h.province)}</div><div class="verify">✓ Hotel nyata • sumber resmi tersedia</div><button class="pick" onclick="openBook(${h.id})">Pilih Hotel</button></div></article>`).join("")||'<div class="empty">Hotel tidak ditemukan.</div>';
}
function searchHotels(){render();$("grid").scrollIntoView({behavior:"smooth"})}
function openBook(id){
 selected=hotels.find(h=>h.id===id); if(!selected)return;
 $("mImg").src=selected.image;$("mName").textContent=selected.name;$("mLoc").textContent=`📍 ${selected.city}, ${selected.province}`;$("mGroup").textContent=selected.group;
 $("bIn").value=$("checkin").value;$("bOut").value=$("checkout").value;$("bGuests").value=$("guests").value;
 $("room").innerHTML=selected.rooms.map(r=>`<option value="${r.id}">${esc(r.name)}${r.price_per_night?` — Rp ${fmt(r.price_per_night)}/malam`:" — harga konfirmasi"}</option>`).join("");
 $("modal").style.display="block";updateSummary();
}
function closeModal(){$("modal").style.display="none"}
function nights(){
 const a=$("bIn").value,b=$("bOut").value;
 if(!a||!b)return 0;
 const n=Math.round((new Date(b+"T00:00:00")-new Date(a+"T00:00:00"))/86400000);
 return n>0?n:0;
}
function updateSummary(){
 const n=nights(),r=selected?.rooms.find(x=>x.id==$("room").value),price=r?.price_per_night;
 $("nights").textContent=n;$("nightPrice").textContent=price?`Rp ${fmt(price)}`:"Konfirmasi";
 $("total").textContent=(price&&n)?`Rp ${fmt(price*n*Number($("roomQty").value||1))}`:"Menunggu harga";
}
["bIn","bOut","room","roomQty"].forEach(id=>$(id).addEventListener("change",updateSummary));
function confirmBooking(){
 if(!selected)return;
 const name=$("name").value.trim(),phone=$("phone").value.trim(),n=nights(),r=selected.rooms.find(x=>x.id==$("room").value);
 if(!name||!phone){alert("Isi nama pemesan dan nomor WhatsApp terlebih dahulu.");return}
 if(!n){alert("Pilih tanggal check-in dan check-out yang benar.");return}
 const price=r?.price_per_night,total=(price?n*price*Number($("roomQty").value||1):null);
 const proof=$("proof").files[0]?.name||"Belum dilampirkan";
 const msg=`Halo, saya ingin konfirmasi booking hotel.

Nama: ${name}
No. HP: ${phone}
Hotel: ${selected.name}
Lokasi: ${selected.city}, ${selected.province}
Check-in: ${$("bIn").value}
Check-out: ${$("bOut").value}
Jumlah malam: ${n}
Tamu: ${$("bGuests").value}
Tipe kamar: ${r?.name||"-"}
Jumlah kamar: ${$("roomQty").value}
Harga/malam: ${price?"Rp "+fmt(price):"Mohon konfirmasi"}
Total: ${total?"Rp "+fmt(total):"Mohon konfirmasi"}
Bukti pembayaran: ${proof}

Mohon konfirmasi ketersediaan kamar, harga, dan total pembayaran sebelum saya melakukan transfer.

Rekening pembayaran:
OCBC NISP
940810293248
a.n. Winda Sintia`;
 window.open(`https://wa.me/${WA}?text=${encodeURIComponent(msg)}`,"_blank");
}
$("topWa").onclick=()=>window.open(`https://wa.me/${WA}?text=${encodeURIComponent("Halo, saya ingin menanyakan booking hotel.")}`,"_blank");
window.addEventListener("click",e=>{if(e.target.id==="modal")closeModal()});
function fmt(n){return Number(n).toLocaleString("id-ID")}
function esc(s){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]))}
