# Chốt nhạc local, người đi bộ và cổng — 2026-11-18

## Bản thu va chạm do người dùng cung cấp

Thay hoàn toàn Web Speech bằng hai WAV gốc trong src/assets/sound: người đi bộ “Đi đứng kiểu chi rứa hả (2026-11-18 21-11-47).wav” dài 1.472 s, xe máy “Bị đui hay răng mà không thấy (2026-11-18 21-12-11).wav” dài 1.664 s. Tên file được giữ nguyên; ánh xạ trong collision-recordings.json và URL tĩnh generated collisionRecordings.js, tái đăng ký sau khi đổi tên bằng node tool/register-collision-recordings.mjs.

CollisionVoice nạp/giải mã khi bật âm thanh, cache buffer, chỉ phát một lời thoại tại một thời điểm; khi tắt âm hủy cả lượt phát chờ tải. Cùng master volume với nhạc và SFX. Phụ đề JSON không đổi. Browser gây đúng hai loại va chạm, đo peak RMS .101/.076 từ bản thu (tắt các bus nhạc và tiếng tông trong kiểm thử để phân biệt); không còn phụ thuộc voice của hệ điều hành. 3 unit test mapping/WAV/mute đạt, build chứa cả hai WAV.

Yêu cầu mới nhất ưu tiên file của người dùng, không nhúng video. Hai bản có lời trong music-tracks.json là kind=file, dùng `src/audio/huethuong.mp3` (364.20 s) và `src/audio/Thuong Ve Mien Trung.mp3` (325.40 s). RecordedMusic phát HTMLAudio qua master WebAudio chung âm lượng/SFX, có thanh điều khiển và lặp, dừng khi tắt nhạc/đổi sang giai điệu tổng hợp/ẩn tab. Không có mã YouTube hoặc iframe trong source game. Build đóng gói cả hai MP3 vào dist/assets; không sao chép sang project khác.

Mật độ walkers mới 400 (186 trái, 214 phải theo lần kiểm tra), nhóm công viên 234 người tại 11 polygon hợp lệ; 58 pedestrian TrafficSystem cũ vẫn tồn tại. Mở rộng tuyến vỉa hè, lối không tên và cầu, chọn cao độ theo đường riêng để người không chìm sông/nhảy tầng. Các NPC cảnh quan mới được đưa vào kiểm tra va chạm.

collision-dialogue.json giữ nguyên hai câu: pedestrian “Đi đứng kiểu chi rứa hả?”, scooter “Bị đui hay răng mà không thấy?”. Toast hiển thị và Web Speech đọc lang vi-VN khi bật âm thanh, chọn voice Việt nếu trình duyệt cung cấp. Chất giọng/khả năng đọc thực phụ thuộc voice hệ điều hành; browser test xác minh request đọc đúng câu, không khẳng định giọng Huế thu âm. Khi tắt âm thanh, không đọc.

Cổng Trung tâm Thanh thiếu nhi dựng trên lối mở hàng rào, bảng tên/địa chỉ, sân vào; cây cách tâm cổng dưới 15 m bị loại khỏi danh sách GLB. Cổng Quốc Học nâng mái, đưa bảng ra trước khung, bỏ trụ biển phụ che tên. Raycast 10 điểm chữ mỗi cổng đều không bị vật thể che, cổng đi qua được, không còn cây gần lối vào. Các mô hình cổng vẫn là minh họa, chưa sao chép kiến trúc chính xác.

Kiểm chứng: unit music/dialogue đạt; browser phát thật hai MP3, pause/switch được, không yêu cầu tới YouTube. Kiểm tra collision với NPC mới và xe máy đúng subtitle/speech request. Test cổng nhìn thấy tên và lối đi mở đạt. Build có MP3 5.45 MB và 6.07 MB. Chưa đo FPS trên điện thoại thật.
