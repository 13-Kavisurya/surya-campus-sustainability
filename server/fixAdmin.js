const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const User = require('./models/User');

dotenv.config({ path: path.join(__dirname, '.env') });

async function fixAdmin() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected!');

        const email = 'admin@campus.edu';
        let admin = await User.findOne({ email });

        if (!admin) {
            console.log(`Admin with email ${email} not found. Creating new one...`);
            admin = new User({
                name: 'Super Admin',
                email: email,
                password: 'Admin@123',
                user_type: 'admin'
            });
        } else {
            console.log(`Found admin: ${admin.email}. Resetting password...`);
            admin.password = 'Admin@123';
            admin.user_type = 'admin'; // Ensure it's admin
        }

        await admin.save();
        console.log('--------------------------------------------------');
        console.log('✅ Admin credentials fixed successfully!');
        console.log(`   Email:    ${email}`);
        console.log(`   Password: Admin@123`);
        console.log('--------------------------------------------------');

        await mongoose.disconnect();
    } catch (err) {
        console.error('❌ Error fixing admin:', err);
        process.exit(1);
    }
}

fixAdmin();
