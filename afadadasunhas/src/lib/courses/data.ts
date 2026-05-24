export type Video = {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  duration: string;
  src: string;
};

export type Section = {
  id: string;
  name: string;
  cover: string;
  description: string;
  videos: Video[];
};

const cover = (q: string) => `https://images.unsplash.com/${q}?auto=format&fit=crop&w=1280&q=80`;

export const sections: Section[] = [
  {
    id: "fundamentos",
    name: "Fundamentos da Manicure",
    cover: cover("photo-1604654894610-df63bc536371"),
    description: "Aprenda do zero a anatomia das unhas, ergonomia e biossegurança.",
    videos: [
      { id: "f1", title: "Boas-vindas e materiais essenciais", description: "Tour pelos itens indispensáveis no seu kit.", thumbnail: cover("photo-1604654894610-df63bc536371"), duration: "08:24", src: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4" },
      { id: "f2", title: "Anatomia da unha", description: "Estruturas, crescimento e cuidados básicos.", thumbnail: cover("photo-1632345031435-8727f6897d53"), duration: "12:01", src: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4" },
      { id: "f3", title: "Biossegurança no atendimento", description: "Esterilização, EPIs e protocolos.", thumbnail: cover("photo-1610992015734-2331cbcebbb8"), duration: "10:42", src: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4" },
    ],
  },
  {
    id: "russa",
    name: "Técnica Russa Avançada",
    cover: cover("photo-1604948501466-4e9c339b9c24"),
    description: "Domine a manicure russa com precisão profissional.",
    videos: [
      { id: "r1", title: "Apresentação da técnica russa", description: "Indicações, contraindicações e estudo de caso.", thumbnail: cover("photo-1604948501466-4e9c339b9c24"), duration: "14:08", src: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4" },
      { id: "r2", title: "Brocas e fresas", description: "Como escolher e manusear corretamente.", thumbnail: cover("photo-1599948128020-9a44505b58f4"), duration: "18:36", src: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4" },
    ],
  },
  {
    id: "nailart",
    name: "Nail Art Autoral",
    cover: cover("photo-1601612628452-9e99ced43524"),
    description: "Desenvolva seu portfólio criativo e atraia clientes premium.",
    videos: [
      { id: "n1", title: "Decoração francesinha moderna", description: "Linhas perfeitas com pincel detalhista.", thumbnail: cover("photo-1601612628452-9e99ced43524"), duration: "11:50", src: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4" },
      { id: "n2", title: "Pedrarias e adesivos", description: "Fixação, composição e acabamento.", thumbnail: cover("photo-1583244532610-2a234c2e8915"), duration: "09:14", src: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4" },
    ],
  },
];
