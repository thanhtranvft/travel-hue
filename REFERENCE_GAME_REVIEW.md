# Nghiên cứu Pelican Campus Quest — 2026-11-17

Nguồn: E:/02.Games/AI/pelican-campus-quest. Đã đọc source và chạy thử trình duyệt ngày 2026-11-17. Không sửa source game gốc; đã chạy script download-assets.mjs của project để bổ sung 16 GLB vào public/assets/glb.

## Kết quả chạy thực tế

- Phục vụ tại http://127.0.0.1:3000 bằng server thử nghiệm có mapping public/assets; không cài dependency vào project gốc.
- Chromium 1280×720, URL quality=low, đợi preloader biến mất hoàn toàn.
- Chọn 02 Lawn, chuyển Free Roam: HUD hiện Android Lawn, Chase camera, 9 MPH.
- Giữ W 2 giây rồi W+D thêm 1 giây: HUD đạt 20 MPH, ảnh cho thấy xe nghiêng/rẽ tới mép vỉa hè, camera bám sau xe.
- Chọn 05 Shore: HUD chuyển Shoreline, Auto-Pilot, 15 MPH; ảnh thể hiện xe trên cầu gỗ với lan can và bóng đổ.
- Không ghi nhận pageerror JavaScript trong lượt hoàn tất. Chưa đo FPS hoặc thử toàn bộ khu/camera/va chạm; không coi đây là kiểm định hiệu năng.
- Ảnh: tool/browser-test/original-initial.png, original-ride.png, original-shore.png. Script thử trong cùng thư mục.

Quan sát: tỷ lệ nhân vật và xe nhất quán, đường có mép/vỉa hè rõ, cảnh quan có nhiều lớp, vật liệu có chi tiết bề mặt, camera bám khá thấp và nhìn về đường phía trước. Chọn khu vực gắn với chương tour; có thể chuyển sang Free Roam để tiếp tục lái.

## Cấu trúc được xác nhận từ source

- contract.js:321–404: CAMPUS_CLIPS có id/stateKey, tên khu vực, startSec/endSec, baseSpeedMps, surfaceType, spawnX/spawnZ/spawnYaw. SET_TOUR_CLIP dùng chung action SET_STATE. Chọn khu vực gắn với chapter tour, không chỉ teleport đến tâm landmark.
- ui.js:1077–1125: minimap mở rộng có nhãn khu vực, hitbox và trạng thái khu vực đang chọn.
- game/world_nav_and_story.js:206 trở đi: waypoint theo chương; file này quản lý điều hướng và story.
- game/world_nav_and_story.js:1548–1561: tính hướng nhìn trước dựa tốc độ, góc lái, chiều dài cơ sở và góc quay dự kiến.
- core.js:5239–5268: camera chase làm mượt yaw theo thời gian (1-exp(-7.5*dt)), khoảng cách phụ thuộc tốc độ, mục tiêu nhìn phía trước xe.
- scenes/open_campus_world.js: hệ đường có roadId và thông tin mép đường; môi trường tổ chức thành phần riêng.
- assets/glb/: mô hình môi trường, landmark, cây, xe và nhân vật được đóng gói trong module GLB. Độ chi tiết không đến từ ánh sáng đơn thuần.

## Áp dụng cho Huế

1. Cấu hình khu vực riêng: id, bounds, điểm vào an toàn, hướng xe, landmark liên quan, các tuyến đường và tuyến tham quan. Landmark và khu vực là hai khái niệm khác nhau.
2. Danh sách khu vực: Bia Quốc Học/Lê Lợi; công viên bờ Nam; Trường Tiền; Trần Hưng Đạo/bờ Bắc; Kỳ Đài/Ngọ Môn. Đây là phân vùng đề xuất, ranh giới phải xác lập theo dữ liệu map.
3. Chọn khu vực có hai hành vi rõ: đến ngay và tự lái theo tuyến. Đến nơi tiếp tục đạp tự do, camera reset an toàn, minimap đồng bộ.
4. Bộ điều khiển xe: mô hình tốc độ/góc lái riêng với camera; tăng/giảm tốc và trả lái làm mượt theo dt; quay theo chiều dài cơ sở; nghiêng xe theo cua; bám mặt đường và va chạm.
5. Tự lái theo graph đường, có điểm nhìn trước và giảm tốc khi cua; tránh steering đuổi từng waypoint khiến xe chạy vòng.
6. Map thật là nguồn cho đường, sông và footprint. Mô hình kiến trúc dựng theo ảnh assets; không thay map bằng cảnh phố ngẫu nhiên.

## Thứ tự đề xuất

- Hoàn thiện một khu Bia Quốc Học–Lê Lợi: bố cục map, mặt đường, va chạm, xe/camera và đi nhanh.
- Kiểm chứng khu đầu tiên rồi thêm Trường Tiền và bờ Bắc theo cùng contract.
- Sau đó hoàn thiện Kỳ Đài–Ngọ Môn, minimap và tour xuyên khu vực.

## Giới hạn

Đã thử một phần trải nghiệm trực tiếp như ghi trên, chưa thử toàn bộ game. Chưa chuyển/copy tài sản từ ổ E sang bản Huế. Dữ liệu OSM thật của Huế vẫn chưa tải được ở lần trước (406/429), nên chưa thể khẳng định bố cục hiện tại đúng địa lý.
