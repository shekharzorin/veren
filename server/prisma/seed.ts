
import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// predefined realistic images
const PROJECT_IMAGES = [
  'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&q=80', // Modern Apartment
  'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80', // Luxury Home
  'https://images.unsplash.com/photo-1600596542815-6ad4c728fd2f?w=800&q=80', // Mansion
  'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80', // Modern interior
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80', // Villa
];

const USER_AVATARS = {
  men: [
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80',
    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80',
    'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&q=80',
  ],
  women: [
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80',
    'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&q=80',
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&q=80',
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&q=80',
  ]
};

async function main() {
  console.log('Seeding database with realistic data...');

  // Cleanup existing data
  await prisma.transaction.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.eOI.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.unit.deleteMany();
  await prisma.unitType.deleteMany();
  await prisma.projectAmenity.deleteMany();
  await prisma.paymentMilestone.deleteMany();
  await prisma.asset.deleteMany();
  await prisma.projectAgent.deleteMany();
  await prisma.wallet.deleteMany();
  await prisma.project.deleteMany();
  await prisma.client.deleteMany();
  await prisma.user.deleteMany();
  console.log('Cleaned up existing data.');

  const hashedPassword = await bcrypt.hash('password123', 10);

  // 1. Create Users
  
  // Super Admin
  const admin = await prisma.user.create({
    data: {
      name: 'Super Admin',
      email: 'admin@amog.com',
      password: hashedPassword,
      role: 'AMOG_ADMIN',
      phone: '9999999999',
      wallet: {
        create: { type: 'BROKERAGE', balance: 1000000 }
      }
    }
  });

  // Developers
  const developers = [];
  const developerNames = ['Prestige Group', 'Brigade Developers'];
  for (const name of developerNames) {
    const dev = await prisma.user.create({
      data: {
        name: name,
        email: \`contact@\${name.toLowerCase().replace(' ', '')}.com\`,
        password: hashedPassword,
        role: 'DEVELOPER_ADMIN',
        phone: faker.phone.number('9#########'),
        wallet: {
           create: { type: 'DEVELOPER', balance: 500000 }
        }
      }
    });
    developers.push(dev);
  }

  // Agents
  const agents = [];
  for (let i = 0; i < 5; i++) {
    const sex = i % 2 === 0 ? 'male' : 'female';
    const firstName = faker.person.firstName(sex);
    const lastName = faker.person.lastName();
    const avatar = i % 2 === 0 ? USER_AVATARS.men[i % 4] : USER_AVATARS.women[i % 4]; // simple rotation

    const agent = await prisma.user.create({
      data: {
        name: \`\${firstName} \${lastName}\`,
        email: \`agent\${i + 1}@gmail.com\`,
        password: hashedPassword,
        role: 'AGENT',
        phone: faker.phone.number('9#########'),
        wallet: {
          create: { type: 'AGENT', balance: 10000 }
        }
      }
    });
    agents.push(agent);
  }

  console.log(\`Created \${developers.length} developers and \${agents.length} agents.\`);

  // 2. Create Projects
  const projects = [];
  const projectNames = ['Sunshine City', 'Lakeside Ecstasy', 'Green Valley', 'Urban Heights'];
  
  let projIndex = 0;
  for (const dev of developers) {
    // 2 projects per developer
    for (let k = 0; k < 2; k++) {
      if (projIndex >= projectNames.length) break;
      const projName = projectNames[projIndex++];
      const projectDate = faker.date.past();

      const project = await prisma.project.create({
        data: {
          name: projName,
          developerId: dev.id,
          eoiAmount: 50000,
          wallet: {
            create: { type: 'ESCROW', balance: 0 }
          }
        }
      });
      projects.push(project);

      // Assets
      await prisma.asset.create({
        data: {
          projectId: project.id,
          type: 'image',
          url: PROJECT_IMAGES[projIndex % PROJECT_IMAGES.length],
          label: 'Main Facade'
        }
      });
       await prisma.asset.create({
        data: {
          projectId: project.id,
          type: 'brochure',
          url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', // Dummy PDF
          label: 'Project Brochure'
        }
      });

      // Unit Types
      const unitTypes = ['2BHK', '3BHK'];
      for (const type of unitTypes) {
         const size = type === '2BHK' ? '1200' : '1800';
         const price = type === '2BHK' ? '8500000' : '15000000';
         const uType = await prisma.unitType.create({
           data: {
             projectId: project.id,
             name: \`Luxury \${type}\`,
             size: \`\${size} sqft\`,
             price: price, // stored as string for now based on schema
             type: type,
             count: 10
           }
         });

         // Units
         for (let u = 1; u <= 5; u++) {
           await prisma.unit.create({
             data: {
               unitNumber: \`\${type.substring(0,1)}-\${100+u}\`,
               projectId: project.id,
               unitTypeId: uType.id,
               status: 'AVAILABLE'
             }
           });
         }
      }

      // Milestones
      await prisma.paymentMilestone.createMany({
        data: [
          { projectId: project.id, name: 'Booking Amount', percentage: 10, order: 1 },
          { projectId: project.id, name: 'Agreement', percentage: 20, order: 2 },
          { projectId: project.id, name: 'Completion', percentage: 70, order: 3 },
        ]
      });

      // Amenities
      await prisma.projectAmenity.createMany({
        data: [
          { projectId: project.id, name: 'Swimming Pool' },
          { projectId: project.id, name: 'Gymnasium' },
          { projectId: project.id, name: 'Club House' },
        ]
      });
      
      // Assign all agents to this project
      for (const agent of agents) {
        await prisma.projectAgent.create({
          data: {
            projectId: project.id,
            agentId: agent.id,
            status: 'ACTIVE'
          }
        });
      }

    }
  }
  
  console.log(\`Created \${projects.length} projects with amenities, units, and assigned agents.\`);

  // 3. Create Clients
  for (const agent of agents) {
    for (let c = 0; c < 5; c++) {
      await prisma.client.create({
        data: {
          name: faker.person.fullName(),
          phone: faker.phone.number('9#########'),
          email: faker.internet.email(),
          status: 'NEW',
          agentId: agent.id,
          notes: 'Interested in property investment'
        }
      });
    }
  }
  
  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
