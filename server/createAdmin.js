/**
 * Creates / ensures an admin User in the unified `users` collection.
 * Run: node server/createAdmin.js
 */
const mongoose = require('mongoose');
const dotenv   = require('dotenv');
const path     = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const User = require('./models/User');

async function main() {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const email = 'admin@campus.edu';

    let admin = await User.findOne({ email });
    if (admin) {
        console.log(`Admin already exists: ${admin.email}  (user_type: ${admin.user_type})`);
        // Make sure it's typed as 'admin' in case it was imported wrong
        if (admin.user_type !== 'admin') {
            admin.user_type = 'admin';
            await admin.save();
            console.log('Fixed user_type → admin');
        }
    } else {
        admin = await User.create({
            name:      'Super Admin',
            email,
            password:  'Admin@123',   // ← change this in production
            user_type: 'admin'
        });
        console.log(`Admin created: ${admin.email}`);
    }

    console.log('\n--- Admin Credentials ---');
    console.log('  Email   :', email);
    console.log('  Password: Admin@123');
    console.log('  URL     : http://localhost:3000/admin/login');
    console.log('-------------------------\n');

    await mongoose.disconnect();
}

main().catch(err => { console.error(err); process.exit(1); });
