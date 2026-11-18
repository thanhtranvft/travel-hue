# Plan

## Tuyến đường thực tế theo tọa độ — 2026-11-18

Người dùng yêu cầu trục Ga Huế–Lê Lợi theo đúng bờ sông và thứ tự Quốc Học/Bia, Hai Bà Trưng, UBND, bệnh viện, Phú Xuân/Hà Nội, biển từng địa điểm và tương tự các tuyến khác. Đã lấy được OSM thật, thay lớp world/traffic/district trong entry bằng dữ liệu GPS chung; thêm biển 11 địa điểm, giao lộ và đèn minh họa. Đã kiểm vị trí đối diện, thứ tự dọc tuyến, 5 tuyến OSM, production/mobile/nhạc/hai tay. Còn mô hình kiến trúc chi tiết, khảo sát cao độ và giao thông theo luật đầy đủ.

## Mở rộng cầu/đường và sinh hoạt đô thị — 2026-11-17

Người dùng xác nhận trực tiếp 5 hạng mục: cầu lớn/rộng/cao, đường rộng, quán ăn/nhà hàng nhộn nhịp, NPC người/ô tô/xe máy, hiệu ứng tông xe và cảnh báo. Đã triển khai trong các module cityLayout, StreetLife, People, TrafficSystem và collision; giữ nội dung kiến trúc landmark độc lập. Đã chạy 9 unit test và browser test va chạm/phục hồi, desktop/mobile, 5 tour có giao thông. Phạm vi gameplay này hoàn thành; yêu cầu bản đồ thật toàn bộ Huế vẫn còn.

## Áp dụng gameplay game gốc — 2026-11-17

Được xác nhận bằng tin nhắn “hãy áp dụng tương tự cho game Cún con đi dạo thành phố Huế” sau khi đã chạy thử Pelican Campus Quest.

Đã triển khai: 5 khu vực theo cấu hình, đến ngay, tour riêng, đạp tự do, minimap, vật liệu mặt đường/vỉa hè, xe/cây GLB, bộ điều khiển xe fixed-step, chase camera và va chạm cơ bản. Đã kiểm chứng unit test và thao tác trình duyệt; 5 tuyến tour chạy hết và dừng xe. Dữ liệu địa lý thật và hoàn thiện kiến trúc vẫn còn, nên không đánh dấu toàn ý tưởng Implemented.

## Yêu cầu thành phố thật — 2026-11-17

Người dùng xác định đây là game trải nghiệm thành phố thật, bố cục phải theo MAP và mô hình tham khảo ảnh trong src/assets. Phạm vi này thay thế hướng cảnh quan cách điệu. Đã xem 3 ảnh và sửa hình thái 3 landmark. Phần bản đồ chưa hoàn thành: Overpass trả 406/429, API OSM trực tiếp trả 429; cần dữ liệu OSM/GeoJSON hợp lệ trước khi thay tọa độ, đường và bờ sông. Không coi scene hiện tại là bản đồ thật.

## Mở rộng được duyệt 2026-11-17

Người dùng yêu cầu nâng đồ họa tương tự ảnh tham chiếu và chọn điểm để đến nhanh; đã xác nhận tiếp tục nhiều lần. Đã bổ sung cảnh quan cố định, vật liệu/ánh sáng và bảng dịch chuyển. Còn lại: đối chiếu bản đồ/ảnh thực tế, nâng mô hình từng landmark, kiểm tra trực quan và hiệu năng. Chưa coi phần tái hiện không gian thật là hoàn tất.

## Phạm vi được duyệt

- Web 3D chạy bằng Three.js/Vite.
- Điều khiển WASD/mũi tên, camera kéo chuột, Space phanh, T tự lái, M minimap và R về đầu khu.
- Môi trường cách điệu hai bờ sông Hương.
- Bốn landmark: Bia Quốc Học, Cầu Trường Tiền, Kỳ Đài, Ngọ Môn.
- HUD, checkpoint và bảng thông tin văn hóa.
- Kiến trúc registry/module để thêm địa điểm độc lập.

## Ngoài phạm vi

- Phạm vi ban đầu chưa có OSM/GPS chính xác; yêu cầu thành phố thật sau đó đã mở rộng phạm vi này và hiện chưa hoàn thành. Âm nhạc Lyria, vật lý Rapier, multiplayer và phát hành Google AI Studio vẫn hoãn.

## Xác nhận

- Người dùng gửi `/implement idea 3` ngày 2026-11-17 sau khi thống nhất phạm vi và yêu cầu module hóa.

## Kiểm chứng

- Unit test registry landmark.
- Vite production build.
