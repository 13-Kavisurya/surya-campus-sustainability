const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const SustainabilityReport = require('./models/SustainabilityReport');

dotenv.config();

const reportData = [
    { type: 'water', title: 'Water Leakage in Cafeteria', description: 'Significant water waste due to a broken pipe.' },
    { type: 'waste', title: 'Improper Waste Disposal', description: 'Plastic bottles are being thrown in the paper recycling bin.' },
    { type: 'energy', title: 'Hallway Lights On', description: 'Lights are staying on in empty classrooms during after-hours.' },
    { type: 'suggestion', title: 'Solar Powered Lighting', description: 'Suggestion to install solar LED lamps in the parking area to save energy.' },
    { type: 'water', title: 'Tap Issue in Washroom', description: 'A tap won\'t shut off completely; constant dripping observed.' },
    { type: 'waste', title: 'Need More Bins', description: 'Suggestion for more compostable waste bins near the canteen exit.' }
];

const seedReports = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        // Find all students
        const students = await User.find({ user_type: 'student' });
        console.log(`Found ${students.length} students to seed reports for.`);

        if (students.length === 0) {
            console.error('No students found! Please run the student seeding script first.');
            process.exit(1);
        }

        const reportsToInsert = [];
        for (const student of students) {
            const randomReport = reportData[Math.floor(Math.random() * reportData.length)];
            
            reportsToInsert.push({
                user_id: student._id,
                report_type: randomReport.type,
                title: randomReport.title,
                description: randomReport.description,
                location: `Academic Block ${Math.floor(Math.random() * 5) + 1}`,
                status: 'pending' // Initialize as pending per requirement
            });
        }

        await SustainabilityReport.insertMany(reportsToInsert);
        console.log(`Successfully seeded ${reportsToInsert.length} reports! Each student now has one personal report.`);

        process.exit();
    } catch (error) {
        console.error('Seeding error:', error);
        process.exit(1);
    }
};

seedReports();
