import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { User, Case } from '../models';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/lawcaseai';

async function main() {
  const email = process.argv[2];
  const daysToAdvance = parseInt(process.argv[3], 10);

  if (!email || isNaN(daysToAdvance)) {
    console.log('Usage: npx ts-node src/scripts/timeMachine.ts <user-email> <days-to-advance>');
    process.exit(1);
  }

  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to Database.');

    const user = await User.findOne({ email });
    if (!user) {
      console.log(`User with email ${email} not found.`);
      process.exit(1);
    }

    const msToAdvance = daysToAdvance * 24 * 60 * 60 * 1000;

    console.log(`\n--- User Before Time Travel ---`);
    console.log(`Plan: ${user.plan}`);
    console.log(`Current Period Start: ${user.currentPeriodStart}`);
    console.log(`Current Period End: ${user.currentPeriodEnd}`);
    console.log(`Trial Started At: ${user.trialStartedAt}`);

    if (user.currentPeriodStart) {
      user.currentPeriodStart = new Date(user.currentPeriodStart.getTime() - msToAdvance);
    }
    if (user.currentPeriodEnd) {
      user.currentPeriodEnd = new Date(user.currentPeriodEnd.getTime() - msToAdvance);
    }
    if (user.trialStartedAt) {
      user.trialStartedAt = new Date(user.trialStartedAt.getTime() - msToAdvance);
    }

    await user.save();

    console.log(`\n--- User After Time Travel (${daysToAdvance} days into the future) ---`);
    console.log(`Plan: ${user.plan}`);
    console.log(`Current Period Start: ${user.currentPeriodStart}`);
    console.log(`Current Period End: ${user.currentPeriodEnd}`);
    console.log(`Trial Started At: ${user.trialStartedAt}`);

    console.log('\nTime travel successful! Reload your frontend page to see the changes.\n');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

main();
