const { PrismaClient } = require("@prisma/client");
const { PrismaBetterSqlite3 } = require("@prisma/adapter-better-sqlite3");
const Database = require("better-sqlite3");

async function test() {
  try {
    const adapter = new PrismaBetterSqlite3({ url: "file:./dev.db" });
    const prisma = new PrismaClient({ adapter });
    
    const count = await prisma.user.count();
    console.log("Success! Users count:", count);
  } catch(e) {
    console.error("Error:", e);
  }
}
test();
