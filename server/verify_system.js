const axios = require('axios');

const API_URL = 'http://localhost:4001/api';

// Utilities
const login = async (email, password) => {
    try {
        const res = await axios.post(`${API_URL}/auth/login`, { email, password });
        return res.data.token;
    } catch (e) {
        console.error('!!! LOGIN FAILED !!!');
        if (e.response && e.response.data) {
            console.error('Error Details:', JSON.stringify(e.response.data, null, 2));
        } else {
            console.error('Error:', e.message);
        }
        throw e;
    }
};

const runTest = async () => {
    console.log('--- STARTING SYSTEM VERIFICATION (JS) ---');

    // 1. Login as Developer
    console.log('\n[1] Authentication (Developer)');
    const devToken = await login('developer@amog.com', 'password123');
    console.log('✅ Developer Logged In');

    // 2. Create Project
    console.log('\n[2] Create Project');
    const projectRes = await axios.post(`${API_URL}/projects`, {
        name: `Test Project ${Date.now()}`,
        eoiAmount: 50000,
        maxEOIsPerUnit: 2,
        units: [{ name: 'A', size: '1000', price: '1Cr', type: '2BHK', count: '5' }]
    }, { headers: { Authorization: `Bearer ${devToken}` } });
    const project = projectRes.data;
    console.log(`✅ Project Created: ${project.name} (${project.id})`);

    // 3. Login as Agent
    console.log('\n[3] Authentication (Agent)');
    const agentToken = await login('agent@amog.com', 'password123');
    console.log('✅ Agent Logged In');

    // 4. Join Project
    console.log('\n[4] Agent Participation');
    try {
        await axios.post(`${API_URL}/projects/join`, { projectId: project.id }, { headers: { Authorization: `Bearer ${agentToken}` } });
        console.log('✅ Joined Project Successfully');
    } catch (e) {
        if (e.response?.data?.message === 'Already joined') {
            console.log('✅ Already Joined Project');
        } else {
            console.error('❌ Join Project Failed:', e.response?.data);
        }
    }

    // 5. Create Client & EOI
    console.log('\n[5] Transaction Flow (EOI)');
    // Create Client
    try {
        const clientRes = await axios.post(`${API_URL}/clients`, {
            name: 'Test Buyer JS', phone: `98${Date.now().toString().slice(-8)}`
        }, { headers: { Authorization: `Bearer ${agentToken}` } });
        var client = clientRes.data;
        console.log(`✅ Client Created: ${client.name}`);
    } catch (e) {
        // Handle if phone exists, maybe fetch?
        console.log('⚠️ Client creation note:', e.response?.data);
        // Fallback: Fetch first client
        const clients = await axios.get(`${API_URL}/clients`, { headers: { Authorization: `Bearer ${agentToken}` } });
        client = clients.data[0];
    }


    if (client) {
        // Create EOI
        const eoiRes = await axios.post(`${API_URL}/eoi`, {
            projectId: project.id,
            clientId: client.id,
            amount: 50000,
            unitId: project.units[0]?.unitList[0]?.id // Pick first unit
        }, { headers: { Authorization: `Bearer ${agentToken}` } });
        const eoi = eoiRes.data;
        console.log(`✅ EOI Created: ${eoi.id} (Status: ${eoi.status})`);

        // Mock Payment for EOI
        console.log('\n[6] Process Payment');
        await axios.post(`${API_URL}/payments/confirm-manual`, { paymentId: eoi.paymentId }, { headers: { Authorization: `Bearer ${devToken}` } });
        console.log('✅ Payment Confirmed (Mock)');

        // Check Queue Position
        console.log('\n[7] Queue Verification');
        const myTxRes = await axios.get(`${API_URL}/transactions/my`, { headers: { Authorization: `Bearer ${agentToken}` } });
        const myEOI = myTxRes.data.eois.find(e => e.id === eoi.id);
        if (myEOI && myEOI.queuePosition === 1) {
            console.log(`✅ Queue Position Verified: #${myEOI.queuePosition}`);
        } else {
            console.log(`❌ Queue Verification Failed. Position: ${myEOI?.queuePosition}`);
        }
    }

    // 6. Login as Admin & Check Visibility
    console.log('\n[8] Admin Visibility');
    const adminToken = await login('admin@amog.com', 'password123');

    const walletsRes = await axios.get(`${API_URL}/admin/wallets`, { headers: { Authorization: `Bearer ${adminToken}` } });
    const globalTxRes = await axios.get(`${API_URL}/admin/transactions`, { headers: { Authorization: `Bearer ${adminToken}` } });

    if (walletsRes.data.length > 0) console.log(`✅ Admin Wallets Fetched: ${walletsRes.data.length} found`);
    if (globalTxRes.data.length > 0) console.log(`✅ Admin Ledger Fetched: ${globalTxRes.data.length} found`);

    console.log('\n--- VERIFICATION COMPLETE ---');
};

runTest();
