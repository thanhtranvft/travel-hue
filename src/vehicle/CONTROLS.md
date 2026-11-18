# Chỉnh WASD — 2026-11-18

Phản hồi: lái chậm, đảo A/D có lúc còn đi theo hướng cũ. Kiểm tra source thấy steer làm trơn rate 8, camera orbit giữ nguyên sau kéo, S đổi sang lùi trong khi người chơi có thể không nhận biết.

- Đổi dấu steer xóa góc lái cũ trước khi nội suy, rate 24 khi lái, 18 khi trả lái.
- Tăng lực đạp từ 3.4 lên 4.5; S khi đang tiến dùng lực hãm 7 trước khi chuyển sang lùi. Lùi vẫn theo động học xe đạp, không đổi quy ước camera hay vật lý tùy heading.
- Nhận phím theo event.code để layout/Shift không ảnh hưởng. Bỏ qua input/select/textarea/contenteditable. Giữ reset khi blur/tab ẩn.
- Khi bắt đầu nhấn phím lái mà không đang kéo camera, xóa orbit và đưa camera về sau xe; camera bám hướng nhanh hơn. A/D vẫn là đánh lái tương đối với xe, không dịch ngang theo trục bản đồ.

Kiểm tra: 6 unit test đáp ứng/ổn định 60–120 Hz đạt; browser nhấn W/A/D thật, A→D và D→A đổi yaw ngay tick kế tiếp, orbit trước xe được trả về sau; cả 5 tour hoàn thành (tắt traffic để kiểm riêng bộ điều khiển). Build thành công. Chưa so sánh lại game gốc trong lượt này vì thư mục src tại đường dẫn E: không tồn tại khi truy cập.
