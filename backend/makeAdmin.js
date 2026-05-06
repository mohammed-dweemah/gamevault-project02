require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const email = process.argv[2]; // Pass email as argument

if (!email) {
  console.log('Usage: node makeAdmin.js your@email.com');
  process.exit(1);
}

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const user = await User.findOneAndUpdate(
    { email: email.toLowerCase() },
    { role: 'admin' },
    { new: true }
  );

  if (!user) {
    console.log('❌ User not found:', email);
  } else {
    console.log(`✅ ${user.name} (${user.email}) is now an Admin`);
  }

  process.exit(0);
}).catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
