const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

// Load environment variables
dotenv.config();

// Connect to database
connectDB();

const app = express();

const corsOptions = {
    origin: function (origin, callback) {
        // Allow requests with no origin (e.g. Postman, mobile apps)
        if (!origin) return callback(null, true);
        const allowedOrigins = [
            'http://localhost:3000',
            'http://localhost:3001',
        ];
        const vercelPattern = /^https:\/\/surya-campus-sustainability[a-z0-9-]*\.vercel\.app$/;
        if (allowedOrigins.includes(origin) || vercelPattern.test(origin)) {
            return callback(null, true);
        }
        console.warn(`CORS blocked for origin: ${origin}`);
        return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
};

// MUST be first — handle CORS before anything else
app.use(cors(corsOptions));

// Explicitly respond to all OPTIONS preflight requests (Express 5 compatible)
app.options(/.*/, cors(corsOptions));

// Body parsing middleware (after CORS)
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/reports', require('./routes/reportRoutes'));
app.use('/api/tasks', require('./routes/taskRoutes'));
app.use('/api/usage', require('./routes/resourceUsageRoutes'));
app.use('/api/limits', require('./routes/usageLimitRoutes'));
app.use('/api/issues', require('./routes/resourceIssueRoutes'));

// Initialize monthly report scheduler
const { scheduleMonthlyReport } = require('./utils/scheduler');
scheduleMonthlyReport();

app.get('/', (req, res) => {
    res.send('API is running...');
});

// Emergency route to seed EVERYTHING
app.get('/api/seed-all', async (req, res) => {
    try {
        const User = require('./models/User');
        const SustainabilityReport = require('./models/SustainabilityReport');
        const ResourceUsage = require('./models/ResourceUsage');

        console.log('--- Starting Super Seed ---');
        
        // 1. Ensure Super Admin exists
        const adminEmail = 'admin@campus.edu';
        let admin = await User.findOne({ email: adminEmail });
        if (!admin) {
            admin = await User.create({
                name: 'Super Admin',
                email: adminEmail,
                password: 'Admin@123',
                user_type: 'admin'
            });
            console.log('Admin created');
        }

        // 2. Seed Staff (Coordinators)
        const staffData = [
            { name: 'Dr. Ramesh Kumar', email: 'ramesh.k@bitsathy.ac.in' },
            { name: 'Prof. Anitha S', email: 'anitha.s@bitsathy.ac.in' }
        ];
        let staffIds = [];
        for (const s of staffData) {
            let staff = await User.findOne({ email: s.email });
            if (!staff) {
                staff = await User.create({ ...s, password: 'password123', user_type: 'staff' });
            }
            staffIds.push(staff._id);
        }
        console.log('Staff seeded');

        // 3. Seed Students
        const students = [
            { name: 'Aamina A', email: '7376231CS101@bitsathy.ac.in' },
            { name: 'Abhinav A R', email: '7376231CS102@bitsathy.ac.in' },
            { name: 'Abiksha D', email: '7376231CS104@bitsathy.ac.in' }
        ];
        let studentIds = [];
        for (const s of students) {
            let stu = await User.findOne({ email: s.email });
            if (!stu) {
                stu = await User.create({ ...s, password: 'password123', user_type: 'student' });
            }
            studentIds.push(stu._id);
        }
        console.log('Students seeded');

        // 4. Seed some reports
        const reportTypes = ['waste', 'water', 'energy'];
        for (const sid of studentIds) {
            const exists = await SustainabilityReport.findOne({ user_id: sid });
            if (!exists) {
                await SustainabilityReport.create({
                    user_id: sid,
                    report_type: reportTypes[Math.floor(Math.random() * 3)],
                    title: 'Test Issue ' + Math.random().toString(36).substring(7),
                    description: 'This is a test sustainability report seeded automatically.',
                    location: 'Main Block',
                    status: 'pending'
                });
            }
        }
        console.log('Reports seeded');

        // 5. Seed Resource Usage
        const types = ['Water', 'Electricity', 'Waste'];
        for (const staffId of staffIds) {
            const usageExists = await ResourceUsage.findOne({ loggedBy: staffId });
            if (!usageExists) {
                for (const type of types) {
                    await ResourceUsage.create({
                        resourceType: type,
                        metrics: { units: 100 + Math.floor(Math.random() * 50) },
                        loggedBy: staffId,
                        date: new Date(),
                        location: 'Main Campus',
                        totalCost: 50 + Math.floor(Math.random() * 100)
                    });
                }
            }
        }
        console.log('Usage data seeded');

        res.status(201).send('✅ Database fully seeded with Admin, Staff, Students, Reports, and Usage data!');
    } catch (err) {
        console.error('Seed error:', err);
        res.status(500).json({ error: err.message });
    }
});

// Port
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
