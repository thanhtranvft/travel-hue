# Tư liệu thật của Huế

Ba JPG trong thư mục là ảnh tham khảo kiến trúc, không phải dữ liệu bản đồ, mô hình 3D hay texture đã hiệu chỉnh phối cảnh.

- `bia quoc hoc hue.jpg`: bình phong giữa, mái cong nhiều lớp, sân bậc cấp, hai trụ biểu. Đã dùng để sửa module quoc-hoc.
- `cau truong tien.jpg`: vòm thép theo khoang, giằng ngang/chéo, lan can, trụ cầu. Đã dùng để sửa module truong-tien.
- `72797-cong-ngo-mon-hue-700x442.jpg`: nền đài, các lối cổng, cột đỏ, hệ mái lầu Ngũ Phụng. Đã dùng để sửa module ngo-mon.

Mô hình hiện được dựng hình học thủ công theo hình thái ảnh, chưa phải photogrammetry hoặc bản đo kiến trúc. Chưa có dữ liệu OSM/GeoJSON trong asset. Không suy ra tọa độ hoặc tỷ lệ bản đồ từ ảnh.

## Dữ liệu còn cần

File `.osm` hoặc `.geojson` trong vùng hai bờ sông Hương: Bia Quốc Học – Trường Tiền – Đại Nội. Cần đường, polygon mặt nước, footprint công trình và POI để đặt công trình đúng tọa độ. Khi nhập phải giữ metadata nguồn và ghi công OSM.

Các script `tool/fetch-map.mjs` và `tool/fetch-osm-direct.mjs` tải dữ liệu khi endpoint khả dụng. Lần thử 2026-11-17 thất bại (406/429); không có dữ liệu giả thay thế.
