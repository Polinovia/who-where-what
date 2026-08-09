import "dotenv/config";
import { PrismaClient } from "../lib/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { DEFAULT_CATEGORY_NAME } from "../lib/categories";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const CATEGORIES_FR: Record<string, string[]> = {
  [DEFAULT_CATEGORY_NAME]: [
    "Qui est le personnage principal de cette histoire ?",
    "Où se trouve-t-il au début de l'histoire ?",
    "Que faisait-il juste avant que tout commence ?",
    "Qui a-t-il rencontré de façon inattendue ?",
    "Où cette rencontre a-t-elle eu lieu ?",
    "Qu'est-ce que cette personne lui a proposé ?",
    "Quel objet étrange ont-ils trouvé ensemble ?",
    "Où cet objet les a-t-il menés ?",
    "Qui a essayé de les en empêcher ?",
    "Qu'ont-ils fait pour s'en sortir ?",
    "Où l'histoire s'est-elle terminée ?",
    "Quelle a été la dernière phrase prononcée ?",
  ],
  "😂 Funny": [
    "Qui est le clown de cette histoire ?",
    "Où a eu lieu la blague la plus embarrassante ?",
    "Que portait-il d'absurde ce jour-là ?",
    "Qui a explosé de rire en premier ?",
    "Où ont-ils fini par se cacher de honte ?",
    "Quel bruit ridicule a-t-il fait ?",
    "Qui a tout filmé en secret ?",
    "Comment l'histoire s'est-elle terminée en fou rire ?",
  ],
  "🔥 Chaos": [
    "Qui a déclenché le chaos ?",
    "Où tout est parti en vrille ?",
    "Qu'est-ce qui a explosé, au sens figuré ou pas ?",
    "Qui a crié le plus fort ?",
    "Où se sont-ils réfugiés en catastrophe ?",
    "Quel objet a été détruit dans la panique ?",
    "Qui a essayé, en vain, de tout arrêter ?",
    "Comment le chaos s'est-il enfin calmé ?",
  ],
  "👫 Friends": [
    "Qui était avec ses meilleurs amis ce jour-là ?",
    "Où se sont-ils tous retrouvés ?",
    "Qu'ont-ils décidé de faire ensemble ?",
    "Qui a proposé l'idée la plus folle du groupe ?",
    "Où cette idée les a-t-elle menés ?",
    "Qui a dû sauver la situation ?",
    "Quel souvenir leur restera à jamais ?",
    "Comment la bande a-t-elle célébré la fin de la journée ?",
  ],
  "❤️ Romance": [
    "Qui a eu le coup de foudre ?",
    "Où se sont-ils croisés pour la première fois ?",
    "Qu'a-t-il ou elle offert en cadeau ?",
    "Qui a écrit une lettre d'amour ?",
    "Où ont-ils eu leur premier rendez-vous ?",
    "Quel obstacle a menacé leur histoire ?",
    "Qui a fait une déclaration inattendue ?",
    "Comment cette romance s'est-elle terminée ?",
  ],
  "🧙 Fantasy": [
    "Qui est le héros de cette légende ?",
    "Où se trouve le royaume enchanté ?",
    "Quelle créature magique ont-ils rencontrée ?",
    "Qui détenait le pouvoir interdit ?",
    "Où était caché le trésor légendaire ?",
    "Quel sort a tout changé ?",
    "Qui s'est dressé contre eux ?",
    "Comment la quête s'est-elle achevée ?",
  ],
  "🚀 Sci-Fi": [
    "Qui pilotait le vaisseau ?",
    "Où l'équipage a-t-il atterri ?",
    "Quelle technologie inconnue ont-ils découverte ?",
    "Qui a détecté un signal extraterrestre ?",
    "Où se cachait la menace venue de l'espace ?",
    "Quel gadget a sauvé la mission ?",
    "Qui a pris le contrôle du vaisseau ?",
    "Comment l'humanité a-t-elle été sauvée ?",
  ],
  "🎉 Party": [
    "Qui a organisé la fête ?",
    "Où la soirée a-t-elle eu lieu ?",
    "Quelle tenue improbable portait l'invité d'honneur ?",
    "Qui est monté sur la table pour danser ?",
    "Où la musique s'est-elle arrêtée brusquement ?",
    "Quel dégât a marqué la soirée ?",
    "Qui est resté jusqu'au bout ?",
    "Comment la fête s'est-elle terminée au petit matin ?",
  ],
  "🎨 Random": [
    "Qui s'est réveillé dans un endroit inattendu ?",
    "Où cette aventure improbable a-t-elle commencé ?",
    "Quel objet bizarre ont-ils trouvé ?",
    "Qui a pris une décision totalement absurde ?",
    "Où les événements ont-ils pris une tournure étrange ?",
    "Quelle règle du bon sens ont-ils enfreinte ?",
    "Qui a tout compris trop tard ?",
    "Comment cette histoire improbable s'est-elle conclue ?",
  ],
};

const CATEGORIES_EN: Record<string, string[]> = {
  [DEFAULT_CATEGORY_NAME]: [
    "Who?",
    "Where?",
    "What are they doing?",
    "With whom?",
    "How?",
    "Why?",
    "What goes wrong?",
    "How does it end?",
  ],
  "🔥 Chaos": [
    "Who is the main character?",
    "What completely ridiculous thing are they doing?",
    "Where does it happen?",
    "What animal appears?",
    "Who makes everything worse?",
    "What explodes?",
    "What secret is revealed?",
    "Who gets blamed?",
    "What does everyone scream?",
    "How does this disaster end?",
  ],
  "👫 Friends": [
    "Which friend is the main character?",
    "Where are they?",
    "What are they doing?",
    "Which friend joins them?",
    "Who betrays them?",
    "Who saves them?",
    "What embarrassing thing happens?",
    "Who gets arrested?",
    "What does everyone say afterward?",
    "What does the group remember forever?",
  ],
};

const CATEGORIES_BY_LANGUAGE: Record<string, Record<string, string[]>> = {
  fr: CATEGORIES_FR,
  en: CATEGORIES_EN,
};

async function main() {
  for (const [language, categories] of Object.entries(CATEGORIES_BY_LANGUAGE)) {
    for (const [name, questions] of Object.entries(categories)) {
      const category = await prisma.category.upsert({
        where: { name },
        update: {},
        create: { name },
      });

      for (const [index, text] of questions.entries()) {
        await prisma.question.upsert({
          where: {
            categoryId_language_order: { categoryId: category.id, language, order: index + 1 },
          },
          update: { text },
          create: { text, order: index + 1, language, categoryId: category.id },
        });
      }

      console.log(`Seeded category "${name}" (${language}) with ${questions.length} questions.`);
    }
  }
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
