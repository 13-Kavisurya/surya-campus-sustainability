const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const ResourceUsage = require('./models/ResourceUsage');

dotenv.config();

const coordinators = [
    { name: 'Dr. Ramesh Kumar', email: 'ramesh.k@bitsathy.ac.in' },
    { name: 'Prof. Anitha S', email: 'anitha.s@bitsathy.ac.in' },
    { name: 'Suresh V', email: 'suresh.v@bitsathy.ac.in' },
    { name: 'Meena R', email: 'meena.r@bitsathy.ac.in' },
    { name: 'Karthik P', email: 'karthik.p@bitsathy.ac.in' }
];

const generateMonthlyUsage = (coordinatorId) => {
    const data = [];
    const months = 3; // Last 3 months
    const types = ['Water', 'Electricity', 'Waste', 'Transport'];

    for (let i = 0; i < months; i++) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);

        types.forEach(type => {
            let metrics = {};
            let totalCost = 0;

            if (type === 'Water') {
                const reading = 5000 + Math.floor(Math.random() * 2000);
                metrics = { meterReading: reading, costPerUnit: 0.05 };
                totalCost = reading * 0.05;
            } else if (type === 'Electricity') {
                const units = 1200 + Math.floor(Math.random() * 500);
                metrics = { unitsConsumed: units, tariff: 0.15 };
                totalCost = units * 0.15;
            } else if (type === 'Waste') {
                const volume = 400 + Math.floor(Math.random() * 200);
                metrics = { volume: volume, segregationPercentage: 85 + Math.random() * 10 };
                totalCost = volume * 0.1; // Disposal cost
            } else if (type === 'Transport') {
                const distance = 800 + Math.floor(Math.random() * 400);
                metrics = { distanceCovered: distance, fuelUsed: distance / 12 };
                totalCost = (distance / 12) * 1.1; // Fuel cost
            }

            data.push({
                resourceType: type,
                metrics: metrics,
                loggedBy: coordinatorId,
                date: date,
                location: 'Main Campus',
                totalCost: Math.round(totalCost * 100) / 100
            });
        });
    }
    return data;
};

const seedExtraData = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        // 1. Add Coordinators
        let staffIds = [];
        for (const staff of coordinators) {
            let user = await User.findOne({ email: staff.email });
            if (!user) {
                user = await User.create({
                    name: staff.name,
                    email: staff.email,
                    password: 'password123',
                    user_type: 'staff'
                });
                console.log(`Created coordinator: ${staff.name}`);
            }
            staffIds.push(user._id);
        }

        // 2. Add Monthly Usage Reports
        let usageCount = 0;
        for (const staffId of staffIds) {
            const usageData = generateMonthlyUsage(staffId);
            await ResourceUsage.insertMany(usageData);
            usageCount += usageData.length;
        }

        console.log(`Seeding complete. Added ${staffIds.length} coordinators and ${usageCount} monthly usage reports.`);
        process.exit();
    } catch (error) {
        console.error('Seeding error:', error);
        process.exit(1);
    }
};

seedExtraData();
