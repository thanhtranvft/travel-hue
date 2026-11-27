# Handoff

## Quay có âm thanh và di chuyển sau khi lên bờ — 2026-11-27

Theo báo lỗi video thiếu tiếng trên Firefox và kẹt sau đi thuyền. Luồng quay cũ bắt lỗi resume âm thanh rồi bỏ qua, vẫn có thể xuất video không audio. `prepareRecordingAudio` nay yêu cầu context running và track live, clone track riêng cho mỗi clip, giữ âm thanh chạy khi quay và hoàn nguyên chính sách sau đó. Track bị gián đoạn/recorder lỗi không còn được báo thành công; không dùng micro. Chưa tái hiện mất tiếng trên bản Firefox kiểm tra khi nguồn âm hoạt động bình thường; ba file WebM/Opus sau vá đã giải mã PCM stereo có tín hiệu thật (nhạc nền, Hò Đối Đáp, quay lặp). Artifacts tại `tool/browser-test/capture-audio-check/firefox/`.

Thuyền rồng/đạp vịt nay tìm điểm lên bờ có khoảng trống và lối đi tiếp về phía đất liền, thay vì chỉ trả ra cầu tàu và giữ hướng ra sông. Nếu không có điểm hợp lệ thì giữ hoạt động, báo thử lại; khôi phục heading/camera/input và tắt tự lái. Browser production với server thử nghiệm riêng xác nhận xuống thuyền rồi chạy khoảng 10m vào bờ, không lỗi JavaScript. 23/23 kiểm thử capture/river/cruise qua. Chưa đo trên mọi phiên bản Firefox hoặc điện thoại thật.

## Rà soát thuyền rồng và âm thanh — 2026-11-27

Tiếp tục theo yêu cầu trực tiếp sau hai commit `9425a64`, `a4afdb1`. Giữ bến thuê/nhóm tiếp khách và ba nghệ sĩ đã có: hai nữ áo dài tím/vàng, nam áo dài khăn đóng; avatar ngồi làm du khách, thuyền tự lái. Nút master đã được bỏ trong commit trước, âm thanh và nhạc nền mặc định bật. Nút nhạc nền giờ đảo trạng thái đúng cả khi AudioContext đang suspend; tắt nền vẫn giữ tiếng game và buổi hò trên thuyền.

Sửa vòng đời media: khi chuyển sang nhạc thuyền mình, dọn cả Audio element còn fade của thuyền trước, hủy tải và ngắt node cũ. Trong cruise chỉ chọn nguồn hát trên thuyền mình. Các file được đặt nhãn đúng “Hò Đối Đáp · Đoạn 1–4”, không gắn tên Nam Ai/Phú Lục cho những trích đoạn chưa xác minh.

Helper `src/core/world/boatCollision.js` kiểm tra thân thuyền có hướng. Thuyền du khách tránh thân thuyền khác/trụ cầu, dừng nhường khi không tìm được vị trí an toàn; thuyền cảnh tránh cả local và remote cruise. Server từ chối lên chồng thuyền hoặc cập nhật vị trí làm hai cruise chồng nhau; client báo chờ nếu thuyền trước còn sát bến. Reset khu xóa danh sách cruise cũ.

20/20 kiểm thử mục tiêu qua (âm thanh, 6 avatar, 3 nghệ sĩ, tránh thuyền, online, sông/mobile). Mô phỏng thuyền cảnh kiểm tra từng mẫu 5s trên hành trình 15 phút, không thay thế đo liên tục trên thiết bị thật. Browser chạy production trên server kiểm thử riêng, đổi spawn slot tới bến: thuê → tự chạy → tắt nhạc nền → lên bờ, không lỗi JavaScript; ảnh và kết quả tại `tool/browser-test/dragon-cruise-check/`. Test server đã đóng; dev để thử ở cổng 5182. Chưa kiểm chứng 10 người thật/WAN, chưa deploy hoặc tạo commit mới. Bản production cần khởi động lại Node để dùng bản vá server.

## Khám phá Huế kết hợp tranh tài — 2026-11-24

Phạm vi đã duyệt bằng `/implement idea 3`. `tag-chase` giữ map 01/05, thêm nhịp khám phá 60s → rượt bắt 45s → hợp tác 45–57s theo sĩ số. Đổi vai và lợi thế Người Săn chỉ có lúc tranh tài. Ghé địa danh +120đ một lần/ván sau khi thực sự di chuyển; sinh tồn yêu cầu chuyển động và Người Săn đang hoạt động gần đó. Cuối ván ghi nhận người khám phá, đồng hành và tranh tài riêng.

`src/modules/game-modes/tag-chase/journey-config.json` chứa luật, điểm hẹn và tên nhiệm vụ. `journeyRoadPoints.js` lấy vị trí trên đường có sẵn; không tạo đường hay dịch chuyển công trình. Hợp tác cần 2 món/người (4–15), chỉ sinh trong bán kính 70m quanh điểm hẹn; nếu thiếu điểm đường hợp lệ thì mục tiêu giảm theo số món thực có. Thưởng hoàn thành dành cho người có đóng góp. Đây là hoạt động game, không mô tả nghi lễ/văn hóa lịch sử.

HUD ghi giai đoạn, khoảng cách; khay Q/E/F chỉ hiện lúc tranh tài. Nút đọc địa danh dùng giới thiệu hiện có và chỉ mở khi gần công trình; thẻ/lời rao không che hướng đi lúc rượt bắt. Free-roam giữ hành vi cũ.

Chạy `npm run dev`, chọn map 01 hoặc 05 → Rượt bắt tốc độ; mở hai trình duyệt/thiết bị để bắt đầu. Khi dùng `npm start` phải khởi động lại Node sau cập nhật source server; frontend production cần `npm run build`. 23/23 kiểm thử liên quan và production build qua; browser kiểm tra hai người, HUD mobile và joystick. Chưa thử 10 người thật/điện thoại thật hay chốt cân bằng. Chưa deploy Google AI Studio.

## Ga Huế, tuần tra và hai mức âm thanh — 2026-11-19

Đã nâng tên lên lưng áo phía trên đuôi. Tuyến Ga Huế → Tràng Tiền xuất phát trên đường sân trước cổng OSM, qua Cầu Ga rồi giữ nguyên đoạn Lê Lợi cũ. Module `quoc-hoc/view/HueStation.js` và `data/station.json` chứa mái/biển ga, hai đoàn tàu chờ, đường ray, sông An Cựu và lan can Cầu Ga. Cao độ, ray phụ và toa tàu là mô phỏng, không phải lịch tàu thực. Bộ sinh gói khu hiện đọc tuyến từ app-config để không mất điểm đầu mới khi tái sinh.

Xe tuần tra mỗi xe có hai cảnh sát áo vàng/mũ cảnh sát, chạy theo các đường chính OSM của khu. `data/world/police-patrols.json` cấu hình bật/tắt, số xe, tốc độ, khoảng cách nhắc và cooldown. Dùng WAV “Chạy xe cẩn thận đi!” khi đi ngang; va chạm hai người chơi dùng WAV “Ui cha mạ ơi !” cho cả hai phía. NPC tuần tra vẫn cục bộ như các NPC hiện có.

Nhạc nền mặc định bật sau thao tác chọn chế độ (mở AudioContext ngay trong cử chỉ người dùng). “Tắt nhạc” chỉ tắt nhạc nền/nhạc quán; va chạm, lời thoại và tiếng xe vẫn chạy. “Tắt âm/Bật âm” là công tắc toàn bộ. Bảng nhạc mặc định thu gọn, mở bằng “⚙ Nhạc”.

Kiểm chứng: 71/71 unit/integration; browser xác nhận bảng tên trên đuôi, spawn cách cổng 6,5 m, hai đoàn tàu, đoạn đầu tự lái qua cầu không bị chặn; cảnh sát hai người và phát đúng bốn WAV; tắt riêng nhạc vẫn phát lời thoại, master mute dừng toàn bộ; hai phiên Online cùng phát tiếng va chạm mới. Build đã cập nhật; chưa publish domain Google.

## Khám phá và Online 10 người — 2026-11-19

Hướng dẫn mới: [ONLINE.md](ONLINE.md). Chạy `npm run build` rồi `npm start`, mở `http://localhost:8080/`; `preview` chỉ là frontend. Nhập tên mỗi lần mở trang, chọn Khám phá hoặc Online; đổi chế độ không tải lại trang. Khám phá không chiếm slot. Online một phòng tối đa 10, cùng khu thấy/va chạm nhau, có reconnect.

Giữ nguyên module địa điểm và logic Khám phá; thêm `core/network`, UI phiên, áo tên và `server/`. 67 unit/integration test đạt; hai browser xác nhận cùng va chạm, tách khu và đổi mode; production xác nhận 10 người/đầy phòng/giải phóng chỗ. Chưa publish Google, chưa đo 10 điện thoại thật. NPC vẫn cục bộ; server kiểm tra pose và va chạm người chơi, chưa authoritative đầy đủ. Chỉ chạy một instance phòng khi deploy; xem giới hạn trong ONLINE.md.

## Kiến trúc MVP, lazy loading và mobile — 2026-11-19

Hướng dẫn hiện hành: [ARCHITECTURE.md](ARCHITECTURE.md). Entry: `src/main.js` → `src/app/GamePresenter.js`. Code chung ở `src/core/`, từng khu ở `src/modules/areas/<id>/`, tài nguyên ở `src/assets/`. Các đường dẫn source trong ghi chép cũ bên dưới có thể đã chuyển; dùng cấu trúc mới trong ARCHITECTURE.md.

Danh sách nhạc/khu duy nhất: `src/data/app-config.json`. `enabled: false` hoặc `disabled: true` ẩn và ngăn tải; production cần build lại. Chọn khu chỉ tải dữ liệu khu đó, giới hạn di chuyển, giải phóng scene trước khi chuyển xong. Tối ưu mobile bằng instancing, batching, culling, DPR và cập nhật theo khoảng cách.

Kiểm chứng: 63/63 unit test, production build, chuyển 5 khu/quay lại, tắt cấu hình, hai tay mobile và hai MP3 local đều đạt. Profile cảnh khởi đầu trên Chromium mô phỏng mobile khoảng 92 → 7 ms/frame; chưa đo điện thoại thật.

## Sửa cách diễn giải vị trí OSM — 2026-11-18

Không yêu cầu người dùng cung cấp lại tọa độ. Đã lấy thêm cổng/đèn không tên từ OSM, dùng node entrance=main cho Ga và barrier=gate cho Quốc Học. Tách điểm/cổng được map với nhãn khuôn viên chưa xác nhận cổng; sửa centroid bệnh viện nhiều vùng và lấy đèn từ node thay cho offset thủ công. Đường nhánh trong bounds đã được đưa vào scene. Nút Đối chiếu OSM mở vị trí xe trực tiếp trên nguồn.

Kiểm toán và ID xem src/geography/README.md. 23/23 unit test; production /assets/index-C-4KKLUK.js không lỗi asset/JS; 5 tour đi đến cuối. Kiến trúc/chiều rộng thiếu tag/cao độ/cây vẫn là ước lượng, không tuyên bố đã tái hiện đúng hiện trạng toàn bộ.

## Chuyển sang tuyến GPS/OSM thật — 2026-11-18

Entry hiện dùng GeographicWorld, GeographicTraffic và geoDistricts (src/geography/map.js). Snapshot OSM 7.423 đối tượng đã tải thành công, dùng offline. Đường/sông/footprint/biển và minimap dùng chung phép chiếu từ GPS; không còn dùng bố cục hai đường thẳng prototype trong luồng chính.

Lê Lợi từ phía ga tới Hà Nội/đầu Phú Xuân khoảng 1,16 km. Có biển Ga Huế, Quốc Học, Bia Quốc Học, Hai Bà Trưng, UBND, bệnh viện, Phú Xuân, Gỗ Lim, Trường Tiền, Kỳ Đài, Ngọ Môn; cùng biển giao Lê Lợi × Hà Nội và cột đèn minh họa. Các tuyến bờ Bắc/cầu/Hoàng thành cũng lấy từ đường OSM. Footprint 370 công trình, cây và mặt đứng dựng ước lượng.

Đọc src/geography/README.md để biết ID, nguồn, giới hạn và cách bổ sung. Dữ liệu tọa độ không đồng nghĩa mô hình kiến trúc chính xác; chiều rộng thiếu tag, cao độ, cây/cổng/mặt đứng và đèn vẫn là ước lượng. Không đánh dấu toàn bộ ý tưởng hoàn tất.

Kiểm chứng: 19/19 unit test, build thành công. 5 tour địa lý chạy đến đích (tắt traffic để kiểm hình học), production smoke audio/mobile và CDP two-thumb đều đạt. Ảnh hue-osm-station.png và hue-osm-quoc-hoc.png. Các script kiểm thử prototype cũ có vị trí/hành trình ngắn không còn đại diện cho world mới; dùng inspect-geography.mjs và inspect-production.mjs.

## Điều khiển hai tay trên điện thoại — 2026-11-17

- Thay D-pad bằng joystick analog bên trái. Kéo lên để đạp, chéo/ngang để vừa đạp vừa cua, kéo xuống để lùi. Có deadzone, giới hạn độ kéo; thả cần thì ngừng đạp và xe trôi theo quán tính.
- Tay phải vuốt pad Vuốt nhìn để xoay camera; nút Phanh riêng bên phải. Vẫn có thể kéo trực tiếp trên cảnh và dùng WASD/Space trên desktop.
- TouchControls quản lý pointerId độc lập cho cần lái/camera/phanh, pointer capture khi kéo ngoài pad, nhả theo pointerup/cancel/lostcapture, reset khi blur/ẩn trang/chuyển khu vực. Không để thả tay này xóa input của tay kia.
- Chặn user-select, WebKit touch-callout, selectstart/contextmenu trên vùng chơi và điều khiển; giữ input âm lượng hoạt động. Bố trí minimap lên trên tay trái và tốc độ giữa hai tay.
- Kiểm chứng: 14/14 unit test, build thành công. Chromium multi-touch thật qua CDP trên dev và dist: hai ngón đồng thời, analog throttle/steer và camera yaw đều đổi, thả trái vẫn xoay phải, không chọn chữ khi giữ >1 giây, kéo vượt pad/cancel/blur nhả đúng, phanh về 0. Portrait không tràn, minimap không đè joystick. Chưa thử bằng thiết bị Android/iOS vật lý.
- npm run test:production đạt trên bundle /assets/index-CnyxMH4y.js; menu/nhạc/nhạc quán/mute vẫn đạt, không pageerror/asset lỗi.
- Script: node tool/browser-test/inspect-two-thumb.mjs http://127.0.0.1:4173/; ảnh two-thumb-production.png.

## Sửa entry mobile/audio và kiểm chứng production — 2026-11-17

Nguyên nhân đã xác nhận: main.js/CityGame/styles/viewport đang ở bản trước tích hợp, dù MobileUI và CityAudio vẫn có trên đĩa. Unit test module riêng không phát hiện được việc không nối chúng vào app. Đã khôi phục import/khởi tạo MobileUI và CityAudio, nối update/collision âm thanh, bổ sung markup điều khiển và tách CSS mobile vào src/mobile.css.

Giữ nguyên dev host 0.0.0.0 và port 3000 hiện có. Chạy bản dist bằng `npm run preview` tại port 4173. Mở từ điện thoại cùng mạng bằng địa chỉ Network do Vite in ra; AudioContext cần thao tác Bật nhạc và môi trường trình duyệt cho phép. Khóa ngang tùy khả năng trình duyệt.

Kiểm chứng cuối: npm test đạt 12/12, npm run build thành công (33 module). `npm run test:production` đạt trên http://127.0.0.1:4173, xác minh entry /assets/index-*.js, menu mobile/desktop, layout ngang, fallback xoay màn hình, AudioContext running và tín hiệu RMS > 0 sau nhấn bật, nhạc quán gần/xa và mute suspended. Không pageerror, không asset JS/CSS/GLB lỗi. Test này chỉ thao tác bundle thực, không import src/main.js trong production.

Để chạy lại: `npm run build`, `npm run preview` ở terminal thứ nhất; `npm run test:production` ở terminal thứ hai. Script dùng Chromium ở đường dẫn máy hiện tại; có thể đặt CHROME_PATH và TEST_BASE_URL để thay đổi. Ảnh: tool/browser-test/production-mobile-portrait.png và production-mobile-landscape.png.

## Đường rộng và giao thông — 2026-11-17

- Đường chính rộng 14 m (trước 6 m), hai chiều xe chạy riêng; vỉa hè 5 m. Dời tuyến, quán/nhà, cây và vị trí landmark theo cùng bố cục mở rộng; không đổi kiến trúc các landmark khác.
- Trường Tiền rộng 16 m (trước 7 m), dài 48 m (trước 31 m), mặt cầu cao 2.18 m; vòm cao thêm 5.2 m, hai đường dốc dài 10 m nối liên tục với mặt đường. Lối đi bộ hai bên tách khỏi làn xe. Đây là kích thước gameplay prototype, không phải số đo cầu thật.
- Thông số chung: src/world/cityLayout.js. Chỗ đặt landmark trong DetailedWorld, tuyến/spawn trong districts.js, giao thông trong TrafficSystem.
- 12 mặt tiền quán ăn/cà phê/nhà hàng, mái hiên sọc, bàn ghế, bát ăn và khách ngồi. Nội dung mang không khí Huế, chưa phải cơ sở kinh doanh thực tế đã xác minh.
- 10 ô tô, 4 xe máy, 20 người đi bộ chuyển động. Ô tô GLB; xe máy/người dựng hình học. Xe theo làn, giữ khoảng cách đơn giản; tour giảm tốc khi thấy NPC phía trước. Khi đến khu vực mới dọn NPC gần spawn và có thời gian miễn va chạm ngắn.
- Va chạm dùng kiểm tra quét tương đối giữa hai bước mô phỏng, có lọc chênh cao. Khi tông: xe dừng, ngắt tự lái, rung/ngiêng nhẹ, vòng sáng và tia va chạm, cảnh báo 4 giây nhắc đi phải và cẩn thận; sau phục hồi đạp tiếp. Cooldown tránh báo liên tục. Đây là hiệu ứng arcade, không phải mô phỏng tai nạn rigid-body hoặc luật giao thông đầy đủ.
- Kiểm chứng: 9/9 unit test; browser có đủ NPC, xe chuyển động, cảnh báo hiển thị thực tế, xe dừng/không báo lặp và phục hồi được. Cả 5 tour hoàn thành với giao thông hoạt động; desktop/mobile vẫn đạt, không pageerror.
- Ảnh: tool/browser-test/hue-street-life.png, hue-wide-bridge.png, hue-traffic-collision.png. Script: inspect-traffic.mjs.

## Gameplay theo khu vực — 2026-11-17

- Entry dùng CityGame, TouringBike, BicycleMotion và DetailedWorld. Không còn dựng hai world qua ScenicGame trong luồng chạy chính.
- Năm khu vực độc lập đặt trong src/routes/districts.js: Quốc Học/Lê Lợi, công viên bờ Nam, Trường Tiền, Trần Hưng Đạo/bờ Bắc, Kỳ Đài/Ngọ Môn.
- Chọn khu vực để đến ngay; nút Tham quan khởi hành từ đầu tuyến của khu vực đó. Đến cuối tuyến xe dừng; WASD/Space giành quyền điều khiển tự do.
- Xe chạy bước cố định 120 Hz, trả lái/tăng tốc mượt, phanh, nghiêng theo cua. Camera bám theo thời gian và nhìn trước; có kiểm tra vật cản camera.
- Có giới hạn mặt nước, footprint vật cản, cao độ mặt cầu và dốc xuống bờ Bắc. Đây là va chạm đơn giản theo footprint, chưa phải rigid-body physics.
- Minimap là sơ đồ của world hiện tại, không phải bản đồ GPS. Phóng to bằng M hoặc nút trên bản đồ.
- Xe đạp và cây GLB tải từ Google GStatic; nguồn ghi tại src/assets/models/SOURCES.md. Có mô hình dự phòng khi tải asset thất bại. Cây là broadleaf demo, chưa phải bộ cây bản địa Huế.

## Chạy local

```bash
npm install
npm run dev
```

## Kiểm tra

```bash
npm test
npm run build
```

## Điều khiển

- `W/S` hoặc mũi tên lên/xuống: tiến/lùi.
- `A/D` hoặc mũi tên trái/phải: rẽ.
- Kéo chuột: xoay camera.
- `Space`: phanh.
- `T`: bật/tắt tự lái tham quan khu vực đang chọn.
- `M`: mở rộng/thu nhỏ minimap.
- `R`: về đầu khu vực hiện tại.
- Trên mobile: joystick bên trái để đạp/rẽ/lùi, vùng vuốt camera và nút phanh bên phải.

## Mở rộng địa điểm

Tạo thư mục mới trong `src/landmarks`, export module gồm `id`, `title`, `position`, `radius`, `description`, `create`, rồi đăng ký tại `src/landmarks/registry.js`. Không sửa module địa điểm cũ.

Thêm khu vực bằng một cấu hình mới trong src/routes/districts.js gồm id/title/subtitle/color/spawn/path/landmarks. Kiểm tra spawn và toàn tuyến tránh footprint; bảng khu vực và minimap tự đọc cấu hình. Tuyến hiện dùng spline trong từng khu, chưa có định tuyến graph đường giữa mọi cặp địa điểm.

## Giới hạn hiện tại

Bố cục và tỷ lệ vẫn là prototype, chưa nhập OSM/GPS. Ba landmark được dựng hình học dựa ảnh tham khảo; chưa đạt mô hình kiến trúc đo đạc hoặc chất lượng tổng thể của game gốc. Chưa có âm thanh. Trạng thái ý tưởng tiếp tục Implementing cho tới khi hoàn thành yêu cầu thành phố thật.

## Kết quả kiểm tra

- `npm test`: đạt 9/9, gồm tăng tốc/phanh, độ ổn định giữa 60/120 Hz, trả lái, khu vực, registry, va chạm liên tục và dốc cầu.
- Playwright/Chromium: chọn đủ 5 khu vực, tốc độ đạp tay đạt 20 km/h trong ca thử, phanh về 0, tự lái trên cầu, WASD giành lại điều khiển, GLB tải đủ, mobile 390×844 không tràn ngang; không có pageerror.
- Chạy chính bộ mô phỏng game ở fixed step: cả 5 tuyến tự lái đến cuối và dừng thành công.
- Ảnh kiểm chứng: tool/browser-test/hue-city-initial.png, hue-city-bridge.png, hue-city-mobile.png. Script: node tool/browser-test/inspect-hue.mjs (cần dev server port 5173 và Chromium ở đường dẫn cấu hình trong script).
