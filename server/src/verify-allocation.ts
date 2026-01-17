// @ts-nocheck
import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import { PaymentService } from './services/payment.service';
import { WalletService } from './services/wallet.service';

const prisma = new PrismaClient();

// Helper to mock request/response for controller calls if needed, 
// but we will call services/prisma directly to simulate "Internal" actions.
// Actually, we need to call the controller Logic for Booking to trigger the "Truth Engine".
// We can extract logic or just call the function if we mock Req/Res.
// For simplicity, we will replicate the controller logic call flow or import the controller?
// Importing controller might be hard due to Req/Res types.
// We will use `axios` to call our own running server? No, server might not be running.
// We should instantiate the controller function with mock req/res.

const mockReq = (body: any, user: any) => ({
    body,
    user,
    params: {},
    query: {}
} as any);

const mockRes = () => {
    const res: any = {};
    res.status = (code: number) => {
        res.statusCode = code;
        return res;
    };
    res.json = (data: any) => {
        res.data = data;
        return res;
    };
    return res;
};

import { createBooking } from './controllers/transaction.controller';

async function verify() {
    console.log('--- STARTING VERIFICATION: EOI ALLOCATION ---');

    // 1. Setup Data
    console.log('1. Setting up Test Data...');

    // Developer
    const developer = await prisma.user.create({
        data: {
            email: `devTest_${Date.now()}@test.com`,
            password: 'password',
            name: 'Dev Test',
            role: 'DEVELOPER'
        }
    });

    // Project
    const project = await prisma.project.create({
        data: {
            name: 'Verification Towers',
            developerId: developer.id,
            eoiAmount: 5000,
            eligibilityMode: true
        }
    });

    // Agent
    const agent = await prisma.user.create({
        data: {
            email: `agentTest_${Date.now()}@test.com`,
            password: 'password',
            name: 'Agent Smith',
            role: 'AGENT'
        }
    });

    // Clients
    const clientA = await prisma.client.create({
        data: { name: 'Alice Winner', phone: `111_${Date.now().toString().slice(-4)}`, agentId: agent.id }
    });
    const clientB = await prisma.client.create({
        data: { name: 'Bob Loser', phone: `222_${Date.now().toString().slice(-4)}`, agentId: agent.id }
    });

    const UNIT_ID = 'MH-001';

    console.log('Data Setup Complete.');

    // 2. Execute EOIs
    console.log('2. Processing EOIs...');

    // Alice EOI
    const eoiA = await prisma.eOI.create({
        data: { projectId: project.id, clientId: clientA.id, unitId: UNIT_ID, amount: 5000, status: 'PAID', tokenNumber: 1 }
    });
    console.log('Alice Manual PAy. Token 1.');

    // Bob EOI
    const eoiB = await prisma.eOI.create({
        data: { projectId: project.id, clientId: clientB.id, unitId: UNIT_ID, amount: 5000, status: 'PAID', tokenNumber: 2 }
    });
    console.log('Bob Manual Pay. Token 2.');

    // Ensure Escrow has money
    await prisma.wallet.create({
        data: {
            type: 'ESCROW',
            projectId: project.id,
            balance: 10000
        }
    });

    const eoiA_Verify = eoiA;
    const eoiB_Verify = eoiB;

    console.log(`Alice Token: ${eoiA_Verify?.tokenNumber}, Bob Token: ${eoiB_Verify?.tokenNumber}`);

    // 3. Create Booking (Trigger Allocation)
    console.log('3. Booking Unit for Alice...');

    const req = mockReq({
        projectId: project.id,
        clientId: clientA.id,
        unitId: UNIT_ID,
        amount: 20000, // Booking amt
        unitPrice: 100000 // Deal value
    }, { id: agent.id }); // Agent doing it

    const res = mockRes();
    await createBooking(req, res);

    if (res.statusCode === 201) {
        console.log('Booking Created Successfully.');
    } else {
        console.error('Booking Failed', res.data || res.statusCode);
        process.exit(1);
    }

    // 4. Verification assertions
    console.log('4. Verifying Logic...');

    const finalEOI_A = await prisma.eOI.findUnique({ where: { id: eoiA.id } });
    const finalEOI_B = await prisma.eOI.findUnique({ where: { id: eoiB.id } });

    console.log(`Alice Status (Expected CONVERTED): ${finalEOI_A?.status}`);
    console.log(`Bob Status (Expected REFUNDED): ${finalEOI_B?.status}`);

    if (finalEOI_A?.status === 'CONVERTED' && finalEOI_B?.status === 'REFUNDED') {
        console.log('✅ TRUTH ENGINE VERIFIED: Status updates correct.');
    } else {
        console.error('❌ TRUTH ENGINE FAILED: Status updates incorrect.');
    }

    // Check Wallet
    // Escrow should have:
    // +5000 (Alice)
    // +5000 (Bob)
    // -5000 (Alice converted/transferred)
    // -5000 (Bob Refunded)
    // Net 0 regarding EOIs (excluding booking fee logic which might impact it?).

    const escrow = await prisma.wallet.findUnique({ where: { projectId: project.id } });
    console.log('Escrow Balance:', escrow?.balance);
    // Note: My logic debited Escrow for refund. If it started at 0 -> +10000 -> -5000 -> -5000 = 0.

    console.log('--- VERIFICATION COMPLETE ---');
}

verify()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
