const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Admin = require('./models/Admin');
const connectDB = require('./config/db');

dotenv.config();

connectDB();

const seedAdmin = async () => {
    try {
        const existingAdmin = await Admin.findOne({ email: 'admin@campussustainability.edu' });
        if (existingAdmin) {
            console.log('Admin already exists.');
            process.exit();
        }

        const admin = new Admin({
            username: 'superadmin',
            email: 'admin@campussustainability.edu',
            password: 'password123'
        });

        await admin.save();
        console.log('Super Admin Seeded Successfully');
        process.exit();
    } catch (error) {
        console.error('Error seeding admin:', error);
        process.exit(1);
    }
};

seedAdmin();
