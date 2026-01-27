const mongoose = require('mongoose');
const path = require('path');
const Attendance = require('../models/Attendance');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const cleanDuplicates = async () => {
    try {
        console.log('Connecting to MongoDB...');
        const mongoUri = process.env.MONGO_URI;
        if (!mongoUri) {
            console.error('Environment variables:', process.env);
            throw new Error('MONGO_URI is not defined in .env');
        }
        await mongoose.connect(mongoUri);
        console.log('Connected to MongoDB.');

        console.log('Finding duplicate attendance records...');

        const duplicates = await Attendance.aggregate([
            {
                $group: {
                    _id: { user: '$user', date: '$date' },
                    count: { $sum: 1 },
                    docs: { $push: '$_id' }
                }
            },
            {
                $match: {
                    count: { $gt: 1 }
                }
            }
        ]);

        console.log(`Found ${duplicates.length} groups with duplicates.`);

        let removedCount = 0;
        for (const group of duplicates) {
            // Keep the first document, remove the rest
            const toRemove = group.docs.slice(1);
            const result = await Attendance.deleteMany({ _id: { $in: toRemove } });
            removedCount += result.deletedCount;
            console.log(`Cleaned group: User ${group._id.user}, Date ${group._id.date}. Removed ${result.deletedCount} duplicates.`);
        }

        console.log(`Total duplicates removed: ${removedCount}`);
        process.exit(0);
    } catch (error) {
        console.error('Error cleaning duplicates:', error);
        process.exit(1);
    }
};

cleanDuplicates();
