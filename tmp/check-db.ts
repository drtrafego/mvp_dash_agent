import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
    const clients = await prisma.client.findMany()
    console.log('Clients count:', clients.length)
    console.log(clients)
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect())
