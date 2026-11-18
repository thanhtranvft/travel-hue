# Ga Huế – Lê Lợi – Phú Xuân, 2026-11-18

Theo yêu cầu ảnh OSM của người dùng, bổ sung museum way/240266284, HueCIT way/354775345, Thanh thiếu nhi way/118541971. Không dùng tên tiếng Anh National Museum bị gắn nhầm trên trung tâm Thanh thiếu nhi.

Bốn giao lộ Phan Bội Châu, Nguyễn Trường Tộ, Lê Lai, Hà Nội lấy từ vertex chung của đường OSM, không chia khoảng cách bằng tay. Kiểm thử dấu tích có hướng xác nhận bảo tàng bên sông, các cơ quan/trường học phía đất liền khi đi từ ga về Phú Xuân.

CorridorArchitecture.js gán mặt đứng riêng cho bảy cơ sở, giữ footprint tòa nhà, nhận diện nhà bên trong khuôn viên qua polygon. Cửa sổ, cột, màu và chiều cao thiếu tag là minh họa; chưa tái dựng đúng kiến trúc thực địa. Biển khuôn viên là nhãn nổi trên mái, không biểu thị cổng đã xác minh. Công viên và lối đi dùng polygon/polyline đã có trong snapshot, không khẳng định đã đủ mọi thảm cỏ hiện trạng.

Kiểm chứng: 3 test corridor đạt; build Vite đạt; Chromium tải cảnh có 14 địa điểm, 370 footprint, mặt đường đi được, không pageerror. Còn cần ảnh thực từng cơ sở để hoàn thiện kiến trúc, mái, cổng và sân trường.
