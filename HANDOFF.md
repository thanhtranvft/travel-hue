# Handoff

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
- Trên mobile: các nút chạm tiến/lùi/rẽ/phanh ở cạnh dưới.

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
