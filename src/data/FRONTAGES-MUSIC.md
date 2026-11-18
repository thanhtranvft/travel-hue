# Mặt tiền Lê Lợi và danh sách nhạc — 2026-11-18

Yêu cầu: tường không lùi sâu so với hai trường, cổng hướng Lê Lợi, nhiều nhạc không lời để chọn.

`tool/align-le-loi-frontages.mjs` lấy hai mép khuôn viên trường làm tham chiếu khoảng lùi trung bình 10.66 m so với tim đường OSM, mở mặt tiền các khu đất hàng trước ra đường. 68 khuôn viên đủ chỗ có `frontage` và cổng trên ranh giới. Nhà bị công trình khác che phía trước/không có điểm cổng an toàn không bị kéo lối đi xuyên nhà. Ranh giới trước sửa giữ ở `originalRings`; đây là bố cục mô phỏng, không phải chỉnh sửa thửa đất OSM. Cổng tránh footprint, giới hạn bản đồ và có khoảng thông qua rào lân cận. Cổng trường giữ vị trí đã xử lý trước.

`music-tracks.json`: bốn giai điệu không lời tự tạo bằng WebAudio, tên Chiều bên sông Hương, Mưa nhẹ xứ Huế, Sớm mai Đại Nội, Đêm cầu Tràng Tiền. Chúng không phải bản thu/bản chép ca khúc Huế có sẵn. Bộ chọn trong phần âm thanh, đổi nhạc không tắt SFX/đổi âm lượng. Crossfade bus cũ để nốt đã lên lịch không trộn kéo dài; ghi nhớ lựa chọn localStorage, không tự bật âm thanh khi tải lại.

Kiểm chứng: 6 test frontages/music/property đạt; Chromium chọn đủ bốn bản có RMS âm thanh >0, nhớ lựa chọn sau reload; 68 cổng runtime không bị chặn; HueCIT vẫn 3 xe, tuyến vào bãi 42 điểm, không xuyên nhà trong 100 giây mô phỏng. Build thành công. Chưa cung cấp bản thu nhạc thương mại/nhạc truyền thống có tên.
