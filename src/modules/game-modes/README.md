# Kiến trúc Chế độ chơi (Game Modes)

Thư mục `src/modules/game-modes/` quản lý toàn bộ các chế độ chơi nhiều người theo cấu trúc tách biệt, độc lập giữa logic vòng đấu, giao diện HUD và đồng bộ máy chủ.

## Quy tắc thiết kế cốt lõi (Hướng 2)
1. **Chế độ mặc định (`free-roam` — Dạo phố tự do):** Mở sẵn trên cả 5 khu vực (`quoc-hoc`, `south-bank`, `truong-tien`, `nguyen-chi-dieu`, `quang-trung`).
2. **Phòng chế độ đặc biệt (tối đa 1–2 phòng / khu trọng điểm):** Chỉ mở chủ yếu tại 2 map lớn:
   - **Map 01 (`quoc-hoc`)**: *Khoa Quốc tế → Tràng Tiền*
   - **Map 05 (`quang-trung`)**: *83 Nguyễn Huệ · Quang Trung → Dòng Chúa Cứu Thế*
   - Các map 02, 03, 04 giữ vai trò tuyến tham quan dạo phố tự do.
3. **Bùa tốc độ mặc định:** Mọi chế độ đều bật sẵn cơ chế nhặt & kích hoạt bùa tốc độ (`+10% / +20% / +30% / +100%`) thông qua `charmsEnabled: true`.
4. **Cô lập phòng theo `(region, gameMode)`:**
   - `roomKeyFor(regionId, gameModeId)` trả về `regionId` cho `free-roam` và `"${regionId}::${gameModeId}"` cho chế độ đặc biệt.
   - Mỗi phòng có tối đa **10 người chơi**, bộ vật phẩm bùa tốc độ, va chạm và trạng thái vòng đấu riêng biệt.
   - Server kiểm soát thêm trần tổng người chơi (`maxTotalPlayers` trong `src/data/online-config.json`).

## Danh sách thư mục chế độ
- `free-roam/` — Dạo phố tự do (mặc định).
- `tag-chase/` — **Hành trình Huế — Khám phá & tranh tài** (Map 01 & Map 05, đã kích hoạt). Xem chi tiết tại `tag-chase/README.md`.
- `checkpoint-race/` — **Đua Check-point Cố Đô** (Map 01 & Map 05, đang chuẩn bị mở).
- `registry.js` — Danh mục, kiểm tra vùng hợp lệ (`cleanGameModeId`, `getModesForRegion`, `roomKeyFor`).
- `GameModeController.js` — Bộ điều phối vòng đời phía Client gắn vào `GamePresenter`.

## Vòng đời tích hợp (Client ↔ Server)
- **Client (`GameModeController`)**:
  - `activate(modeId, regionId)`: khởi tạo `modeDef.createClientSession(game)`.
  - `update(dt, elapsed)`: cập nhật HUD, radar, hiệu ứng 3D từng frame.
  - `onServerEvent(message)`: nhận `mode_event` từ WebSocket.
  - `onSnapshot(snapshot)` / `speedMultiplier` / `handleTrafficContact(...)`: đồng bộ trạng thái người chơi khác, tốc độ và miễn nhiễm va chạm.
  - `dispose()`: dọn toàn bộ DOM HUD, sự kiện bàn phím và object Three.js khi rời phòng.
- **Server (`Room.modeStates`)**:
  - `createServerRoomState(room, roomKey)` trả về `{ tick, onJoin, onLeave, onCollision, onAction, onCharmUsed, speedMultiplierFor, publicPlayerData, publicSummary }`.
  - Gửi tin nhắn đồng bộ qua `room.publishToRoom(roomKey, { type: "mode_event", ... })`.
