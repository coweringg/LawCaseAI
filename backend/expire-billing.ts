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

        const paidUsers = await User.find({
            plan: { $nin: ['trial', 'none'] }
        }).toArray();

        console.log(`Found ${paidUsers.length} users on paid plans.`);

        if (paidUsers.length > 0) {
            const pastDate = new Date(Date.now() - (60 * 60 * 1000));

            const result = await User.updateMany(
                { plan: { $nin: ['trial', 'none'] } },
                { $set: { currentPeriodEnd: pastDate } }
            );

            console.log(`Successfully expired billing for ${result.modifiedCount} users.`);
            console.log('');
            console.log('What happens next:');
            console.log('  1. Go to your app and navigate to any page (e.g. /cases)');
            console.log('  2. The quotaResetMiddleware will detect the expired billing');
            console.log('  3. All active cases will be automatically CLOSED');
            console.log('  4. currentCases will reset to 0');
            console.log('  5. A new billing period will start');
            console.log('');
            console.log('To test reactivation:');
            console.log('  - Go to your case list');
            console.log('  - System-closed cases will show "Reactivate Case" button');
            console.log('  - Manually sealed cases will show "Permanently Sealed"');
        } else {
            console.log('No users on paid plans found. Buy a plan first via Settings > Billing.');
        }

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected');
    }
}

run();
