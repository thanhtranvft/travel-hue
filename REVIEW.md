# Review

## Hướng trải nghiệm Huế — thống nhất 2026-11-24

Người dùng xác định “vừa khám phá vừa tranh tài”, tôn vinh vẻ đẹp và bản sắc Huế là chính; game bổ sung kịch tính và tránh nhàm chán. Đã đồng ý hướng “Dạo phố Huế có cuộc chơi”. Quyết định này thay thế đề xuất thu hẹp bản đồ thành đấu trường sau playtest.

Giữ không gian thành phố rộng; dùng điểm hẹn theo địa danh gần nhóm để dẫn hành trình, các đợt rượt bắt ngắn xen thời gian dạo chơi và hoạt động hợp tác. Thành tích bao gồm khám phá và đóng góp tập thể, không chỉ bắt đối thủ. Thông tin văn hóa gọn, có thể mở đọc khi muốn; không tự gán chuyện lịch sử hoặc ý nghĩa văn hóa chưa có nguồn cho vật phẩm.

“Ok đồng ý” xác nhận định hướng, chưa phải yêu cầu sửa source theo quy tắc project. Phạm vi kỹ thuật đề xuất được ghi trong PLAN.md; chưa chốt thời lượng từng giai đoạn hoặc hệ số điểm.

## Chơi thử Rượt bắt tốc độ — 2026-11-24

Đã chơi qua giao diện bằng hai phiên Chromium ở hai khu hỗ trợ, theo dõi vòng 150 giây/tổng kết, thực hiện đổi vai và kích hoạt bùa +100% bằng cảm ứng. Nhận xét chính: mục tiêu xa làm loãng trận ít người; HUD văn hóa/lời rao cạnh tranh với HUD chiến đấu trên mobile; cần thử cân bằng phương tiện và điểm sống sót. Chi tiết, ảnh và giới hạn phương pháp trong [PLAYTEST-2026-11-24.md](PLAYTEST-2026-11-24.md). Các đề xuất là phạm vi review, chưa được duyệt sửa gameplay.

## Online nhỏ, giữ cấu trúc — 2026-11-19

Khả thi với một phòng chung 10 người. Google AI Studio hỗ trợ backend Node/full-stack; không chỉ thêm giao diện mà cần server WebSocket thực. Người dùng đã chọn nhập tên rồi Khám phá/Online và yêu cầu ít thay đổi cấu trúc; xác nhận triển khai sau review. Quyết định dùng WebSocket qua `ws` và adapter riêng thay vì chuyển engine hoặc áp framework multiplayer toàn bộ.

Giữ lazy loading theo khu; chỉ render/va chạm người cùng khu. Server giữ sức chứa và kết quả va chạm; client giữ chuyển động với kiểm tra giới hạn phía server. Đánh đổi: NPC chưa đồng bộ và chưa có mô phỏng authoritative đầy đủ. Phòng trong RAM đòi hỏi một instance/revision; restart mất phiên. Chỉ coi là bản online MVP, không suy ra chất lượng WAN/điện thoại từ hai tab local. Chi tiết [ONLINE.md](ONLINE.md).

## Sửa diễn giải dữ liệu OSM — 2026-11-18

Phản hồi người dùng: dữ liệu có sẵn trên OSM, không cần yêu cầu họ gửi bản đồ nguồn khác. Đã kiểm tra trực tiếp map và bổ sung node không tên. Lỗi thực có ở anchor Ga, centroid multipolygon bệnh viện, đèn đặt offset và lớp đường chọn thiếu. Tọa độ cổng Quốc Học cũ khớp node thật; giữ nguyên thay vì nhận định mọi điểm đều sai. Cổng chưa map rõ phải để trạng thái area-only, không đoán từ đỉnh gần đường. Các test trước chỉ xác nhận tự nhất quán, không chứng minh hiện trạng kiến trúc.

## Dữ liệu địa lý — 2026-11-18

Đã vượt qua trở ngại tải OSM và lấy snapshot thật. Quyết định: không điều chỉnh tuyến bằng tọa độ prototype; dùng polyline, khuôn viên và POI OSM cùng một phép chiếu, gắn nguồn cho từng điểm. Dùng ba đoạn đi bộ nối nhau thay vì nhầm đoạn có tên Ironwood là toàn bộ tuyến. Kiến trúc/cao độ/độ rộng thiếu tag vẫn phải ghi là ước lượng, không dùng kết quả kiểm thử phần mềm thay cho kiểm định bản đồ thực địa.

## Giao thông đô thị — 2026-11-17

Mở rộng mặt đường và cầu trước khi thêm NPC để tránh giao thông vào bố cục quá hẹp. Chia làn theo hướng, giữ khoảng cách đơn giản, tour quan sát vật cản; người chơi đi ngược vẫn có thể tông xe và nhận cảnh báo. Kích thước hiện phục vụ gameplay, chưa khẳng định đúng tỉ lệ MAP. Va chạm arcade có cooldown/phục hồi, không giả làm mô hình vật lý tai nạn thực tế.

## Gameplay tương tự game gốc — 2026-11-17

Đã chạy game gốc và xác nhận: chọn khu vực gắn với tour, đạp tự do dùng chase camera, tỷ lệ asset và chất liệu bề mặt quan trọng hơn việc chỉ thêm ánh sáng. Đã áp dụng cơ chế này cho bản Huế, thêm 5 cấu hình khu và giữ landmark module hóa. Kết quả: 5/5 unit test, thao tác browser và cả 5 tuyến tự lái đều đạt. Không suy ra bản đồ Huế chính xác từ việc gameplay hoạt động.

## Điều chỉnh 2026-11-17

Ảnh assets cho thấy mô hình prototype sai cấu trúc: Bia Quốc Học không phải cột đỏ, Ngọ Môn có hệ cổng và nhiều mái, Trường Tiền cần vòm/giằng thép. Đã sửa 3 module theo ảnh. Thành phố cách điệu không đáp ứng yêu cầu người dùng; cần đổi nguồn hình học thế giới sang dữ liệu bản đồ và đối chiếu địa lý trước khi hoàn tất.

## Kết luận

Tiếp tục với vertical slice nhỏ thay vì dựng toàn Huế. Bản đầu ưu tiên cảm giác di chuyển, tuyến tham quan và kiến trúc mở rộng.

## Điểm mạnh

- Chủ đề và tuyến trải nghiệm có bản sắc rõ.
- Phạm vi đủ nhỏ để kiểm chứng trên web/mobile.
- Landmark module hóa cho phép nâng cấp độc lập.

## Rủi ro

- OSM không có mô hình kiến trúc chi tiết; landmark cần dựng tay.
- Asset nặng ảnh hưởng mobile và giới hạn triển khai.
- Tọa độ hiện tại là bố cục cách điệu, chưa phải GPS/OSM chính xác.

## Quyết định

- 2026-11-17: Duyệt tuyến Bia Quốc Học → Lê Lợi → Cầu Trường Tiền → Đại Nội.
- 2026-11-17: Mỗi địa điểm là module độc lập; bổ sung địa điểm không được phá địa điểm cũ.
