# Cảnh quan và an toàn cầu đi bộ — 2026-11-18

Yêu cầu được duyệt trực tiếp: trụ đèn hai bên đường, cỏ có hình khối, sông xanh lục có gợn, lan can Gỗ Lim chặn xe.

- StreetDetails kiểm tra cột với toàn bộ phần đường xe chạy (kể cả chính đường đặt cột), bỏ vị trí giao lộ/khúc cong lọt vào lòng đường. Chromium kiểm 732 vị trí, không điểm nào nằm trong phần đường xe chạy cộng biên 1 m.
- LivingLandscape tạo lá cỏ instanced quanh người chơi trong ô 160 m, loại đường/vỉa hè, nhà và nước. Cỏ tái tạo khi đi xa 20 m, vì vậy vùng ngoài tầm nhìn gần vẫn dùng nền xanh để giảm tải. Không khẳng định đây là asset cỏ chụp thật hay mọi ô đất trống thực tế đều là bãi cỏ.
- Nước xanh lục dùng vertex displacement và normal animation theo thời gian, không phải chỉ đổi màu tĩnh.
- BoardwalkRails dựng hai mép của ba way Gỗ Lim theo tọa độ hiện có. 34 đoạn rail có vùng chặn .45 m, canRide kiểm trước khi cho xe đi trên đường; đầu nối để hở. Chromium kiểm toàn bộ trung điểm rail bị chặn. Test riêng xác nhận tâm đường và lối vào còn đi được.

Kiểm tra: 3 test rails/placement đạt; browser không lỗi shader/console sau bổ sung favicon data; 15 ảnh năm tuyến, audit 1068 đường đạt; build thành công. Chưa đo FPS trên điện thoại thật.
