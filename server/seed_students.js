const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const SustainabilityReport = require('./models/SustainabilityReport');

dotenv.config();

const studentsRaw = `
III	7376231CS101	AAMINA A	B. E.	COMPUTER SCIENCE AND ENGINEERING
III	7376231CS102	ABHINAV A R	B. E.	COMPUTER SCIENCE AND ENGINEERING
III	7376231CS104	ABIKSHA D	B. E.	COMPUTER SCIENCE AND ENGINEERING
III	7376231CS105	ABISHEK HARIHARAN T	B. E.	COMPUTER SCIENCE AND ENGINEERING
III	7376231CS106	ABISHEK YADAV R	B. E.	COMPUTER SCIENCE AND ENGINEERING
III	7376231CS107	ADHAVAN SE V	B. E.	COMPUTER SCIENCE AND ENGINEERING
III	7376231CS108	AJAY DHAYANAND R	B. E.	COMPUTER SCIENCE AND ENGINEERING
III	7376231CS109	AJAY K P	B. E.	COMPUTER SCIENCE AND ENGINEERING
III	7376231CS110	ALAGULAKSHMI B	B. E.	COMPUTER SCIENCE AND ENGINEERING
III	7376231CS111	ALAGUMARI K	B. E.	COMPUTER SCIENCE AND ENGINEERING
III	7376231CS112	ANBU SELVAM S	B. E.	COMPUTER SCIENCE AND ENGINEERING
III	7376231CS113	ANTONY DEVA AMALA P	B. E.	COMPUTER SCIENCE AND ENGINEERING
III	7376231CS114	ANUSHA G	B. E.	COMPUTER SCIENCE AND ENGINEERING
III	7376231CS115	ANVITHA SIVAKUMAR	B. E.	COMPUTER SCIENCE AND ENGINEERING
III	7376231CS116	ARIVAZHAGAN B	B. E.	COMPUTER SCIENCE AND ENGINEERING
III	7376231CS117	ASWATHY K	B. E.	COMPUTER SCIENCE AND ENGINEERING
III	7376231CS118	ASWITHAA B	B. E.	COMPUTER SCIENCE AND ENGINEERING
III	7376231CS119	BAAVANA M	B. E.	COMPUTER SCIENCE AND ENGINEERING
III	7376231CS120	BALASUTHARSAN M	B. E.	COMPUTER SCIENCE AND ENGINEERING
III	7376231CS121	BARATHDARSHAN P R	B. E.	COMPUTER SCIENCE AND ENGINEERING
III	7376231CS122	BENIEL RAJA V	B. E.	COMPUTER SCIENCE AND ENGINEERING
III	7376231CS123	BHAVATHARINI S	B. E.	COMPUTER SCIENCE AND ENGINEERING
III	7376231CS124	BHUPESH V	B. E.	COMPUTER SCIENCE AND ENGINEERING
III	7376231CS125	CHOWBARNIKA M S	B. E.	COMPUTER SCIENCE AND ENGINEERING
III	7376231CS126	DAAVAK J	B. E.	COMPUTER SCIENCE AND ENGINEERING
III	7376231CS127	DAKSHANA B	B. E.	COMPUTER SCIENCE AND ENGINEERING
III	7376231CS128	DAKSHATA R	B. E.	COMPUTER SCIENCE AND ENGINEERING
III	7376231CS129	DARSHAN S	B. E.	COMPUTER SCIENCE AND ENGINEERING
III	7376231CS130	DEEPAK GANESAMURTHI SUSEELA	B. E.	COMPUTER SCIENCE AND ENGINEERING
III	7376231CS131	DEEPIKA V	B. E.	COMPUTER SCIENCE AND ENGINEERING
III	7376231CS132	DEETCHANA M	B. E.	COMPUTER SCIENCE AND ENGINEERING
III	7376231CS133	DHANU SRI V	B. E.	COMPUTER SCIENCE AND ENGINEERING
III	7376231CS134	DHANUSRI M	B. E.	COMPUTER SCIENCE AND ENGINEERING
III	7376231CS135	DHARANEESH G L	B. E.	COMPUTER SCIENCE AND ENGINEERING
III	7376231CS136	DHARANI M	B. E.	COMPUTER SCIENCE AND ENGINEERING
III	7376231CS137	DHARNISH P	B. E.	COMPUTER SCIENCE AND ENGINEERING
III	7376231CS138	DHARSANA K	B. E.	COMPUTER SCIENCE AND ENGINEERING
III	7376231CS139	DHARSHAN K	B. E.	COMPUTER SCIENCE AND ENGINEERING
III	7376231CS140	DHARSHAN S	B. E.	COMPUTER SCIENCE AND ENGINEERING
III	7376231CS141	DHARSINI R	B. E.	COMPUTER SCIENCE AND ENGINEERING
III	7376231CS142	DHARUN KUMAR R	B. E.	COMPUTER SCIENCE AND ENGINEERING
III	7376231CS143	DHAVAMANI S	B. E.	COMPUTER SCIENCE AND ENGINEERING
III	7376231CS144	DHINESHKUMAR P	B. E.	COMPUTER SCIENCE AND ENGINEERING
III	7376231CS145	DHIVINESH K	B. E.	COMPUTER SCIENCE AND ENGINEERING
III	7376231CS146	DHURSHITHA N	B. E.	COMPUTER SCIENCE AND ENGINEERING
III	7376231CS147	DINESH BABU S M	B. E.	COMPUTER SCIENCE AND ENGINEERING
III	7376231CS148	DIVYAPRAKASH R	B. E.	COMPUTER SCIENCE AND ENGINEERING
III	7376231CS149	ESHAN AHMED M	B. E.	COMPUTER SCIENCE AND ENGINEERING
III	7376231CS150	GIRIDHAR S K	B. E.	COMPUTER SCIENCE AND ENGINEERING
III	7376231CS151	GIRIDHARKUMAR S	B. E.	COMPUTER SCIENCE AND ENGINEERING
III	7376231CS152	GNANASOUNDARI S	B. E.	COMPUTER SCIENCE AND ENGINEERING
III	7376231CS153	GOKILA P	B. E.	COMPUTER SCIENCE AND ENGINEERING
III	7376231CS154	GOKILA S	B. E.	COMPUTER SCIENCE AND ENGINEERING
III	7376231CS155	GOKUL PRABHU M	B. E.	COMPUTER SCIENCE AND ENGINEERING
III	7376231CS156	GOKUL RAM S	B. E.	COMPUTER SCIENCE AND ENGINEERING
III	7376231CS157	GOKUL V	B. E.	COMPUTER SCIENCE AND ENGINEERING
III	7376231CS158	GOWSIKA P	B. E.	COMPUTER SCIENCE AND ENGINEERING
III	7376231CS159	GOWTHAM D	B. E.	COMPUTER SCIENCE AND ENGINEERING
III	7376231CS160	GOWTHAM S	B. E.	COMPUTER SCIENCE AND ENGINEERING
III	7376231CS161	GOWTHAM S	B. E.	COMPUTER SCIENCE AND ENGINEERING
III	7376231CS162	GUNANIHIL N	B. E.	COMPUTER SCIENCE AND ENGINEERING
III	7376231CS163	GURUPRASANTH D	B. E.	COMPUTER SCIENCE AND ENGINEERING
III	7376231CS165	HARI HARAN M	B. E.	COMPUTER SCIENCE AND ENGINEERING
III	7376231CS166	HARINI S	B. E.	COMPUTER SCIENCE AND ENGINEERING
`;

const reportTypes = ['waste', 'water', 'energy', 'suggestion'];
const issues = [
    { title: 'Broken Water Pipe', description: 'Major leak observed near block A cafeteria.' },
    { title: 'Incorrect Waste Segregation', description: 'Plastic bottles found in the composting bin near CSE department.' },
    { title: 'Street Light Always On', description: 'Street lights in the main driveway stay on during broad daylight.' },
    { title: 'Reduce Plastic Usage in Canteen', description: 'Significant amount of single-use plastic being used for delivery.' }
];

const seedData = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        // Find existing staff/admin to be the random coordinator
        const staffList = await User.find({ user_type: { $in: ['staff', 'admin'] } });
        if (staffList.length === 0) {
            console.error('No coordinator found! Please add an admin or staff member first.');
            process.exit(1);
        }

        const lines = studentsRaw.trim().split('\n');
        let userCount = 0;
        let reportCount = 0;

        for (const line of lines) {
            const parts = line.split('\t').map(p => p.trim());
            if (parts.length < 3) continue;

            const regNo = parts[1];
            const name = parts[2];
            const email = `${regNo}@bitsathy.ac.in`;
            const password = 'password123';

            let user = await User.findOne({ email });
            if (!user) {
                user = await User.create({
                    name,
                    email,
                    password,
                    user_type: 'student'
                });
                userCount++;
            }

            // 30% chance to have a dummy report
            if (Math.random() < 0.3) {
                const randomIssue = issues[Math.floor(Math.random() * issues.length)];
                const randomStatus = ['pending', 'approved', 'resolved'][Math.floor(Math.random() * 3)];
                const coordinator = staffList[Math.floor(Math.random() * staffList.length)];

                await SustainabilityReport.create({
                    user_id: user._id,
                    report_type: reportTypes[Math.floor(Math.random() * reportTypes.length)],
                    title: randomIssue.title,
                    description: randomIssue.description,
                    location: 'Campus Block A',
                    status: randomStatus,
                    resolvedBy: randomStatus === 'resolved' ? coordinator._id : null
                });
                reportCount++;
            }
        }

        console.log(`Seeding complete. Added ${userCount} students and ${reportCount} reports.`);
        process.exit();
    } catch (error) {
        console.error('Seeding error:', error);
        process.exit(1);
    }
};

seedData();
