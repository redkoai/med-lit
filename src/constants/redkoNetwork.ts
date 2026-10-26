// Public destinations verified on October 13, 2026. Labs uses its live Vercel URL during the domain migration.
export const REDKO_NETWORK = [
  {
    "id": "redko",
    "name": "Redko",
    "url": "https://www.theredko.com/products",
    "description": "Product design, software development and AI services."
  },
  {
    "id": "labs",
    "name": "Redko Labs",
    "url": "https://www.theredko.com/RedkoLabs",
    "description": "An incubator for founders working in impact AI and deep tech."
  },
  {
    "id": "medlit",
    "name": "MedLit",
    "url": "https://medlit.theredko.com/about",
    "description": "Read research critically and inspect the evidence behind an appraisal."
  },
  {
    "id": "synaptik",
    "name": "Synaptik",
    "url": "https://synaptik.theredko.com/about",
    "description": "Research-informed cognitive practice and everyday wellbeing activities."
  },
  {
    "id": "gameer",
    "name": "Gameer",
    "url": "https://www.gameer.io/about",
    "description": "Play, create and share games with AI tools."
  },
  {
    "id": "redvest",
    "name": "Redvest",
    "url": "https://www.redvest.app/about",
    "description": "Financial education and investing tools."
  }
] as const;

export function redkoDirectorySchema(url: string) {
  return {"@context":"https://schema.org","@type":"ItemList",name:"Explore Redko products and initiatives",url, itemListElement:REDKO_NETWORK.map((p,index)=>({"@type":"ListItem",position:index+1,item:{"@type":"WebSite",name:p.name,url:p.url,description:p.description}}))};
}
