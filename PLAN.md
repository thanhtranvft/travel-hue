# Plan

## Khám phá Huế kết hợp tranh tài — đề xuất 2026-11-24

**Đã duyệt triển khai bằng `/implement idea 3` ngày 2026-11-24; đã triển khai nhóm gameplay này.** Giữ Huế và khám phá thành phố là trọng tâm. Hai bản đồ hiện có không đổi bố cục.

Kết quả: nhịp khám phá 60s → tranh tài 45s → hợp tác 45s (thêm 1,5s cho mỗi người vượt quá 2); điểm hẹn chọn theo nhóm trên đường OSM; điểm ghé một lần/địa danh/ván và thành tích riêng. Hợp tác 2 món/người, tối thiểu 4, tối đa 15, giảm nếu đường hợp lệ không đủ điểm. HUD và vật phẩm theo giai đoạn; văn hóa mở theo nhu cầu. JSON tại `src/modules/game-modes/tag-chase/journey-config.json`.

Đã qua 23 kiểm thử liên quan (nhịp vòng, chống điểm lặp/đứng yên, 2/10 người, OSM hai khu, va chạm, online và reconnect). Production build thành công. Hai trình duyệt xác nhận HUD khám phá/hợp tác và điều khiển cảm ứng. Chưa kiểm chứng độ cân bằng với 10 người thật hoặc hiệu năng điện thoại thật; thời lượng/thang điểm là thiết lập thử nghiệm để lấy phản hồi.

Phạm vi triển khai đề xuất cho module `tag-chase` tại hai khu đang hỗ trợ:

1. Nhịp vòng chơi có giai đoạn khám phá/đến điểm hẹn, rượt bắt ngắn và hoạt động hợp tác. Thời lượng, khoảng cách mục tiêu, sĩ số và thang điểm cấu hình tại dữ liệu riêng của chế độ. Giữ toàn bản đồ có thể đi lại; điểm hẹn lấy từ địa danh/cổng/lối tiếp cận hợp lệ gần nhóm, không dịch chuyển người chơi hay đổi tọa độ công trình.
2. Theo dõi lượt ghé các địa danh riêng biệt và đóng góp nhiệm vụ chung; thưởng mỗi địa danh một lần trong vòng để tránh đứng yên hoặc đi qua lại kiếm điểm. Hiển thị thành tích khám phá, bạn đồng hành và rượt bắt riêng, cùng đóng góp vào tổng kết. Số món/nhiệm vụ và thời gian dựa trên sĩ số; không yêu cầu cứng 15 món với mọi phòng.
3. HUD theo giai đoạn: gợi ý điểm đến và thông tin văn hóa mở theo nhu cầu lúc khám phá; làm rõ vai trò và điều khiển khi bắt đầu rượt bắt. Thẻ di tích và lời rao không che hướng đi; giữ âm thanh Huế theo công tắc người dùng. Cấu trúc core/khu vực hiện tại được giữ; thay đổi tập trung trong game-modes/tag-chase và điểm nối liên quan.

File/module dự kiến: `tag-chase/constants.js`, `serverRoomState.js`, `index.js`, `TagChaseHUD.js`, `TagChaseWorldFX.js`, `tag-chase.css`; bổ sung JSON cấu hình điểm hẹn/luật chơi tại module và tests liên quan. Không cần thêm thư viện. Các danh hiệu và nhiệm vụ phải diễn đạt trung tính khi chưa có nguồn văn hóa xác thực.

Kiểm chứng dự kiến: hai client cùng giai đoạn/vai trò/điểm; khách ghé địa danh không phải va vào tòa nhà; không thưởng lặp khi đứng yên; nhiệm vụ khả thi với 2 người và tăng theo sĩ số; không phá phòng free-roam, chuyển khu hoặc dữ liệu công trình; đọc được HUD mobile khi vừa đi vừa dùng vật phẩm. Chơi thử lại cùng người dùng trước khi chốt thời lượng và hệ số điểm.

Ngoài phạm vi: dựng lại bản đồ/công trình, thu map thành đấu trường, thêm hệ tài khoản hoặc phát hành public. Những con số trong playtest trước là giả thuyết thử nghiệm, chưa phải thông số được duyệt.

## Ga Huế, cảnh sát và âm thanh — xác nhận trực tiếp 2026-11-19

Người dùng yêu cầu nâng tên áo, xuất phát tại cổng ga có tàu phía sau và Cầu Ga nối sang Lê Lợi; bổ sung tuần tra xe máy hai cảnh sát và hai file WAV được chỉ định; nhạc bật mặc định, âm thanh va chạm độc lập nhạc, thêm master bật/tắt toàn bộ. Đã triển khai trong module ga riêng, traffic/audio và UI hiện có. Không đổi tên/mã hay tọa độ địa điểm phía sau ga; giữ danh sách khu bị tắt. Kết quả và giới hạn mô phỏng trong HANDOFF.md.

## Hai chế độ Khám phá/Online — xác nhận 2026-11-19

Người dùng xác nhận bằng “hãy bắt đầu sửa code” sau review luồng nhập tên → Khám phá hoặc Online tối đa 10 người, tên trên áo, gặp/va chạm cùng khu và giữ cấu trúc hiện hành. Triển khai additive qua UI/identity/network mới và `server/`; dependency Node duy nhất `ws`. Một phòng chung, chưa nhiều phòng hay tài khoản.

Giữ mô phỏng xe cục bộ để hạn chế xáo trộn; server kiểm tra chuyển động/khu và quyết định va chạm giữa người chơi. NPC vẫn cục bộ, không nhận là thành phố đồng bộ hoàn toàn. Cách chạy, cấu hình triển khai một instance, kiểm thử và giới hạn trong [ONLINE.md](ONLINE.md). Chưa publish public và chưa xác minh trên 10 thiết bị thật.

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
