# Rượt bắt tốc độ: khám phá Huế và tranh tài

Áp dụng map `quoc-hoc`, `quang-trung`; 2–10 người bắt đầu sau 4 giây. Một người vẫn dạo phố trong khi chờ bạn. Toàn khu vực luôn đi lại được.

## Nhịp vòng chơi

1. **Khám phá 60s:** đến địa danh gần nhóm; ghé một lần/ván +120 điểm sau khi đã di chuyển ít nhất 12m từ điểm bắt đầu. Không đổi vai khi chạm nhau.
2. **Tranh tài 45s:** 1 Người Săn với 2–4 người, 2 Người Săn với 5–10 người. Chạm để đổi vai +100đ, Người Săn nhanh hơn 8%. Điểm sinh tồn chỉ tính khi thực sự di chuyển và có Người Săn đang di chuyển trong 40m; trong điểm hẹn tính x2. Giữ close-call và các vật phẩm Q/E/F hiện có.
3. **Hợp tác:** 45s với 2 người, thêm 1,5s/người tiếp theo. Cùng gom đèn lồng hoặc hoa sen trong 70m quanh điểm hẹn gần nhóm. Mục tiêu 2 món/người, tối thiểu 4 và tối đa 15, giới hạn bởi số điểm đường hợp lệ thực có. Mỗi món +25đ; hoàn thành thưởng thêm 150đ cho người đã đóng góp. Không rượt bắt trong giai đoạn này.
4. **Tổng kết 10s:** tổng điểm và các danh hiệu khám phá, đồng hành, tranh tài nếu có thành tích. Các hoạt động này là luật game, không đại diện nghi lễ lịch sử.

Điểm hẹn được chiếu vào đường hiện có trong phạm vi 90m của địa danh, rồi chọn gần nhóm. Không dùng tâm tòa nhà làm mục tiêu, không đổi tọa độ công trình. Mỗi lần chuyển sang hợp tác chọn lại điểm gần nhóm. Bốn bùa tăng tốc chung và biểu cảm vẫn dùng như trước; vật phẩm Q/E/F chỉ dùng trong tranh tài.

## Cấu trúc

- `journey-config.json`: thời lượng, điểm, bán kính, sĩ số, danh sách địa danh, tên nhiệm vụ.
- `journeyRoadPoints.js`: lấy mẫu đường hợp lệ và cao độ hiện hành.
- `constants.js`: đọc JSON, danh mục vật phẩm và biểu cảm.
- `serverRoomState.js`: kiểm soát giai đoạn, điểm, đổi vai, vật phẩm, nhiệm vụ và tổng kết.
- `index.js`: kết nối client với registry/network.
- `TagChaseHUD.js`, `tag-chase.css`: HUD theo giai đoạn, nút đọc địa danh theo nhu cầu.
- `TagChaseWorldFX.js`: hiệu ứng điểm hẹn, vật phẩm, vai trò và hoàn thành hợp tác.

Không thêm dependency. Chỉnh JSON cần khởi động lại server; bản production cần build lại frontend. Thời lượng/thang điểm hiện là cấu hình thử nghiệm, cần phản hồi người chơi trước khi coi đã cân bằng.

Kiểm tra: `node --test tests/hue-journey.test.js tests/tag-chase-mode.test.js tests/game-modes-registry.test.js tests/online.test.js tests/session-persistence.test.js`.
