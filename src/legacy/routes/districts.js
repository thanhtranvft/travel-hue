// Local prototype coordinates. Replace geometry with surveyed/OSM data at the data layer.
export const districts = [
  {id:'quoc-hoc',title:'Quốc Học · Lê Lợi',subtitle:'Đại lộ ven sông · quán ăn Huế',color:'#e7bd77',spawn:{x:-53,z:35.5,heading:Math.PI/2},path:[[-65,35.5],[-53,35.5],[-40,35.5],[-23,35.5],[-5,35.5],[0,35.5]],landmarks:['quoc-hoc']},
  {id:'south-bank',title:'Công viên bờ Nam',subtitle:'Lối dạo bên sông Hương',color:'#8ec0a0',spawn:{x:-55,z:18,heading:Math.PI/2},path:[[-65,18],[-55,18],[-40,18],[-25,18],[-10,18],[0,18]],landmarks:[]},
  {id:'truong-tien',title:'Cầu Trường Tiền',subtitle:'Cầu rộng · vòm cao · ngắm sông',color:'#8db9d6',spawn:{x:12.5,z:34,heading:Math.PI},path:[[12.5,34],[12.5,26],[12.5,14],[12.5,0],[12.5,-14],[12.5,-26],[12.5,-34]],landmarks:['truong-tien']},
  {id:'north-bank',title:'Trần Hưng Đạo',subtitle:'Dạo phố phía bờ Bắc',color:'#ce9da8',spawn:{x:0,z:-35.5,heading:-Math.PI/2},path:[[4,-35.5],[0,-35.5],[-12,-35.5],[-28,-35.5],[-43,-35.5],[-60,-35.5]],landmarks:[]},
  {id:'imperial-city',title:'Kỳ Đài · Ngọ Môn',subtitle:'Quảng trường phía trước Đại Nội',color:'#c7b083',spawn:{x:-12,z:-45,heading:-Math.PI/2},path:[[-12,-45],[-18,-45],[-28,-45],[-40,-45],[-47,-46],[-49,-50],[-49,-59],[-49,-69]],landmarks:['ky-dai','ngo-mon']}
];
export const getDistrict=id=>districts.find(d=>d.id===id);
