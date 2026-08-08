import "dotenv/config";
import { PrismaClient } from "../lib/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const CLASSIC_QUESTIONS = [
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
];

async function main() {
  const category = await prisma.category.upsert({
    where: { name: "Classic" },
    update: {},
    create: { name: "Classic" },
  });

  for (const [index, text] of CLASSIC_QUESTIONS.entries()) {
    await prisma.question.upsert({
      where: { categoryId_order: { categoryId: category.id, order: index + 1 } },
      update: { text },
      create: { text, order: index + 1, categoryId: category.id },
    });
  }

  console.log(`Seeded category "${category.name}" with ${CLASSIC_QUESTIONS.length} questions.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
