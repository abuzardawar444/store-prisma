const { PrismaClient } = require("@prisma/client");
const products = require("./products.json");
const prisma = new PrismaClient();
async function main() {
  await prisma.products.deleteMany();
  for (const product of products) {
    await prisma.products.create({
      data: product,
    });
  }
}
main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
