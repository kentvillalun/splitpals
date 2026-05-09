import { PrismaClient } from "@/generated/prisma/client";

const globalForPrisma = global;

if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = new PrismaClient();
}

const prisma = globalForPrisma.prisma

export default prisma