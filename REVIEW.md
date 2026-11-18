# Review

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
