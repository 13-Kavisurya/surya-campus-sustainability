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
        const vercelPattern = /^https:\/\/surya-campus-sustainability(-report-portal)?(-[a-z0-9]+)?\.vercel\.app$/;
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

// Explicitly respond to all OPTIONS preflight requests
app.options('*', cors(corsOptions));

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

// Port
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
