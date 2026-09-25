import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const BANGALORE_REPORTS = [
  {
    type: 'AGGRESSIVE_DOG',
    description: 'Large aggressive dog near park entrance, chased pedestrians twice this week.',
    dogCount: 1,
    latitude: 12.9716,
    longitude: 77.5946,
    address: 'MG Road, Bangalore',
    status: 'PENDING',
  },
  {
    type: 'SMALL_PUPPIES',
    description: 'Litter of 5 puppies under construction site, mother dog nearby.',
    dogCount: 5,
    latitude: 12.9352,
    longitude: 77.6245,
    address: 'Koramangala 5th Block, Bangalore',
    status: 'VERIFIED',
  },
  {
    type: 'NIGHT_BARKING',
    description: 'Pack of dogs barking continuously from 11 PM to 3 AM near residential area.',
    dogCount: 4,
    latitude: 12.9698,
    longitude: 77.7499,
    address: 'Whitefield, Bangalore',
    status: 'PENDING',
  },
  {
    type: 'STRAY_DOG',
    description: 'Multiple stray dogs near food stalls, creating hygiene issues.',
    dogCount: 8,
    latitude: 13.0358,
    longitude: 77.597,
    address: 'Malleshwaram, Bangalore',
    status: 'VERIFIED',
  },
  {
    type: 'LARGE_DOG_POPULATION',
    description: 'Over 15 stray dogs congregating near the lake area daily.',
    dogCount: 15,
    latitude: 12.9082,
    longitude: 77.6476,
    address: 'HSR Layout, Bangalore',
    status: 'PENDING',
  },
  {
    type: 'INJURED_DOG',
    description: 'Injured dog with limp leg near bus stop, needs medical attention.',
    dogCount: 1,
    latitude: 12.9279,
    longitude: 77.6271,
    address: 'Indiranagar, Bangalore',
    status: 'VERIFIED',
  },
  {
    type: 'AGGRESSIVE_DOG',
    description: 'Two dogs showing aggressive behavior near school gate during morning hours.',
    dogCount: 2,
    latitude: 12.9981,
    longitude: 77.592,
    address: 'Hebbal, Bangalore',
    status: 'RESOLVED',
  },
  {
    type: 'OTHER',
    description: 'Dogs blocking road near market area, causing traffic issues.',
    dogCount: 6,
    latitude: 12.9141,
    longitude: 77.6101,
    address: 'Jayanagar 4th Block, Bangalore',
    status: 'PENDING',
  },
];

async function main() {
  console.log('Seeding database with demo data...');

  const admin = await prisma.user.upsert({
    where: { phoneNumber: '9999999999' },
    update: { role: 'ADMIN', isVerified: true },
    create: {
      phoneNumber: '9999999999',
      role: 'ADMIN',
      isVerified: true,
    },
  });
  console.log('Demo admin user created:', admin.phoneNumber);

  const demoUser = await prisma.user.upsert({
    where: { phoneNumber: '9876543210' },
    update: { isVerified: true },
    create: {
      phoneNumber: '9876543210',
      role: 'USER',
      isVerified: true,
    },
  });
  console.log('Demo user created:', demoUser.phoneNumber);

  await prisma.report.deleteMany({});

  for (const report of BANGALORE_REPORTS) {
    await prisma.report.create({
      data: {
        ...report,
        userId: demoUser.id,
      },
    });
  }

  console.log(`Created ${BANGALORE_REPORTS.length} demo reports around Bangalore`);
  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
