# BookingHotel Pro v2

Versi lanjutan dengan:
- desain modern seperti mockup
- 39 hotel nyata
- pencarian kota
- tanggal check-in/out
- jumlah tamu
- pilih tipe kamar
- jumlah kamar
- perhitungan jumlah malam dan total otomatis BILA harga tersedia
- rekening pembayaran
- WhatsApp konfirmasi otomatis
- input bukti pembayaran (nama file dibawa ke pesan; pelanggan tetap harus melampirkan file di WhatsApp)
- responsive untuk HP

Pembayaran:
OCBC NISP
940810293248
a.n. Winda Sintia
WhatsApp: 089682892974

PENTING:
Harga kamar di hotels.json sengaja bernilai null agar tidak mengarang harga. Untuk menampilkan harga nyata, isi price_per_night dari data yang kamu punya/berizin atau hubungkan ke API/partner inventori hotel. Ketersediaan real-time juga membutuhkan API/partner.

Foto saat ini adalah foto hotel/travel generik dari Unsplash untuk tampilan UI, bukan klaim foto resmi masing-masing properti. Untuk produksi, gunakan foto yang kamu punya izin untuk dipakai.

## Diskon 20%
Website menampilkan harga dasar yang sudah dikonfigurasi per hotel/tipe kamar dan otomatis menghitung **potongan 20%**.
Harga pada file ini adalah harga awal yang dimasukkan untuk kebutuhan tampilan/operasional dan **bukan harga live/resmi hotel**. Untuk penggunaan produksi, ganti `price_per_night` dengan harga yang benar/berizin atau hubungkan API hotel.
