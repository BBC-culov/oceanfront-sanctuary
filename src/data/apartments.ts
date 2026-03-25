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
  videos?: string[];
  guests: number;
  bedrooms: number;
  bathrooms: number;
  sqm: number;
  services: string[];
  address: string;
  mapQuery: string;
  category: "residence" | "penthouse" | "compact";
}

const apartments: Apartment[] = [
  {
    slug: "freedom",
    name: "Freedom Residence",
    tagline: "Vista mare frontale",
    description:
      "Affaccio diretto sull'Atlantico, la Freedom Residence offre un'esperienza immersiva tra luce naturale e brezza marina. Il soggiorno open-space con cucina attrezzata si apre su una vista panoramica sull'oceano. Un rifugio elegante per chi cerca libertà e comfort.",
    cover: aptOceano1,
    gallery: [aptOceano1, aptOceano2, aptOceano3],
    guests: 4,
    bedrooms: 1,
    bathrooms: 1,
    sqm: 65,
    services: [
      "Vista oceano frontale",
      "Cucina attrezzata",
      "Wi-Fi ad alta velocità",
      "Aria condizionata",
      "Smart TV",
      "Biancheria premium",
      "Parcheggio incluso",
    ],
    address: "Praia Cabral, Sal Rei, Boa Vista, Capo Verde",
    mapQuery: "Sal+Rei+Boa+Vista+Cape+Verde",
    category: "residence",
  },
  {
    slug: "relax",
    name: "Relax Residence",
    tagline: "Vista mare frontale",
    description:
      "Progettata per il massimo relax, questa residenza unisce l'eleganza del design contemporaneo al calore dei materiali naturali. Vista panoramica sull'oceano, interni curati nei dettagli e un'atmosfera che invita al riposo e alla contemplazione.",
    cover: aptBrezza1,
    gallery: [aptBrezza1, aptBrezza2, aptBrezza3],
    guests: 4,
    bedrooms: 1,
    bathrooms: 1,
    sqm: 65,
    services: [
      "Vista oceano frontale",
      "Cucina attrezzata",
      "Wi-Fi ad alta velocità",
      "Aria condizionata",
      "Smart TV",
      "Biancheria premium",
      "Parcheggio incluso",
    ],
    address: "Praia Cabral, Sal Rei, Boa Vista, Capo Verde",
    mapQuery: "Sal+Rei+Boa+Vista+Cape+Verde",
    category: "residence",
  },
  {
    slug: "inspiration",
    name: "Inspiration Residence",
    tagline: "Vista mare frontale",
    description:
      "Un luogo dove trovare ispirazione, circondati dalla bellezza dell'oceano. Interni luminosi, arredi contemporanei e una vista che toglie il fiato. La Inspiration Residence è pensata per chi vuole vivere Boa Vista con stile.",
    cover: aptOceano2,
    gallery: [aptOceano2, aptOceano3, aptOceano1],
    guests: 4,
    bedrooms: 1,
    bathrooms: 1,
    sqm: 65,
    services: [
      "Vista oceano frontale",
      "Cucina attrezzata",
      "Wi-Fi ad alta velocità",
      "Aria condizionata",
      "Smart TV",
      "Biancheria premium",
      "Parcheggio incluso",
    ],
    address: "Praia Cabral, Sal Rei, Boa Vista, Capo Verde",
    mapQuery: "Sal+Rei+Boa+Vista+Cape+Verde",
    category: "residence",
  },
  {
    slug: "ocean-view",
    name: "Ocean View Residence",
    tagline: "Vista mare frontale",
    description:
      "Il nome dice tutto: una vista oceano senza compromessi. La Ocean View Residence è il punto di osservazione privilegiato sull'Atlantico, dove ogni momento della giornata è scandito dalla luce e dai colori del mare.",
    cover: aptBrezza2,
    gallery: [aptBrezza2, aptBrezza3, aptBrezza1],
    guests: 4,
    bedrooms: 1,
    bathrooms: 1,
    sqm: 65,
    services: [
      "Vista oceano frontale",
      "Cucina attrezzata",
      "Wi-Fi ad alta velocità",
      "Aria condizionata",
      "Smart TV",
      "Biancheria premium",
      "Parcheggio incluso",
    ],
    address: "Praia Cabral, Sal Rei, Boa Vista, Capo Verde",
    mapQuery: "Sal+Rei+Boa+Vista+Cape+Verde",
    category: "residence",
  },
  {
    slug: "adventure",
    name: "Adventure Residence",
    tagline: "Vista mare frontale",
    description:
      "Per chi vive ogni viaggio come un'avventura. Posizione strategica, comfort premium e vista frontale sull'oceano. La Adventure Residence è la base perfetta per esplorare Boa Vista senza rinunciare al lusso.",
    cover: aptOceano3,
    gallery: [aptOceano3, aptOceano1, aptOceano2],
    guests: 4,
    bedrooms: 1,
    bathrooms: 1,
    sqm: 65,
    services: [
      "Vista oceano frontale",
      "Cucina attrezzata",
      "Wi-Fi ad alta velocità",
      "Aria condizionata",
      "Smart TV",
      "Biancheria premium",
      "Parcheggio incluso",
    ],
    address: "Praia da Cruz, Sal Rei, Boa Vista, Capo Verde",
    mapQuery: "Sal+Rei+Boa+Vista+Cape+Verde",
    category: "residence",
  },
  {
    slug: "coral",
    name: "Coral Residence",
    tagline: "Vista mare frontale",
    description:
      "Ispirata ai colori e alle forme dei fondali di Boa Vista, la Coral Residence è un appartamento dal design raffinato con vista panoramica sull'Atlantico. Interni caldi, materiali naturali e un'atmosfera unica.",
    cover: aptBrezza3,
    gallery: [aptBrezza3, aptBrezza1, aptBrezza2],
    guests: 4,
    bedrooms: 1,
    bathrooms: 1,
    sqm: 65,
    services: [
      "Vista oceano frontale",
      "Cucina attrezzata",
      "Wi-Fi ad alta velocità",
      "Aria condizionata",
      "Smart TV",
      "Biancheria premium",
      "Parcheggio incluso",
    ],
    address: "Praia da Cruz, Sal Rei, Boa Vista, Capo Verde",
    mapQuery: "Sal+Rei+Boa+Vista+Cape+Verde",
    category: "residence",
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
    category: "penthouse",
  },
  {
    slug: "duna",
    name: "Duna Residence",
    tagline: "Vista mare laterale",
    description:
      "Intima ed elegante, la Duna Residence offre una vista laterale sul mare e un ambiente raccolto e raffinato. Perfetta per chi cerca un soggiorno esclusivo in uno spazio più contenuto ma curato in ogni dettaglio, con lo stesso standard premium delle altre residenze Bazhouse.",
    cover: aptOceano1,
    gallery: [aptOceano1, aptBrezza1, aptOceano2],
    guests: 2,
    bedrooms: 1,
    bathrooms: 1,
    sqm: 45,
    services: [
      "Vista mare laterale",
      "Cucina attrezzata",
      "Wi-Fi ad alta velocità",
      "Aria condizionata",
      "Smart TV",
      "Biancheria premium",
    ],
    address: "Praia Cabral, Sal Rei, Boa Vista, Capo Verde",
    mapQuery: "Sal+Rei+Boa+Vista+Cape+Verde",
    category: "compact",
  },
];

export default apartments;
