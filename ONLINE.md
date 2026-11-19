# Hai chế độ Khám phá và Online

## Chạy thử đầy đủ trên máy

Yêu cầu Node.js 22.12 trở lên (đã kiểm tra bằng Node 24). Trong thư mục `3.CunCon`:

```sh
npm install
npm run build
npm start
```

Mở `http://localhost:8080/`. Mỗi lần mở/tải lại trang đều có màn nhập tên và chọn chế độ; có thể nhớ tên để điền sẵn, không tự chọn chế độ. Để thử gặp nhau, mở hai tab/trình duyệt, nhập hai tên và chọn Online cùng khu. Từ điện thoại cùng Wi-Fi, dùng địa chỉ IP LAN của máy và cổng 8080; máy phải cho phép kết nối đến cổng này.

`npm run preview` chỉ phục vụ frontend tĩnh. Muốn dùng Online hãy chạy `npm start`, hoặc cấu hình endpoint tới server đang chạy. Khi sửa source frontend, build lại và tải lại trang. Khi sửa cấu hình server hoặc source server, khởi động lại server.

## Phát triển

Hai terminal:

```sh
# Terminal 1: WebSocket server cổng 8080
npm run server
```

```sh
# Terminal 2: Vite cổng 3000, proxy /online sang server 8080
npm run dev
```

## Cách chơi

Nhạc nền mặc định bật khi chọn chế độ. Nút “Tắt nhạc” chỉ tắt nhạc nền và nhạc quán, vẫn giữ tiếng xe/va chạm/lời thoại. Nút “Tắt âm/Bật âm” điều khiển toàn bộ âm thanh. Bảng chọn bài mặc định thu gọn; mở bằng “⚙ Nhạc”. Nếu trình duyệt chặn tự phát, chạm nút âm thanh để khởi động lại.

- **Khám phá:** giữ bản đồ, điều khiển, NPC, âm thanh như bản trước; thêm áo có tên. Không mở kết nối WebSocket game và không chiếm chỗ trong phòng.
- **Online:** một phòng chung tối đa 10 phiên, không tự tạo phòng thứ hai. Các tên trùng được phép; ID và màu áo phân biệt người chơi. Tên tối đa 18 ký tự và hiển thị bằng text/canvas.
- Cùng khu mới thấy và va chạm nhau. Danh sách Online thu gọn được; mở để xem người khác đang ở khu nào, chọn cùng khu để gặp. Người khác xuất hiện trong bán kính 150 m.
- Server đặt vị trí xuất hiện cách nhau dọc tuyến, xác nhận va chạm và phát cùng một sự kiện cho hai người. Va chạm giảm tốc/dừng ngắn, có hiệu ứng/âm thanh nếu đã bật tiếng và có cooldown.
- **Đổi chế độ** rời Online ngay. Mất kết nối bất thường: tự thử nối lại, dừng xe trong lúc mất mạng, giữ chỗ tối đa 15 giây sau khi server phát hiện ngắt. Hết hạn có thể phải vào lại và phòng có thể đã đầy.
- Chuyển tab/đưa trình duyệt xuống nền chỉ làm cún đứng yên, không ẩn cún trên máy khác. Trạng thái này tách riêng khỏi việc đang tải khu mới; cún vẫn có thể được người khác nhìn thấy và va chạm.

## Cấu hình

- Danh sách khu/nhạc vẫn ở `src/data/app-config.json`, giữ nguyên cơ chế bật/tắt và lazy loading.
- `src/data/online-config.json`: `enabled` bật/tắt nút Online và endpoint server; `path` mặc định `/online`; `endpoint` rỗng nghĩa là cùng domain với game; `reconnectSeconds` là thời gian giữ chỗ phía server.
- Có thể đặt `VITE_ONLINE_URL` khi build frontend để dùng endpoint `wss://.../online` khác domain. Khi đó thêm origin chính xác của frontend vào `allowedOrigins` phía server, ví dụ `https://travel-hue.ai.studio`. Không thêm dấu `/` cuối origin. Mặc định chỉ nhận origin cùng host.
- `PORT` chọn cổng server, mặc định 8080.

## Cấu trúc thay đổi

Không di chuyển lại các module địa điểm hay core hiện có:

- `src/ui/SessionUI.js`, `session.css`: nhập tên, chọn chế độ, danh sách online.
- `src/core/vehicle/RiderIdentity.js`: áo và nhãn tên gắn thêm vào cún hiện có.
- `src/core/network/`: kết nối, reconnect, avatar từ xa, nội suy và adapter nối với game. Chỉ tải OnlineSession khi chọn Online.
- `server/`: HTTP phục vụ `dist`, WebSocket, phòng 10 người, kiểm tra state và va chạm.
- Chỉ thêm điểm nối tại entry, frame, chuyển khu và thông báo va chạm. Model xe chi tiết dùng cache chung; không tải lại GLB cho từng người.

Thư viện mới duy nhất là `ws` phía Node. Browser dùng WebSocket có sẵn; không gọi Gemini để đồng bộ game.

## Google AI Studio / Cloud Run

Ứng dụng cần chạy backend Node với `npm start`, đồng thời phục vụ frontend đã build. Có `Dockerfile` để build một dịch vụ chứa cả hai. Chỉ tải `dist` lên static hosting sẽ không có multiplayer.

Phòng hiện lưu trong bộ nhớ của **một tiến trình**. Khi triển khai Cloud Run:

1. Chỉ một instance chạy phòng và một revision nhận traffic; đặt giới hạn instance tối đa 1, không dùng nhiều Node worker hay chia traffic giữa các revision. Nếu chạy nhiều instance độc lập, giới hạn 10 chỉ áp dụng từng instance và người chơi có thể không gặp nhau.
2. Cho phép HTTP/WebSocket công khai theo cơ chế của nền tảng; dùng HTTPS/WSS. Cấu hình timeout kết nối phù hợp (Cloud Run cho tối đa 60 phút mỗi request), client đã có reconnect.
3. Khi đổi revision/khởi động lại server, phòng bộ nhớ bị mất; client vào lại. Chưa có lưu phiên bền vững qua restart.
4. Giữ nguyên dữ liệu config và snapshot khu đi kèm backend khi đưa source lên AI Studio. Nếu AI Studio tạo entry server riêng, nối route WebSocket vào cùng HTTP server, không chạy thêm một phòng thứ hai.

Chưa triển khai lên tài khoản Google hoặc kiểm tra domain public; bản xác minh hiện là local. Cấu hình Cloud Run do công cụ publish của AI Studio sinh ra cần kiểm tra trước khi mở public để bảo đảm chỉ một instance phòng.

## Giới hạn hiện tại và kiểm chứng

- Client giữ mô phỏng xe/bản đồ hiện có; gửi pose khoảng 20 lần/giây. Server kiểm tra số thứ tự, số hữu hạn, tốc độ, ngân sách quãng đường, giới hạn khu và xác nhận va chạm người chơi. Đây chưa phải mô phỏng vật lý hoàn toàn trên server/chống gian lận hoàn chỉnh; footprint nhà và mặt đường vẫn do client xử lý.
- NPC xe/người đi bộ và va chạm với NPC vẫn cục bộ trên từng máy. Các NPC có thể ở vị trí khác nhau giữa hai người chơi. Đồng bộ NPC toàn thành phố là bước mở rộng riêng.
- Không có tài khoản, chat, lưu tiến trình hay nhiều phòng. Khám phá vẫn dùng được khi server online không kết nối được thông qua Đổi chế độ.
- Unit/integration: giới hạn 10 kết nối WebSocket thật, từ chối người 11, rời/khôi phục phiên, dữ liệu không hợp lệ, khu tắt, va chạm/cooldown và tách khu.
- Browser: hai người desktop/mobile thấy nhau và cùng nhận va chạm; chuyển khu và quay về Khám phá; tên xuất hiện lại mỗi lần tải trang. Production: 9 client mô phỏng + 1 browser mobile vào phòng, người 11 thấy đầy, giải phóng chỗ, không tràn màn hình.
- Chưa đo 10 điện thoại thật hoặc xác minh mạng WAN trễ/mất gói. Không coi kiểm tra 10 kết nối là bảo đảm FPS hay chất lượng mạng thực tế.

Nguồn tham khảo triển khai: [ws](https://github.com/websockets/ws), [AI Studio full-stack](https://aistudio.google.com/docs/aistudio-fullstack), [WebSocket trên Cloud Run](https://docs.cloud.google.com/run/docs/triggering/websockets).
