export const PROVINCES = [
  {
    id: 1,
    name: 'Koshi Pradesh',
    districts: [
      'Taplejung', 'Sankhuwasabha', 'Solukhumbu', 'Okhaldhunga', 'Khotang',
      'Bhojpur', 'Dhankuta', 'Tehrathum', 'Panchthar', 'Ilam', 'Jhapa',
      'Morang', 'Sunsari', 'Udayapur',
    ],
  },
  {
    id: 2,
    name: 'Madhesh Pradesh',
    districts: [
      'Saptari', 'Siraha', 'Dhanusa', 'Mahottari', 'Sarlahi', 'Rautahat',
      'Bara', 'Parsa',
    ],
  },
  {
    id: 3,
    name: 'Bagmati Pradesh',
    districts: [
      'Sindhuli', 'Makwanpur', 'Ramechhap', 'Dolakha', 'Bhaktapur', 'Dhading',
      'Kathmandu', 'Kavrepalanchok', 'Lalitpur', 'Nuwakot', 'Rasuwa',
      'Sindhupalchok', 'Chitwan',
    ],
  },
  {
    id: 4,
    name: 'Gandaki Pradesh',
    districts: [
      'Baglung', 'Gorkha', 'Kaski', 'Lamjung', 'Manang', 'Mustang', 'Myagdi',
      'Nawalpur', 'Parbat', 'Syangja', 'Tanahun',
    ],
  },
  {
    id: 5,
    name: 'Lumbini Pradesh',
    districts: [
      'Arghakhanchi', 'Banke', 'Bardiya', 'Dang', 'Pyuthan', 'Rolpa',
      'East Rukum', 'Gulmi', 'Kapilvastu', 'Parasi', 'Palpa', 'Rupandehi',
    ],
  },
  {
    id: 6,
    name: 'Karnali Pradesh',
    districts: [
      'Western Rukum', 'Salyan', 'Dolpa', 'Humla', 'Jumla', 'Kalikot',
      'Mugu', 'Surkhet', 'Dailekh', 'Jajarkot',
    ],
  },
  {
    id: 7,
    name: 'Sudurpashchim Pradesh',
    districts: [
      'Kailali', 'Achham', 'Doti', 'Bajhang', 'Bajura', 'Kanchanpur',
      'Dadeldhura', 'Baitadi', 'Darchula',
    ],
  },
];

export const PROVINCE_NAMES = PROVINCES.map((p) => p.name);

export function getDistricts(provinceName) {
  const p = PROVINCES.find((pr) => pr.name === provinceName);
  return p ? p.districts : [];
}
