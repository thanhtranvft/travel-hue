# Dữ liệu địa điểm và tòa nhà

`pedestrians.json` cấu hình số người vỉa hè, số người mỗi công viên, khoảng cách hiển thị và màu áo. PedestrianLife thêm 160 người hai bên lối đi và 238 người tại 10 polygon công viên OSM trong bounds. Nhóm đứng trò chuyện/vận động đơn giản, có người lớn/trẻ nhỏ bằng tỷ lệ mô hình. Kiểm tra browser tại 4 mốc thời gian: không lọt vào nhà, nước hoặc lòng đường; người xa 140 m tạm ẩn. Các nhóm cảnh quan này chưa tham gia hệ va chạm của TrafficSystem; 58 pedestrian giao thông cũ vẫn giữ hành vi cũ. Chưa đo FPS trên điện thoại thật.

- `sites.json`: 14 địa điểm chính; sửa `title` (tên hiển thị), `address` (địa chỉ). Giữ `id`, `osm`, `kind` khi chỉ đổi tên để không đổi vị trí/module.
- `buildings.json`: danh mục tòa nhà theo footprint OSM trong khu vực game. Mỗi bản ghi có `code` (mã để người dùng đọc trên biển), `number` (số thứ tự nội bộ), `osmKey` (khóa tọa độ gốc), `coordinates` (GPS), `osm` (thông tin tham khảo).

Ví dụ yêu cầu: **“TN-0007 đổi tên thành Nhà hàng Huế, số 18A đường Lê Lợi.”** Tìm bản ghi đúng code rồi sửa:

```json
{
  "name": "Nhà hàng Huế",
  "houseNumber": "18A",
  "street": "Lê Lợi"
}
```

Chỉ thay ba trường này trong bản ghi hiện có; không thay code, number, osmKey hay coordinates. `null` nghĩa là dùng dữ liệu OSM; chuỗi rỗng dùng để xóa giá trị cũ. Đây là tên/số nhà do người dùng bổ sung trong game, không tự gửi sửa lên OSM. Mã TN là số nhận diện, không phải số nhà thực tế.

Các tòa nhà hiện đều có hình học OSM; “chưa có OSM” trong yêu cầu được hiểu là thiếu tên/địa chỉ trên OSM. Tòa nhà chưa có footprint không tự sinh vị trí.

Sau khi bổ sung snapshot, chạy `node tool/sync-building-catalog.mjs`: chỉ thêm bản ghi mới với số tiếp theo, giữ mã và các tên đã sửa, kể cả bản ghi tạm không còn trong snapshot. Không đánh số lại theo thứ tự render. Đổi JSON trong dev sẽ tự tải lại; bản production cần `npm run build` rồi tải lại trang.
