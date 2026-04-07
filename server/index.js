const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

// Load environment variables
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(express.json());
app.use(cors({
    origin: [
        'http://localhost:3000',
        'http://localhost:3001',
        'https://surya-campus-sustainability-report.vercel.app'
    ],
    credentials: true
}));

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
