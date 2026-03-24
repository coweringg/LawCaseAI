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

    const now = new Date();
    if (user.plan === 'trial' && user.trialStartedAt) {
      const trialEnd = new Date(user.trialStartedAt.getTime() + 24 * 60 * 60 * 1000);
      if (now > trialEnd) {
        user.plan = 'none' as any;
        user.currentCases = 0;
        user.expiredTrial = true;
        await user.save();
        await Case.updateMany(
          { userId: user._id, status: 'active' },
          { $set: { status: 'closed' } }
        );
        console.log('-> Trial expired.');
      }
    } else if (user.plan !== 'none' && user.plan !== 'trial' && user.currentPeriodEnd && user.currentPeriodEnd < now) {
      const isOrgAdmin = (user as any).isOrgAdmin;
      const organizationId = (user as any).organizationId;

      user.plan = 'none' as any;
      user.currentCases = 0;
      user.expiredPremium = true;
      await user.save();
      
      await Case.updateMany(
        { userId: user._id, status: 'active' },
        { $set: { status: 'closed' } }
      );

      if (isOrgAdmin && organizationId) {
        const Organization = mongoose.connection.collection('organizations');
        const UserCollection = mongoose.connection.collection('users');
        
        await Organization.updateOne({ _id: organizationId }, { $set: { isActive: false, currentPeriodEnd: user.currentPeriodEnd } });
        
        const employees = await UserCollection.find({ organizationId: organizationId, _id: { $ne: user._id } }).toArray();
        const employeeIds = employees.map(e => e._id);
        
        await UserCollection.updateMany(
          { organizationId: organizationId },
          { $set: { plan: 'none', currentCases: 0, expiredPremium: true } }
        );

        if (employeeIds.length > 0) {
          await Case.updateMany(
            { userId: { $in: employeeIds }, status: 'active' },
            { $set: { status: 'closed' } }
          );
        }
        console.log(`-> Premium Plan expired with Enterprise cascade (${employeeIds.length} members affected).`);
      } else {
        console.log('-> Premium Plan expired.');
      }
    }

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
