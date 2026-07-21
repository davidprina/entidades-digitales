import { prisma } from "../src/lib/prisma";

beforeEach(async () => {
  await prisma.refreshToken.deleteMany();
  await prisma.entity.deleteMany();
  await prisma.user.deleteMany();
});

afterAll(async () => {
  await prisma.$disconnect();
});
