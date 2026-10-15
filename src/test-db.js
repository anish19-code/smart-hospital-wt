
const prisma = require("./prisma");

async function testDatabase() {
  try {
    await prisma.$connect();
    console.log("PostgreSQL connected successfully!");

    const equipment = await prisma.equipment.findMany();
    console.log("Equipment records:", equipment);
  } catch (error) {
    console.error("Database connection failed:", error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testDatabase();
