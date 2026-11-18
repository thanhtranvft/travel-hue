# Lớp sinh hoạt đường phố — 2026-11-18

## Bản vá đường và cột biển

### Đính chính kiểm chứng cao độ

Ảnh phản hồi tiếp theo cho thấy bản vá trước chưa sửa hàm roadHeight: script replace không khớp nhưng đã được báo như thành công. Đã thay trực tiếp hàm bằng module roadSurface, tách nhựa .32 m, footway .12 m, vỉa hè .16 m; kiểm thử toàn bộ roads xác nhận khoảng cách tối thiểu và hữu hạn. Không dùng script thay chuỗi để chứng minh kết quả nữa. Kiểm tra runtime 1068 đoạn đang dựng, 15 ảnh tại 3 vị trí mỗi tuyến trong 5 tuyến. Loại cột đèn chiếu sáng nếu nằm trong đường nhánh. Build mới index-DJXMPeRZ.js. Các ảnh mẫu không chứng minh từng pixel của toàn bộ mạng đường; chưa khẳng định mọi sai lệch bản đồ/kiến trúc đều được xử lý.

Tách nhựa đường .27 m khỏi footway .18 m và vỉa hè .16 m để tránh tranh chấp độ sâu; ngắt vạch tại đường giao nhau, dùng cao độ chính tuyến thay vì lấy đường gần nhất. Biển đường có cột riêng bên phải cho mỗi chiều; biển giao lộ chuyển khỏi tim đường về vị trí bên phải trước nút giao. Tăng cây lên 480 vị trí (ưu tiên Lê Lợi), xe thành 22 ô tô, 16 xe máy, 5 xe tải. Không coi toàn bộ giao lộ đã được khảo sát: đã kiểm ba test placement/profile, Chromium không pageerror, ảnh corridor không còn vạch biên xuyên lòng đường ở điểm đã chụp. Bản build mới phải dùng entry index-C1PM77bd.js.

Theo yêu cầu người dùng: mở mặt đường Lê Lợi tối thiểu 14 m, đường chính 12 m, dân cư 8 m; giữ tim đường OSM. Đây là độ rộng phục vụ gameplay, không phải kích thước đo thực địa. Footway giữ 4 m nếu thiếu width. RoadProfile dùng chung cho hình học, va chạm và vị trí làn xe.

StreetDetails dựng vạch giữa/biên, biển tên đường, cột chiếu sáng, nhãn tên/địa chỉ nhà theo tag OSM. Thiếu tên/số nhà ghi rõ, không sinh địa chỉ giả. Vạch gom geometry để hạn chế draw call. Cây trang trí hai bên đường có tán lớn/nhỏ, bụi và cây dạng tháp; không khẳng định loài cây hay tọa độ từng cây ngoài đời.

GeographicTraffic có 10 ô tô, 4 xe máy, 5 xe tải và 58 người; người theo footway hoặc mép vỉa hè, xe lệch tim theo chiều rộng đường, giảm tốc khi có xe trước. Đèn giao thông vẫn dùng node OSM, chưa có bộ điều phối chu kỳ/luật ưu tiên giao lộ đầy đủ. Xe tải là mô hình dựng hình học, chưa phải asset xe chi tiết.

Kiểm tra Chromium: không pageerror, tất cả actor có tọa độ hữu hạn sau cập nhật, 14 địa điểm, đường đi được. Có ảnh inspect-corridor để phát hiện và sửa hướng xoay vạch đường. Chưa đo FPS trên điện thoại thật.
