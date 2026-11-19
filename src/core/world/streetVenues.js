export const restaurantZones = [-1, 1].flatMap((side) =>
  [-105, -85, -15, 35, 55, 95].map((x, index) => ({
    id: `venue-${side}-${index}`,
    x,
    z: side * 47,
    side,
    title: ["Bún bò Huế", "Cơm hến", "Cà phê Sông Hương", "Nhà hàng An Nhiên"][
      index % 4
    ],
  })),
);
