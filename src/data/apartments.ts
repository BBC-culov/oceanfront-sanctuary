import aptOceano1 from "@/assets/apt-oceano-1.jpg";
import aptOceano2 from "@/assets/apt-oceano-2.jpg";
import aptOceano3 from "@/assets/apt-oceano-3.jpg";
import aptBrezza1 from "@/assets/apt-brezza-1.jpg";
import aptBrezza2 from "@/assets/apt-brezza-2.jpg";
import aptBrezza3 from "@/assets/apt-brezza-3.jpg";
import aptTramonto1 from "@/assets/apt-tramonto-1.jpg";
import aptTramonto2 from "@/assets/apt-tramonto-2.jpg";
import aptTramonto3 from "@/assets/apt-tramonto-3.jpg";

export interface Apartment {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  cover: string;
  gallery: string[];
  guests: number;
  bedrooms: number;
  bathrooms: number;
  sqm: number;
  services: string[];
  address: string;
  mapQuery: string;
}

const apartments: Apartment[] = [
  {
    slug: "oceano",
    name: "Suite Oceano",
    tagline: "Vista mare panoramica",
    description:
      "Situata al primo piano con affaccio diretto sull'Atlantico, la Suite Oceano offre un'esperienza immersiva tra luce naturale e brezza marina. Il soggiorno open-space con cucina a isola in marmo bianco si apre su un'ampia terrazza fronte oceano, perfetta per colazioni al tramonto. La camera da letto matrimoniale, con lenzuola in lino e pavimento in legno naturale, regala un'atmosfera intima e rilassante.",
    cover: aptOceano1,
    gallery: [aptOceano1, aptOceano2, aptOceano3],
    guests: 4,
    bedrooms: 1,
    bathrooms: 1,
    sqm: 65,
    services: [
      "Vista oceano",
      "Terrazza privata",
      "Cucina attrezzata",
      "Wi-Fi ad alta velocità",
      "Aria condizionata",
      "Smart TV",
      "Biancheria premium",
      "Parcheggio incluso",
    ],
    address: "Rua da Praia, Sal Rei, Boa Vista, Capo Verde",
    mapQuery: "Sal+Rei+Boa+Vista+Cape+Verde",
  },
  {
    slug: "brezza",
    name: "Villa Brezza",
    tagline: "Giardino tropicale & piscina",
    description:
      "Un rifugio a piano terra immerso in un lussureggiante giardino tropicale con accesso diretto alla piscina. Villa Brezza unisce l'eleganza del design contemporaneo al calore dei materiali naturali: legno, rattan e pietra locale. L'ampio soggiorno si apre su un patio coperto ideale per pranzi all'ombra delle palme. Il bagno spa con vasca free-standing e doccia rain è un'oasi di benessere.",
    cover: aptBrezza1,
    gallery: [aptBrezza1, aptBrezza2, aptBrezza3],
    guests: 6,
    bedrooms: 2,
    bathrooms: 2,
    sqm: 95,
    services: [
      "Accesso piscina",
      "Giardino privato",
      "Cucina completa",
      "Wi-Fi ad alta velocità",
      "Aria condizionata",
      "Vasca idromassaggio",
      "Barbecue esterno",
      "Biancheria premium",
    ],
    address: "Estrada da Praia de Chaves, Boa Vista, Capo Verde",
    mapQuery: "Praia+de+Chaves+Boa+Vista+Cape+Verde",
  },
  {
    slug: "tramonto",
    name: "Penthouse Tramonto",
    tagline: "Rooftop con vista infinita",
    description:
      "All'ultimo piano, il Penthouse Tramonto è il gioiello della collezione BAZHOUSE. Una terrazza panoramica a 360° con piscina infinity affacciata sull'oceano, dove ogni sera il cielo si tinge d'oro. Interni sofisticati con cucina in marmo nero, illuminazione d'atmosfera e camera padronale con vetrate a tutta altezza. Un'esperienza esclusiva per chi cerca il lusso senza compromessi.",
    cover: aptTramonto1,
    gallery: [aptTramonto1, aptTramonto2, aptTramonto3],
    guests: 4,
    bedrooms: 2,
    bathrooms: 2,
    sqm: 120,
    services: [
      "Piscina privata",
      "Terrazza panoramica",
      "Cucina gourmet",
      "Wi-Fi ad alta velocità",
      "Aria condizionata",
      "Home cinema",
      "Concierge dedicato",
      "Transfer aeroporto",
    ],
    address: "Avenida dos Hotéis, Sal Rei, Boa Vista, Capo Verde",
    mapQuery: "Sal+Rei+Boa+Vista+Cape+Verde",
  },
];

export default apartments;
