const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

dotenv.config({ path: path.join(__dirname, '.env') });

async function fixAdmin() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected!');

        const email = 'admin@campus.edu';
        const password = 'Admin@123';

        // 1. Delete any existing user with this email to avoid Mongoose modification bugs
        console.log(`Clearing existing account for ${email}...`);
        await User.deleteMany({ email });

        // 2. Manually hash the password to be 100% sure
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 3. Create fresh admin
        console.log(`Creating fresh admin account...`);
        const admin = new User({
            name: 'Super Admin',
            email: email,
            password: hashedPassword, // Using pre-hashed password
            user_type: 'admin'
        });

        await admin.save();
        
        console.log('--------------------------------------------------');
        console.log('✅ Admin credentials FIXED and RECREATED successfully!');
        console.log(`   Email:    ${email}`);
        console.log(`   Password: ${password}`);
        console.log('--------------------------------------------------');
        console.log('NOTE: Since you are using a Cloud DB, this fix applies');
        console.log('      to your deployed Render/Vercel site as well.');

        await mongoose.disconnect();
    } catch (err) {
        console.error('❌ Error fixing admin:', err);
        process.exit(1);
    }
}

fixAdmin();
