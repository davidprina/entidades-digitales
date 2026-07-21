import { prisma } from "../lib/prisma";

beforeEach(async () => {
  await prisma.entity.deleteMany();
  await prisma.user.deleteMany();
});

afterAll(async () => {
  await prisma.$disconnect();
});
