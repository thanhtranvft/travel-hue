# Tường/rào khuôn viên và HueCIT — 2026-11-18

Yêu cầu: HueCIT tường trắng, ô tô vào bãi; các nhà đều có khuôn viên tường/rào. Danh mục `property-enclosures.json` gán đúng một khuôn viên cho từng mã trong 372 nhà, tổng 349 nhóm. Nhà chung trường Quốc Học/Hai Bà Trưng, bệnh viện, trung tâm thiếu nhi dùng chung ranh giới, không dựng thêm rào chia bên trong.

`source: osm-campus` dùng ranh giới thật từ snapshot. `source: inferred-parcel` là khu đất mô phỏng quanh footprint, hạn chế bởi đường/nhà gần đó, không được coi là thửa đất đo đạc thật. `rings` là GPS; `style` wall/fence, `color`, `height`, `entranceWidth` là cấu hình riêng. `members` chứa mã TN để cập nhật theo người dùng. Đặt `locked: true` nếu đã chỉnh ranh giới thủ công và cần giữ khi chạy lại `node tool/sync-property-enclosures.mjs`.

Runtime dựng thêm 346 nhóm bên cạnh 3 khu trường/trung tâm đã có. 9.381 đoạn rào/tường được dựng; 1.178 đoạn ngắn chạm lòng đường hoặc footprint nhà được bỏ để không tạo vật cản sai. Vì thiếu dữ liệu thửa đất, các khu suy diễn có thể hở tại vị trí xung đột; chưa tuyên bố tất cả khuôn viên đã khép kín đúng thực địa. Mọi inferred ring chứa trọn footprint của chính nhà đó (kiểm thử).

HueCIT TN-0078, way/354775345: tường trắng #f2f0e5, cao 1.9 m; khu đất và cổng là mô phỏng. Cổng được chọn vào phần sân có kết nối thông thoáng. Bãi có 3 ô tô; 1 xe di chuyển giữa cổng và ô đỗ, 2 xe đỗ. Đường chạy tìm trên lưới bên trong sân, tránh footprint nhà và ô đỗ tĩnh. Sân đỗ không mọc cỏ/cây. Chưa có AI nhập làn giao thông đường phố; xe hoạt cảnh vào/ra từ cổng.

Va chạm tường/rào dùng chỉ mục ô 32 m để không quét toàn bộ hàng nghìn đoạn mỗi tick. Hình học gom theo vật liệu để giảm draw call. Kiểm tra: 3 unit tests catalog/footprint/index đạt; Chromium HueCIT 3 xe, đường 35 điểm, không xuyên nhà trong 100 giây mô phỏng, lối vào mở. Chưa đo FPS trên điện thoại thật.
