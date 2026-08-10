import "dotenv/config";
import { PrismaClient } from "../lib/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { DEFAULT_CATEGORY_NAME } from "../lib/categories";
import { PLACEHOLDERS_FR } from "./placeholders";
import { translateText } from "../lib/translate";

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
    "Qui est le personnage principal ?",
    "Mais quelle bêtise font-ils donc là ?",
    "Où cela se passe-t-il ?",
    "Quel animal apparaît ?",
    "Qui ne fait qu'empirer les choses ?",
    "Qu'est-ce qui explose ?",
    "Quel secret est révélé ?",
    "Qui est tenu pour responsable ?",
    "Qu'est-ce que tout le monde crie ?",
    "Comment cette catastrophe va-t-elle se terminer ?",
  ],
  "👫 Friends": [
    "Lequel de ces amis est le personnage principal ?",
    "Où sont-ils ?",
    "Qu'est-ce qu'ils font ?",
    "Quel ami se joint à eux ?",
    "Qui les trahit ?",
    "Qui les sauve ?",
    "Quelle situation embarrassante se produit ?",
    "Qui est arrêté ?",
    "Qu'est-ce que tout le monde dit après coup ?",
    "Qu'est-ce dont le groupe se souviendra pour toujours ?",
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
    "Who is the main character in this story?",
    "Where is he at the beginning of the story?",
    "What was he doing right before it all started?",
    "Who did he run into unexpectedly?",
    "Where did this meeting take place?",
    "What did that person offer him?",
    "What strange object did they find together?",
    "Where did that object lead them?",
    "Who tried to stop them?",
    "What did they do to get through it?",
    "Where did the story end?",
    "What was the last sentence spoken?",
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
  "😂 Funny": [
    "Who is the clown of this story?",
    "Where did the most embarrassing joke happen?",
    "What absurd thing were they wearing that day?",
    "Who burst out laughing first?",
    "Where did they end up hiding from embarrassment?",
    "What ridiculous sound did they make?",
    "Who secretly filmed everything?",
    "How did the story end in a fit of laughter?",
  ],
  "❤️ Romance": [
    "Who fell head over heels?",
    "Where did they first cross paths?",
    "What gift did they give?",
    "Who wrote a love letter?",
    "Where did they have their first date?",
    "What obstacle threatened their love story?",
    "Who made an unexpected declaration?",
    "How did this romance end?",
  ],
  "🧙 Fantasy": [
    "Who is the hero of this legend?",
    "Where is the enchanted kingdom?",
    "What magical creature did they meet?",
    "Who held the forbidden power?",
    "Where was the legendary treasure hidden?",
    "What spell changed everything?",
    "Who stood against them?",
    "How did the quest end?",
  ],
  "🚀 Sci-Fi": [
    "Who was piloting the ship?",
    "Where did the crew land?",
    "What unknown technology did they discover?",
    "Who detected an alien signal?",
    "Where was the threat from space hiding?",
    "What gadget saved the mission?",
    "Who took control of the ship?",
    "How was humanity saved?",
  ],
  "🎉 Party": [
    "Who threw the party?",
    "Where did the party take place?",
    "What unlikely outfit was the guest of honor wearing?",
    "Who climbed on the table to dance?",
    "Where did the music suddenly stop?",
    "What damage marked the night?",
    "Who stayed until the very end?",
    "How did the party end in the early morning?",
  ],
  "🎨 Random": [
    "Who woke up in an unexpected place?",
    "Where did this unlikely adventure begin?",
    "What weird object did they find?",
    "Who made a totally absurd decision?",
    "Where did things take a strange turn?",
    "What rule of common sense did they break?",
    "Who figured it all out too late?",
    "How did this unlikely story conclude?",
  ],
};

const CATEGORIES_BY_LANGUAGE: Record<string, Record<string, string[]>> = {
  fr: CATEGORIES_FR,
  en: CATEGORIES_EN,
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// The free DeepL tier rate-limits bursts hard. translateText() itself
// swallows failures and falls back to the untranslated source text — fine
// for runtime, but a seed run needs to actually get a translation, so retry
// with backoff here instead of silently seeding French text as "English".
async function translateWithRetry(text: string, targetLang: string, attempts = 5): Promise<string> {
  for (let attempt = 0; attempt < attempts; attempt++) {
    const result = await translateText(text, "fr", targetLang);
    if (result !== text) return result;
    await sleep(1000 * (attempt + 1));
  }
  console.warn(`Translation kept failing for "${text}" — leaving it as French.`);
  return text;
}

async function main() {
  for (const [language, categories] of Object.entries(CATEGORIES_BY_LANGUAGE)) {
    for (const [name, questions] of Object.entries(categories)) {
      const category = await prisma.category.upsert({
        where: { name },
        update: {},
        create: { name },
      });

      for (const [index, text] of questions.entries()) {
        const placeholdersFr = PLACEHOLDERS_FR[name][index];
        const placeholders: string[] = [];
        if (language === "fr") {
          placeholders.push(...placeholdersFr);
        } else {
          for (const p of placeholdersFr) {
            placeholders.push(await translateWithRetry(p, language));
            await sleep(150);
          }
        }

        await prisma.question.upsert({
          where: {
            categoryId_language_order: { categoryId: category.id, language, order: index + 1 },
          },
          update: { text, placeholders },
          create: { text, order: index + 1, language, categoryId: category.id, placeholders },
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
