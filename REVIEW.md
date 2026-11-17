# Review

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
