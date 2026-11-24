# Chế độ: Rượt bắt tốc độ (`tag-chase`)

- **Phạm vi khu vực:** Map 01 (`quoc-hoc` · Khoa Quốc tế → Tràng Tiền) và Map 05 (`quang-trung` · 83 Nguyễn Huệ · Quang Trung → Dòng Chúa Cứu Thế).
- **Sĩ số phòng:** 1–10 người (tối thiểu **2 người** để tự động đếm ngược bắt đầu ván; khi chỉ có 1 người sẽ ở trạng thái khởi động chờ bạn).
- **Bùa tốc độ mặc định:** Bật sẵn 4 ô bùa `+10% / +20% / +30% / +100%` (phím `1–4`).

---

## 1. Luật chơi: Ấn Lửa Cố Đô (Tag & Swap · 150 giây/ván)

1. **Vòng đấu & Phân vai linh hoạt:**
   - `waiting` (1 người): Tự do chạy thử và nhặt bùa; ngay khi người thứ 2 vào phòng sẽ chuyển sang đếm ngược **4 giây**.
   - `playing` (150 giây):
     - `2–4 người`: **1 Người Săn** vs nhóm **Người Chạy**.
     - `5–10 người`: **2 Người Săn** (từ **35 giây cuối**, nếu phòng có ≥ 5 người sẽ tăng thêm **1 Người Săn** để tạo cao trào).
   - **Cân bằng tốc độ:** Người Săn có thêm **+8% tốc độ nền** (`1.08x`). Khi kích hoạt bùa tốc độ hoặc Cà Phê Muối, hệ số được nhân cộng hưởng và đồng bộ chống gian lận trên server.
2. **Chạm & Hoán đổi vai (Tag & Swap):**
   - Người Săn húc trúng Người Chạy → hai bên **bắn nảy nhẹ** tách ra (~2.6m), Người Săn ghi **+100 điểm “Cú Húc”** và **đổi vai ngay** cho người bị chạm.
   - Người vừa trở thành Người Săn có **3 giây miễn nhiễm va chạm** và khựng nhẹ 0.45s để định hướng.
3. **Điểm Nóng Hội Tụ (Hotspot · mỗi 45 giây):**
   - Mỗi 45 giây bản đồ kích hoạt 1 **Điểm Nóng Ánh Sáng** tại địa danh nổi bật trên tuyến:
     - *Map 01:* Công viên Thanh Thiếu Niên, Bia Quốc Học, UBND TP Huế, Ngã ba Lê Lợi – Trường Tiền.
     - *Map 05:* Trường Tiểu học Quang Trung, Giữa tuyến Nguyễn Huệ (BV RHM), Nhà thờ Dòng Chúa Cứu Thế.
   - Người Chạy đứng/chạy trong bán kính **28m** quanh điểm nóng nhận **x2 điểm sinh tồn** (`+20 điểm / 5s` thay vì `+10 điểm / 5s`).
4. **Combo “Thoát Hiểm Gang Tấc” (`Close Call`):**
   - Khi Người Chạy lướt vào vùng nguy hiểm `< 5.5m` gần Người Săn đang hoạt động rồi bứt ra `> 10.5m` trong vòng `3.5 giây` mà không bị chạm → cộng **`+40 × hệ số combo`** (`x1`, `x1.5`, `x2`).

---

## 2. Vũ khí vui & Tương tác kiểu Huế (Party Mechanics)

Bên cạnh 4 ô bùa tốc độ mặc định, trên đường sẽ xuất hiện **Hộp Quà Đèn Lồng** (8 hộp toàn tuyến, làm mới mỗi 28 giây). Chạy qua hộp quà sẽ nhận ngẫu nhiên 1 trong 3 vật phẩm (tối đa 2 món/loại):

| Mã | Tên vật phẩm | Phím | Hiệu ứng |
|---|---|---|---|
| `non-la-shield` | **Khiên Nón Lá** | `Q` | Tạo vòng Nón Lá bảo vệ **6 giây**. Chặn 1 lần bị Người Săn húc (đẩy ngược kẻ húc & choáng 0.8s, thưởng **+60 điểm** cho người đỡ) hoặc miễn nhiễm choáng 1 lần khi quẹt xe cộ/cảnh sát. |
| `perfume-wind` | **Gió Sông Hương** | `E` | Tung luồng gió sương bán kính **9.5m** làm đối thủ xung quanh/bám đuôi (không có khiên) **giảm 30% tốc độ trong 2 giây**. |
| `salt-coffee` | **Cà Phê Muối** | `F` | Có thể dùng **ngay cả khi đang bị choáng**. Xóa sạch trạng thái choáng + làm chậm ngay lập tức và tăng **+25% tốc độ trong 2 giây**. |

---

## 3. Tín hiệu, Giao tiếp & Co-op Toàn Phòng

- **Radar mép màn hình:** Khi Người Săn hoặc Người Chạy gần nhất nằm ngoài góc camera, mép màn hình hiện mũi tên hướng kèm khoảng cách mét (`14m`, `28m`).
- **Biểu cảm nhanh 1 chạm (Emote Bubble):** Nút `💬` mở 5 bong bóng thoại bay trên đầu nhân vật (hồi 2 giây): `"Đợi tui với!"`, `"Coi chừng!"`, `"Cà phê không?"`, `"⚡ Bứt tốc!"`, `"😂 Hụt rồi!"`.
- **Bảng Xếp Hạng Mini & Danh Hiệu Cuối Ván:** Hiển thị đồng hồ, vai trò, Top 3 điểm ngay trên HUD; hết 150s tổng kết trong 10s với 4 danh hiệu:
  - 🏆 **Vua Tốc Độ Lê Lợi / Quang Trung** (Tổng điểm cao nhất)
  - 💨 **Thánh Né Xe** (Nhiều pha *Thoát Hiểm Gang Tấc* nhất)
  - ⚡ **Thợ Săn Bùa** (Dùng nhiều bùa tốc độ & vật phẩm nhất)
  - 👒 **Nón Lá Bất Bại** (Dùng khiên chặn cú húc thành công nhiều nhất)
- **Sự kiện phối hợp toàn phòng (Co-op Event):**
  - Khoảng giữa ván (khi còn ≤ 85s và có ≥ 2 người), mở nhiệm vụ chung **45 giây** thu thập **15 vật phẩm**:
    - *Map 01:* **Thắp 15 Đèn Lồng bên Sông Hương**
    - *Map 05:* **Gom 15 Hoa Sen trước Dòng Chúa Cứu Thế**
  - Cả phòng hợp sức đủ 15/15 → **nổ pháo hoa 3D trên bầu trời Huế** và thưởng **+150 điểm đồng đội** cho tất cả!

---

## Cấu trúc tệp trong `tag-chase/`
- `constants.js` — Hằng số vòng đấu, danh mục 3 vật phẩm Huế, danh sách emote, tọa độ điểm nóng Map 01 & Map 05.
- `serverRoomState.js` — Logic phòng authoritative trên server (vai trò, hoán đổi, khiên/gió/cà phê, close-call, hotspot, co-op, bảng điểm).
- `TagChaseWorldFX.js` — Hiệu ứng 3D (Điểm nóng, Hộp Quà Đèn Lồng, Đèn Lồng/Hoa Sen Co-op, Pháo hoa 3D, Vòng Khiên Nón Lá, Bong bóng Emote trên đầu).
- `TagChaseHUD.js` — Giao diện HUD (Đồng hồ + vai trò, Top 3, Radar mép màn hình, Khay 3 vật phẩm `Q/E/F`, Emote 1 chạm, Bảng danh hiệu cuối ván).
- `tag-chase.css` — Style cho HUD Rượt bắt trên Desktop & Mobile (hỗ trợ cả màn hình dọc/ngang).
- `index.js` — Điểm kết nối vào `game-modes/registry.js`.
