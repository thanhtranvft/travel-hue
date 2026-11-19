# Handoff

## Kiến trúc MVP, lazy loading và mobile — 2026-11-19

Hướng dẫn hiện hành: [ARCHITECTURE.md](ARCHITECTURE.md). Entry: `src/main.js` → `src/app/GamePresenter.js`. Code chung ở `src/core/`, từng khu ở `src/modules/areas/<id>/`, tài nguyên ở `src/assets/`. Các đường dẫn source trong ghi chép cũ bên dưới có thể đã chuyển; dùng cấu trúc mới trong ARCHITECTURE.md.

Danh sách nhạc/khu duy nhất: `src/data/app-config.json`. `enabled: false` hoặc `disabled: true` ẩn và ngăn tải; production cần build lại. Chọn khu chỉ tải dữ liệu khu đó, giới hạn di chuyển, giải phóng scene trước khi chuyển xong. Tối ưu mobile bằng instancing, batching, culling, DPR và cập nhật theo khoảng cách.

Kiểm chứng: 63/63 unit test, production build, chuyển 5 khu/quay lại, tắt cấu hình, hai tay mobile và hai MP3 local đều đạt. Profile cảnh khởi đầu trên Chromium mô phỏng mobile khoảng 92 → 7 ms/frame; chưa đo điện thoại thật.

## Sửa cách diễn giải vị trí OSM — 2026-11-18

Không yêu cầu người dùng cung cấp lại tọa độ. Đã lấy thêm cổng/đèn không tên từ OSM, dùng node entrance=main cho Ga và barrier=gate cho Quốc Học. Tách điểm/cổng được map với nhãn khuôn viên chưa xác nhận cổng; sửa centroid bệnh viện nhiều vùng và lấy đèn từ node thay cho offset thủ công. Đường nhánh trong bounds đã được đưa vào scene. Nút Đối chiếu OSM mở vị trí xe trực tiếp trên nguồn.

Kiểm toán và ID xem src/geography/README.md. 23/23 unit test; production /assets/index-C-4KKLUK.js không lỗi asset/JS; 5 tour đi đến cuối. Kiến trúc/chiều rộng thiếu tag/cao độ/cây vẫn là ước lượng, không tuyên bố đã tái hiện đúng hiện trạng toàn bộ.

## Chuyển sang tuyến GPS/OSM thật — 2026-11-18

Entry hiện dùng GeographicWorld, GeographicTraffic và geoDistricts (src/geography/map.js). Snapshot OSM 7.423 đối tượng đã tải thành công, dùng offline. Đường/sông/footprint/biển và minimap dùng chung phép chiếu từ GPS; không còn dùng bố cục hai đường thẳng prototype trong luồng chính.

Lê Lợi từ phía ga tới Hà Nội/đầu Phú Xuân khoảng 1,16 km. Có biển Ga Huế, Quốc Học, Bia Quốc Học, Hai Bà Trưng, UBND, bệnh viện, Phú Xuân, Gỗ Lim, Trường Tiền, Kỳ Đài, Ngọ Môn; cùng biển giao Lê Lợi × Hà Nội và cột đèn minh họa. Các tuyến bờ Bắc/cầu/Hoàng thành cũng lấy từ đường OSM. Footprint 370 công trình, cây và mặt đứng dựng ước lượng.

Đọc src/geography/README.md để biết ID, nguồn, giới hạn và cách bổ sung. Dữ liệu tọa độ không đồng nghĩa mô hình kiến trúc chính xác; chiều rộng thiếu tag, cao độ, cây/cổng/mặt đứng và đèn vẫn là ước lượng. Không đánh dấu toàn bộ ý tưởng hoàn tất.

Kiểm chứng: 19/19 unit test, build thành công. 5 tour địa lý chạy đến đích (tắt traffic để kiểm hình học), production smoke audio/mobile và CDP two-thumb đều đạt. Ảnh hue-osm-station.png và hue-osm-quoc-hoc.png. Các script kiểm thử prototype cũ có vị trí/hành trình ngắn không còn đại diện cho world mới; dùng inspect-geography.mjs và inspect-production.mjs.

## Điều khiển hai tay trên điện thoại — 2026-11-17

- Thay D-pad bằng joystick analog bên trái. Kéo lên để đạp, chéo/ngang để vừa đạp vừa cua, kéo xuống để lùi. Có deadzone, giới hạn độ kéo; thả cần thì ngừng đạp và xe trôi theo quán tính.
- Tay phải vuốt pad Vuốt nhìn để xoay camera; nút Phanh riêng bên phải. Vẫn có thể kéo trực tiếp trên cảnh và dùng WASD/Space trên desktop.
- TouchControls quản lý pointerId độc lập cho cần lái/camera/phanh, pointer capture khi kéo ngoài pad, nhả theo pointerup/cancel/lostcapture, reset khi blur/ẩn trang/chuyển khu vực. Không để thả tay này xóa input của tay kia.
- Chặn user-select, WebKit touch-callout, selectstart/contextmenu trên vùng chơi và điều khiển; giữ input âm lượng hoạt động. Bố trí minimap lên trên tay trái và tốc độ giữa hai tay.
- Kiểm chứng: 14/14 unit test, build thành công. Chromium multi-touch thật qua CDP trên dev và dist: hai ngón đồng thời, analog throttle/steer và camera yaw đều đổi, thả trái vẫn xoay phải, không chọn chữ khi giữ >1 giây, kéo vượt pad/cancel/blur nhả đúng, phanh về 0. Portrait không tràn, minimap không đè joystick. Chưa thử bằng thiết bị Android/iOS vật lý.
- npm run test:production đạt trên bundle /assets/index-CnyxMH4y.js; menu/nhạc/nhạc quán/mute vẫn đạt, không pageerror/asset lỗi.
- Script: node tool/browser-test/inspect-two-thumb.mjs http://127.0.0.1:4173/; ảnh two-thumb-production.png.

## Sửa entry mobile/audio và kiểm chứng production — 2026-11-17

Nguyên nhân đã xác nhận: main.js/CityGame/styles/viewport đang ở bản trước tích hợp, dù MobileUI và CityAudio vẫn có trên đĩa. Unit test module riêng không phát hiện được việc không nối chúng vào app. Đã khôi phục import/khởi tạo MobileUI và CityAudio, nối update/collision âm thanh, bổ sung markup điều khiển và tách CSS mobile vào src/mobile.css.

Giữ nguyên dev host 0.0.0.0 và port 3000 hiện có. Chạy bản dist bằng `npm run preview` tại port 4173. Mở từ điện thoại cùng mạng bằng địa chỉ Network do Vite in ra; AudioContext cần thao tác Bật nhạc và môi trường trình duyệt cho phép. Khóa ngang tùy khả năng trình duyệt.

Kiểm chứng cuối: npm test đạt 12/12, npm run build thành công (33 module). `npm run test:production` đạt trên http://127.0.0.1:4173, xác minh entry /assets/index-*.js, menu mobile/desktop, layout ngang, fallback xoay màn hình, AudioContext running và tín hiệu RMS > 0 sau nhấn bật, nhạc quán gần/xa và mute suspended. Không pageerror, không asset JS/CSS/GLB lỗi. Test này chỉ thao tác bundle thực, không import src/main.js trong production.

Để chạy lại: `npm run build`, `npm run preview` ở terminal thứ nhất; `npm run test:production` ở terminal thứ hai. Script dùng Chromium ở đường dẫn máy hiện tại; có thể đặt CHROME_PATH và TEST_BASE_URL để thay đổi. Ảnh: tool/browser-test/production-mobile-portrait.png và production-mobile-landscape.png.

## Đường rộng và giao thông — 2026-11-17

- Đường chính rộng 14 m (trước 6 m), hai chiều xe chạy riêng; vỉa hè 5 m. Dời tuyến, quán/nhà, cây và vị trí landmark theo cùng bố cục mở rộng; không đổi kiến trúc các landmark khác.
- Trường Tiền rộng 16 m (trước 7 m), dài 48 m (trước 31 m), mặt cầu cao 2.18 m; vòm cao thêm 5.2 m, hai đường dốc dài 10 m nối liên tục với mặt đường. Lối đi bộ hai bên tách khỏi làn xe. Đây là kích thước gameplay prototype, không phải số đo cầu thật.
- Thông số chung: src/world/cityLayout.js. Chỗ đặt landmark trong DetailedWorld, tuyến/spawn trong districts.js, giao thông trong TrafficSystem.
- 12 mặt tiền quán ăn/cà phê/nhà hàng, mái hiên sọc, bàn ghế, bát ăn và khách ngồi. Nội dung mang không khí Huế, chưa phải cơ sở kinh doanh thực tế đã xác minh.
- 10 ô tô, 4 xe máy, 20 người đi bộ chuyển động. Ô tô GLB; xe máy/người dựng hình học. Xe theo làn, giữ khoảng cách đơn giản; tour giảm tốc khi thấy NPC phía trước. Khi đến khu vực mới dọn NPC gần spawn và có thời gian miễn va chạm ngắn.
- Va chạm dùng kiểm tra quét tương đối giữa hai bước mô phỏng, có lọc chênh cao. Khi tông: xe dừng, ngắt tự lái, rung/ngiêng nhẹ, vòng sáng và tia va chạm, cảnh báo 4 giây nhắc đi phải và cẩn thận; sau phục hồi đạp tiếp. Cooldown tránh báo liên tục. Đây là hiệu ứng arcade, không phải mô phỏng tai nạn rigid-body hoặc luật giao thông đầy đủ.
- Kiểm chứng: 9/9 unit test; browser có đủ NPC, xe chuyển động, cảnh báo hiển thị thực tế, xe dừng/không báo lặp và phục hồi được. Cả 5 tour hoàn thành với giao thông hoạt động; desktop/mobile vẫn đạt, không pageerror.
- Ảnh: tool/browser-test/hue-street-life.png, hue-wide-bridge.png, hue-traffic-collision.png. Script: inspect-traffic.mjs.

## Gameplay theo khu vực — 2026-11-17

- Entry dùng CityGame, TouringBike, BicycleMotion và DetailedWorld. Không còn dựng hai world qua ScenicGame trong luồng chạy chính.
- Năm khu vực độc lập đặt trong src/routes/districts.js: Quốc Học/Lê Lợi, công viên bờ Nam, Trường Tiền, Trần Hưng Đạo/bờ Bắc, Kỳ Đài/Ngọ Môn.
- Chọn khu vực để đến ngay; nút Tham quan khởi hành từ đầu tuyến của khu vực đó. Đến cuối tuyến xe dừng; WASD/Space giành quyền điều khiển tự do.
- Xe chạy bước cố định 120 Hz, trả lái/tăng tốc mượt, phanh, nghiêng theo cua. Camera bám theo thời gian và nhìn trước; có kiểm tra vật cản camera.
- Có giới hạn mặt nước, footprint vật cản, cao độ mặt cầu và dốc xuống bờ Bắc. Đây là va chạm đơn giản theo footprint, chưa phải rigid-body physics.
- Minimap là sơ đồ của world hiện tại, không phải bản đồ GPS. Phóng to bằng M hoặc nút trên bản đồ.
- Xe đạp và cây GLB tải từ Google GStatic; nguồn ghi tại src/assets/models/SOURCES.md. Có mô hình dự phòng khi tải asset thất bại. Cây là broadleaf demo, chưa phải bộ cây bản địa Huế.

## Chạy local

```bash
npm install
npm run dev
```

## Kiểm tra

```bash
npm test
npm run build
```

## Điều khiển

- `W/S` hoặc mũi tên lên/xuống: tiến/lùi.
- `A/D` hoặc mũi tên trái/phải: rẽ.
- Kéo chuột: xoay camera.
- `Space`: phanh.
- `T`: bật/tắt tự lái tham quan khu vực đang chọn.
- `M`: mở rộng/thu nhỏ minimap.
- `R`: về đầu khu vực hiện tại.
- Trên mobile: joystick bên trái để đạp/rẽ/lùi, vùng vuốt camera và nút phanh bên phải.

## Mở rộng địa điểm

Tạo thư mục mới trong `src/landmarks`, export module gồm `id`, `title`, `position`, `radius`, `description`, `create`, rồi đăng ký tại `src/landmarks/registry.js`. Không sửa module địa điểm cũ.

Thêm khu vực bằng một cấu hình mới trong src/routes/districts.js gồm id/title/subtitle/color/spawn/path/landmarks. Kiểm tra spawn và toàn tuyến tránh footprint; bảng khu vực và minimap tự đọc cấu hình. Tuyến hiện dùng spline trong từng khu, chưa có định tuyến graph đường giữa mọi cặp địa điểm.

## Giới hạn hiện tại

Bố cục và tỷ lệ vẫn là prototype, chưa nhập OSM/GPS. Ba landmark được dựng hình học dựa ảnh tham khảo; chưa đạt mô hình kiến trúc đo đạc hoặc chất lượng tổng thể của game gốc. Chưa có âm thanh. Trạng thái ý tưởng tiếp tục Implementing cho tới khi hoàn thành yêu cầu thành phố thật.

## Kết quả kiểm tra

- `npm test`: đạt 9/9, gồm tăng tốc/phanh, độ ổn định giữa 60/120 Hz, trả lái, khu vực, registry, va chạm liên tục và dốc cầu.
- Playwright/Chromium: chọn đủ 5 khu vực, tốc độ đạp tay đạt 20 km/h trong ca thử, phanh về 0, tự lái trên cầu, WASD giành lại điều khiển, GLB tải đủ, mobile 390×844 không tràn ngang; không có pageerror.
- Chạy chính bộ mô phỏng game ở fixed step: cả 5 tuyến tự lái đến cuối và dừng thành công.
- Ảnh kiểm chứng: tool/browser-test/hue-city-initial.png, hue-city-bridge.png, hue-city-mobile.png. Script: node tool/browser-test/inspect-hue.mjs (cần dev server port 5173 và Chromium ở đường dẫn cấu hình trong script).
