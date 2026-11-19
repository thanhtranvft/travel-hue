# Bản đồ Huế — dữ liệu OSM

## Kiểm toán anchor — 2026-11-18

Đã tải thêm 104 node/way/relation bằng fetch-osm-entrances.mjs vào osm-entrances.json. Truy vấn đầu chỉ lấy node có tên đã bỏ sót cổng không tên. Đã mở trực tiếp giao diện OSM để đối chiếu khu vực Lê Lợi (ảnh tool/browser-test/osm-source-le-loi.png).

- Ga: dùng node/13516177652, entrance=main, GPS 16.456522 / 107.5780484; thay điểm cũ là góc polygon gần đường.
- Quốc Học: node/13516238182, barrier=gate, GPS 16.4605442 / 107.5828662. Điểm cũ tình cờ trùng node này; không dịch chuyển tùy ý, nay gắn đúng provenance.
- Hai Bà Trưng/UBND: snapshot chưa có cổng phù hợp để xác nhận; dùng nhãn khuôn viên, không gọi là cổng.
- Bệnh viện: multipolygon có hai vùng, khoảng 13.177 và 67.863 m². Điểm cũ lấy trung bình đỉnh vùng đầu dẫn tới nhầm vùng phụ. Nay lấy centroid diện tích của vùng lớn nhất làm nhãn khuôn viên; gate node/8727922178 không nằm sát mặt Lê Lợi nên không dùng làm cổng Lê Lợi.
- Đèn giao thông: dùng node highway=traffic_signals thật (gồm 10873164038, 10873164039 tại khu vực đầu cầu), không đặt bằng offset ±9 m quanh giao lộ.
- Hiển thị tất cả đường/lối đi trong bounds, không còn chỉ chọn vài tên đường. Biển khuôn viên chưa xác minh cổng là nhãn nổi, không dựng chân biển giả như một cổng thật.
- Trong game, nút Đối chiếu OSM chuyển tọa độ xe về lat/lon và mở map=18 đúng vị trí đó.

23 unit test, production smoke và 5 tour đạt. Đây là kiểm chứng nguồn và tích hợp; không đồng nghĩa toàn bộ mô hình kiến trúc/chiều rộng/cao độ đã được xác minh ngoài thực địa.

Snapshot tải ngày 2026-11-18 bằng tool/fetch-hue-geography.mjs; dữ liệu API Overpass chính (overpass-api.de), bbox 16.450–16.478 N, 107.565–107.601 E, 7.423 node/way/relation. Bản gốc: src/assets/hue-geography.json; bản dùng trong app: osm-snapshot.json. Không gọi mạng khi chơi.

Nguồn và giấy phép: https://www.openstreetmap.org/copyright — © OpenStreetMap contributors, ODbL. Attribution hiển thị trong game. Snapshot được chia chunk riêng khi build để cache độc lập với gameplay.

## Mô hình dữ liệu

- geometry.js: chiếu WGS84 lat/lon sang hệ tọa độ cục bộ x Đông, z Nam, mốc ga Huế; đổi ngược và thuật toán nối tuyến theo các node hình học chung. Cùng phép chiếu áp dụng cho mọi lớp, không đặt lại vị trí bằng cảm tính.
- map.js: chọn đường thật, ráp polygon bờ sông (relation 2393612), chọn POI và khuôn viên, đặt biển tại phía khuôn viên gần Lê Lợi. Biển không có nghĩa là đã khảo sát chính xác cổng vào.
- GeographicWorld: dựng ribbon đường theo polyline OSM; footprint building theo polygon; lối đi, sông, biển tên và giao Lê Lợi × Hà Nội tại node hình học chung với đầu cầu Phú Xuân. Minimap dùng cùng dữ liệu.
- GeographicTraffic: người/xe chạy trên polyline/footway thật, thay cho các đường thẳng tọa độ prototype. Âm thanh ven quán dùng POI restaurant/cafe trên cùng snapshot.

## Các đối tượng đối chiếu

| Địa điểm | OSM |
|---|---|
| Ga Huế | way/175063593 |
| Quốc Học | way/695775622 |
| Bia Quốc Học | node/5299153429 |
| Hai Bà Trưng | way/695770482 |
| UBND Huế | way/695770476 |
| Bệnh viện Trung ương Huế | relation/21912794 |
| Phú Xuân/đường tiếp cận | way/39419121, way/39420686 |
| Hà Nội | way/39419741, way/1169292364 |
| Lê Lợi chính | way/626373586 và các đoạn nối |
| Đường dạo Gỗ Lim | way/1167513732, 1167513733, 683633953 |
| Trường Tiền | way/174759688 |
| Kỳ Đài / Ngọ Môn | way/218427614, way/172657562 |

Ba đoạn đường dạo liên thông tổng khoảng 423 m bao gồm tiếp cận; không coi đoạn có tên Ironwood dài 106 m là toàn bộ cầu. Tài liệu địa phương xác nhận tuyến cầu đi bộ bên bờ Nam, khu vực Phú Xuân–Trường Tiền:
https://dttm.hue.gov.vn/truyen-thong-canh-bao/xu-ly-tinh-trang-an-xin-vang-lai-tai-cau-go-lim-thanh-pho-hue.html

Đối chiếu địa chỉ UBND 16 Lê Lợi: https://vpubnd.hue.gov.vn/Lien-he
Nghiên cứu các công trình dọc Lê Lợi: https://www.mdpi.com/2071-1050/17/11/4753

## Những gì chưa phải số liệu khảo sát

OSM không phải khảo sát centimet hoặc GPS trực tiếp của người chơi. Chiều rộng đường dùng tag width/lanes nếu có, nếu thiếu dùng giá trị gameplay ước lượng. Cao độ địa hình/cầu, chu kỳ đèn, mặt đứng/cửa sổ, mái và cây trang trí là dựng ước lượng. Không khẳng định kiến trúc hay mặt sau bệnh viện giống ảnh thực địa. Chưa ráp mô hình kiến trúc chi tiết cho mọi công trình, chưa ghép đầy đủ phố bên ngoài bbox; hướng một chiều và quy định theo giờ trong tour chưa được mô phỏng đầy đủ.

## Kiểm chứng

19 unit test: phép chiếu/đổi ngược, Quốc Học đối diện Bia, thứ tự công trình, graph tuyến và các test gameplay trước. Browser: 370 footprint building, 11 biển/POI, 3.955 đoạn đường/lối đi; 5 tour chạy đến cuối khi tắt giao thông để kiểm tra hình học. Nhạc quán dùng vị trí OSM, gần = 1/xa = 0 trong ca thử. Production: bundle thật, menu/nhạc, attribution và 2 touch độc lập đạt; không pageerror hoặc asset lỗi. Chưa coi đây là kiểm định GIS độc lập hoặc kiểm thử trên điện thoại vật lý.
