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

        console.log('--- Starting Super Seed (Large Volume) ---');
        
        // 1. Ensure Super Admin exists
        const adminEmail = 'admin@campus.edu';
        await User.findOneAndUpdate(
            { email: adminEmail },
            { name: 'Super Admin', password: 'Admin@123', user_type: 'admin' },
            { upsert: true, new: true }
        );

        // 2. Seed 5 Staff (Coordinators)
        const staffNames = ['Dr. Ramesh', 'Prof. Anitha', 'Suresh V', 'Meena R', 'Karthik P'];
        let staffIds = [];
        for (let i = 0; i < 5; i++) {
            const email = `staff${i + 1}@bitsathy.ac.in`;
            const staff = await User.findOneAndUpdate(
                { email },
                { name: staffNames[i], password: 'password123', user_type: 'staff' },
                { upsert: true, new: true }
            );
            staffIds.push(staff._id);
        }

        // 3. Seed 10 Students
        let studentIds = [];
        for (let i = 0; i < 10; i++) {
            const regNo = 100 + i;
            const email = `7376231CS${regNo}@bitsathy.ac.in`;
            const student = await User.findOneAndUpdate(
                { email },
                { name: `Student ${i + 1}`, password: 'password123', user_type: 'student' },
                { upsert: true, new: true }
            );
            studentIds.push(student._id);
        }

        // 4. Seed 1 Report for EVERY student
        const reportTypes = ['waste', 'water', 'energy', 'suggestion'];
        const issueTitles = ['Leaky Faucet', 'Waste Overload', 'Lights On', 'Recycling Request'];
        for (const sid of studentIds) {
            // Check if student already has a report, if not create one
            const hasReport = await SustainabilityReport.findOne({ user_id: sid });
            if (!hasReport) {
                await SustainabilityReport.create({
                    user_id: sid,
                    report_type: reportTypes[Math.floor(Math.random() * reportTypes.length)],
                    title: issueTitles[Math.floor(Math.random() * issueTitles.length)],
                    description: 'Automated test report for database populating.',
                    location: 'Campus Block ' + String.fromCharCode(65 + Math.floor(Math.random() * 5)),
                    status: 'pending'
                });
            }
        }

        // 5. Seed Resource Usage for each Staff
        const resourceTypes = ['Water', 'Electricity', 'Waste'];
        for (const staffId of staffIds) {
            const hasUsage = await ResourceUsage.findOne({ loggedBy: staffId });
            if (!hasUsage) {
                for (const type of resourceTypes) {
                    await ResourceUsage.create({
                        resourceType: type,
                        metrics: { units: 100 + Math.floor(Math.random() * 200) },
                        loggedBy: staffId,
                        date: new Date(),
                        location: 'Main Campus',
                        totalCost: 100 + Math.floor(Math.random() * 500)
                    });
                }
            }
        }

        res.status(201).send('✅ Success! 10 Students, 5 Staff, 10 Reports, and Usage data created.');
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
