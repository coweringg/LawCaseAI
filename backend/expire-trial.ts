import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, 'src/.env') });
dotenv.config();

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/lawcaseai';

async function run() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(MONGO_URI);
        console.log('Connected!');

        const User = mongoose.connection.collection('users');
        
        const trialUsers = await User.find({ plan: 'trial' }).toArray();
        console.log(`Found ${trialUsers.length} users on trial plan.`);

        if (trialUsers.length > 0) {
            const pastDate = new Date(Date.now() - (25 * 60 * 60 * 1000));
            
            const result = await User.updateMany(
                { plan: 'trial' },
                { $set: { trialStartedAt: pastDate } }
            );
            
            console.log(`Successfully expired trial for ${result.modifiedCount} users.`);
            console.log('You can now test the platform to see the 24h expiration lock.');
        } else {
            console.log('No users currently on a trial. Please activate one in the UI first.');
        }

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected');
    }
}

run();
