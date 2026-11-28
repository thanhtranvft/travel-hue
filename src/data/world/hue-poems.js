export const HUE_POEMS = [
  {
    id: "chieu-song-huong",
    title: "Chiều Bên Sông Hương",
    subtitle: "Nhâm nhi tách cà phê nhìn dòng nước lững lờ",
    verses: [
      "Nắng chiều buông nhẹ nhịp cầu,",
      "Hương Giang lặng lẽ một màu ngọc xanh.",
      "Tách cà phê ấm trên cành,",
      "Nghe chuông Thiên Mụ vọng thanh bên trời.",
      "Gió đùa tán phượng rơi rơi,",
      "Huế ru lòng khách thảnh thơi tháng ngày.",
    ],
  },
  {
    id: "pho-co-trang-tien",
    title: "Nhịp Cầu Tràng Tiền",
    subtitle: "Khúc hoài niệm sáu vài mười hai nhịp",
    verses: [
      "Sáu vài mười hai nhịp cong,",
      "Soi nghiêng bóng nước xuôi dòng về đâu.",
      "Áo dài trắng lướt qua cầu,",
      "Hương trầm thoang thoảng gợi sầu cố đô.",
      "Chậm môi nhấp ngụm cà phê,",
      "Nghe từng giọt nắng gọi về bình yên.",
    ],
  },
  {
    id: "duoi-tan-phuong-quoc-hoc",
    title: "Sân Trường Quốc Học",
    subtitle: "Góc phố Lê Lợi nhuộm sắc đỏ tường vôi",
    verses: [
      "Tường vôi đỏ thắm rêu phong,",
      "Hàng cây xanh mát soi lòng phố xưa.",
      "Ve ngân gọi nắng ban trưa,",
      "Ly nâu đá lạnh vừa đưa hương nồng.",
      "Ai qua bến vắng bên sông,",
      "Dừng chân nghe Huế thì thầm lời thơ.",
    ],
  },
  {
    id: "nui-ngu-suong-som",
    title: "Núi Ngự Sương Mờ",
    subtitle: "Bình minh dịu dàng trên đất Kinh Kỳ",
    verses: [
      "Sương giăng đỉnh Ngự mờ xa,",
      "Thuyền rồng lướt nhẹ ngân nga điệu hò.",
      "Phố khuya vừa tỉnh giấc mơ,",
      "Mùi cà phê rang quyện tơ nắng vàng.",
      "Ngồi nghe gió thổi nhẹ nhàng,",
      "Thấy từng con chữ sang trang dịu hiền.",
    ],
  },
  {
    id: "hoang-hon-vi-da",
    title: "Nắng Vàng Vĩ Dạ",
    subtitle: "Phút lắng đọng giữa chiều xứ Huế",
    verses: [
      "Gió theo lối gió mây đường,",
      "Nắng hàng cau rọi bên tường rêu xanh.",
      "Quán quen góc phố yên lành,",
      "Giọt cà phê nhỏ ngọt thanh nỗi niềm.",
      "Thả hồn theo khúc nhạc êm,",
      "Huế thương ở lại bên thềm thời gian.",
    ],
  },
  {
    id: "dem-ca-hue-tren-song",
    title: "Điệu Hò Cố Đô",
    subtitle: "Một thoáng thơ bên hiên quán nhỏ",
    verses: [
      "Đèn hoa đăng rọi mặt hồ,",
      "Giọng hò mái đẩy vương tơ mạn thuyền.",
      "Phố phường lắng lại bình yên,",
      "Chén trà ly đắng dịu hiền câu ca.",
      "Dẫu đi muôn nẻo đường xa,",
      "Vẫn thương một Huế đậm đà tình quê.",
    ],
  },
];

export function pickHuePoemIndex(seedText = "", currentIndex = -1) {
  if (!HUE_POEMS.length) return 0;
  let hash = 0;
  const text = String(seedText || "");
  for (let i = 0; i < text.length; i++) {
    hash = (hash * 31 + text.charCodeAt(i)) >>> 0;
  }
  let idx = hash % HUE_POEMS.length;
  if (idx === currentIndex && HUE_POEMS.length > 1) {
    idx = (idx + 1) % HUE_POEMS.length;
  }
  return idx;
}
