# Kiến trúc Cún con đi dạo Huế

Luồng mới 19/11/2026: nhập tên → Khám phá/Online. Backend và network được thêm độc lập, không chuyển lại cấu trúc khu; xem [ONLINE.md](ONLINE.md) để chạy bản đầy đủ bằng `npm start` và cấu hình phòng 10 người.

## Phân chia trách nhiệm theo MVP

```text
src/
  app/                 GamePresenter, GameView, bộ đọc catalog
  core/                Code dùng chung, không thuộc riêng địa điểm
    audio/ input/ vehicle/ traffic/ rendering/
    world/ shared/
  modules/areas/
    AreaModel.js       Dữ liệu khu đang hoạt động và giới hạn di chuyển
    AreaView.js        Tạo cảnh 3D của một khu
    AreaPresenter.js   Chuyển khu, phục hồi khi lỗi, giải phóng cảnh cũ
    quoc-hoc/          index.js, model/osm.json, data/, view/
    south-bank/        index.js, model/osm.json, view/
    truong-tien/       index.js, model/osm.json, view/
    north-bank/        index.js, model/osm.json
    imperial-city/     index.js, model/osm.json, view/
  assets/
    audio/music/       MP3 local
    audio/collisions/  WAV lời thoại va chạm
    maps/source/       Snapshot OSM đầy đủ phục vụ công cụ offline
    models/            Model GLB dùng chung
  data/
    app-config.json    Danh sách khu vực và nhạc, nguồn cấu hình duy nhất
    world/             Tòa nhà, địa điểm, khuôn viên, người đi bộ
    audio/             Metadata lời thoại
  ui/                  Giao diện mobile
  legacy/              Prototype cũ, không thuộc entry đang chạy
```

Model giữ dữ liệu và quy tắc địa lý; View dựng cảnh/HUD; Presenter điều phối input, vòng lặp và vòng đời. Entry hiện hành là `src/main.js` → `app/GamePresenter.js`. Sửa prototype trong `legacy/` không thay đổi game đang chạy.

## Bật/tắt khu vực và nhạc

Sửa `src/data/app-config.json`:

- Khu vực: tìm bản ghi theo `areas.items[].id`.
- Nhạc: tìm bản ghi theo `music.tracks[].id`.
- Đặt `"enabled": false` để ẩn và ngăn tải. Có hỗ trợ `"disabled": true`; nếu dùng cả hai, `disabled: true` luôn tắt bản ghi.
- Bật lại bằng `enabled: true` và bỏ `disabled: true` nếu có.
- `areas.defaultId` và `music.defaultId` chọn mặc định. Nếu mặc định bị tắt, dùng bản ghi bật đầu tiên.
- Tắt tất cả khu: hiện thông báo chưa mở khu, không khởi tạo thế giới. Tắt tất cả nhạc: danh sách nhạc bị vô hiệu, hiệu ứng âm thanh vẫn hoạt động.

Giữ nguyên `id` khi đổi tên. Không cần xóa module hoặc file nhạc để tắt. Dev tự tải lại; bản production phải chạy `npm run build`, phục vụ lại `dist/` rồi tải lại trang. JSON được đóng vào build, không phải cấu hình server đọc trực tiếp sau mỗi lần mở trang.

## Lazy loading và hiệu năng mobile

Chỉ import gói OSM của khu được chọn; dữ liệu khu khác chưa tải. Việc đi xe giới hạn theo hành lang tuyến và phần mở rộng khuôn viên của khu hiện hành. Chọn khu khác qua menu để chuyển. Cảnh mới dựng thành công mới thay cảnh cũ; geometry/material/texture không dùng chung được giải phóng. Model dùng chung được cache và bảo vệ khỏi dispose khi đổi khu.

Trên mobile: giới hạn DPR 1, tắt bóng động/MSAA, gộp mesh tĩnh theo ô, instancing người/cây, giới hạn chi tiết và khoảng cách cập nhật. Giảm chất lượng không thay đổi tọa độ OSM hay quy tắc va chạm.

`vite.config.js` chuyển import adapter `core/shared/geography/map.js` sang `AreaModel.js` khi chạy game. Node test/công cụ offline vẫn dùng snapshot đầy đủ qua adapter gốc. Vì vậy không import trực tiếp snapshot đầy đủ vào entry hoặc View runtime.

## Thêm hoặc sửa địa điểm

- Sửa tên/số nhà theo mã TN trong `data/world/buildings.json`, giữ mã và khóa OSM để không đổi nhận diện.
- Dữ liệu riêng địa điểm nằm trong `modules/areas/<id>/data/`; hình học riêng trong `view/`. Dùng `core/` cho helper thực sự dùng chung.
- Thêm khu mới: tạo folder với `index.js` và `model/osm.json`, khai báo loader trong `AreaModel.js`, thêm bản ghi đường đi/spawn vào `app-config.json`; bổ sung View riêng nếu cần.
- `node tool/generate-region-data.mjs` tái sinh snapshot từng khu từ nguồn OSM offline. Rà soát diff trước khi giữ thay đổi dữ liệu.
- Script di chuyển một lần trong `tool/migrations/2026-11-19/` là lịch sử, không chạy lại.

## Kiểm chứng nhóm thay đổi 19/11/2026

- 63 unit test đạt; build production đạt.
- Chuyển đủ 5 khu và quay lại: giải phóng scene cũ, chặn đi ngoài khu, cache model dùng chung.
- Tắt khu/nhạc bằng cấu hình: ẩn menu, không tải gói khu bị tắt; trạng thái tất cả khu tắt hoạt động.
- Bản production: điều khiển hai tay độc lập, không chọn chữ khi giữ nút; hai MP3 local phát, không có yêu cầu mạng ngoài.
- Profile Chromium mô phỏng mobile tại cảnh khởi đầu: trung bình khoảng 92 ms xuống 7 ms/frame; draw call 11.913 xuống 785. Đây là phép đo mô phỏng, chưa chứng minh tốc độ trên điện thoại thật.
