# Biển và cổng trường — 2026-11-18

## Làm rõ màu và Trung tâm Thanh thiếu nhi

Theo yêu cầu tiếp theo: tường bao Hai Bà Trưng chuyển sang đỏ #a73d30 giống Quốc Học; màu cổng vàng giữ riêng, các đoạn tường cạnh cổng cũng đỏ. CampusWalls đọc wallColor trước color.

Trung tâm Thanh thiếu nhi dùng polygon khuôn viên OSM way/695775607, khác footprint nhà way/118541971. YouthPlayground dựng hàng rào bao ranh giới, có lối vào 8 m (ước lượng mặt giáp Lê Lợi), dùng cùng vùng chặn với tường campus. 10 cụm/5 loại trò chơi: xích đu, cầu trượt, bập bênh, mâm xoay, sân cát; ba loại có chuyển động. Các vật thể là mô phỏng cảnh quan, chưa có cơ chế người chơi sử dụng trò chơi. Vị trí trò chơi chọn bên trong polygon, cách nhà/đường/rào, không khẳng định là vị trí thiết bị ngoài đời. Cấu hình trong youth-playground.json.

Kiểm chứng: 5 test youth/campus đạt, browser 10 cụm/12 đoạn rào, rào chặn xe và lối vào mở, carousel chuyển động, không pageerror; build thành công.

## Tường toàn khuôn viên

Theo làm rõ của người dùng, TN-0103/TN-0104/TN-0032 chỉ là ví dụ. CampusWalls dùng toàn bộ polygon trường thay vì danh sách ba mã. Quốc Học bao gồm TN-0032, TN-0095, TN-0096, TN-0103–TN-0108 trong danh mục hiện tại; Hai Bà Trưng TN-0092–TN-0094, TN-0097, TN-0349, TN-0350, TN-0355. Tường Quốc Học đỏ, Hai Bà Trưng vàng đồng bộ cổng; cao 2.2 m, dày .4 m cấu hình trong school-gates.json. Khoét lối cổng theo độ dài biên, kể cả cổng tại góc polygon; xe không xuyên tường, bộ sinh người cảnh quan tránh tường. Kích thước/màu là mô phỏng, không phải khảo sát thực địa.

Kiểm tra 5 test campus/gate đạt; Chromium nhìn từ trên cao: Quốc Học 11 đoạn tường, Hai Bà Trưng 8 đoạn; trung điểm các đoạn chặn xe và hai cổng đi qua được. Đã build bản mới.

Theo yêu cầu: biển tuyến đường/giao lộ vuông 3.6 m, nền xanh dương, chữ trắng đậm, tự xuống dòng. Texture dùng chung cho cùng nội dung để giảm bộ nhớ. Trụ tên/số nhà đặt bên đường với nhà có tên; thiếu số nhà không tự bịa. Buildings JSON vẫn điều khiển tên/địa chỉ.

Quốc Học: khuôn viên way/695775622, cổng dùng node mapped đã xác minh trong map.js. Hai Bà Trưng: way/695770482, chưa có entrance mapped rõ; cổng mô phỏng đặt midpoint cạnh khuôn viên gần Lê Lợi nhất, confidence estimated-frontage. Hai mô hình có màu/kiểu riêng để nhận biết, chưa phải bản sao kiến trúc khảo sát. Tên, địa chỉ, màu, chiều rộng trong school-gates.json. Dọn cây/cỏ trước khoảng mở cổng, thêm sân vào và bảng tên cổng riêng.

Kiểm chứng: 2 test cổng/frontage đạt; Chromium chụp cả hai cổng, kiểm tra 30 trụ biển nhà có tên đều ngoài lòng đường. Biển địa điểm riêng vẫn có thể trùng nội dung với biển nhà tương ứng; chưa có công cụ biên tập trực tiếp trong game.
