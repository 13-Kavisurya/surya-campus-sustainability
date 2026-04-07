const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

dotenv.config();

const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String,
    user_type: String,
    created_at: Date
});

const adminSchema = new mongoose.Schema({
    username: String,
    email: String,
    password: String,
    created_at: Date
});

const User = mongoose.model('User', userSchema);
const Admin = mongoose.model('Admin', adminSchema);

const resetAll = async () => {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const DEFAULT_PASSWORD = 'password123';
    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(DEFAULT_PASSWORD, salt);

    // Reset all user passwords
    const userResult = await User.updateMany({}, { $set: { password: hashed } });
    console.log(`Reset passwords for ${userResult.modifiedCount} users -> password123`);

    // Check/seed admin
    let admin = await Admin.findOne({ email: 'admin@campussustainability.edu' });
    if (!admin) {
        const adminSalt = await bcrypt.genSalt(10);
        const adminHash = await bcrypt.hash('admin123', adminSalt);
        admin = await Admin.create({
            username: 'superadmin',
            email: 'admin@campussustainability.edu',
            password: adminHash,
            created_at: new Date()
        });
        console.log('Admin created: admin@campussustainability.edu / admin123');
    } else {
        const adminSalt = await bcrypt.genSalt(10);
        const adminHash = await bcrypt.hash('admin123', adminSalt);
        await Admin.updateOne({ email: 'admin@campussustainability.edu' }, { $set: { password: adminHash } });
        console.log('Admin password reset: admin@campussustainability.edu / admin123');
    }

    console.log('\n=== CREDENTIALS ===');
    console.log('All regular users: [their email] / password123');
    console.log('Admin login:        admin@campussustainability.edu / admin123');
    console.log('===================');

    await mongoose.disconnect();
    process.exit(0);
};

resetAll().catch(err => {
    console.error(err);
    process.exit(1);
});
