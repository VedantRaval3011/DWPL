// Quick test to verify MongoDB connection
require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI;

console.log('🔍 Testing MongoDB Connection...\n');
console.log('📍 Connection URI (sanitized):', MONGODB_URI ? MONGODB_URI.replace(/\/\/.*@/, '//***:***@') : 'NOT SET');
console.log('');

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI is not set in .env.local');
  process.exit(1);
}

const opts = {
  bufferCommands: false,
  serverSelectionTimeoutMS: 10000,
  socketTimeoutMS: 45000,
  family: 4,
};

console.log('🔌 Attempting connection...\n');

mongoose.connect(MONGODB_URI, opts)
  .then((conn) => {
    console.log('✅ SUCCESS! Connected to MongoDB');
    console.log('📊 Database:', conn.connection.db.databaseName);
    console.log('🏠 Host:', conn.connection.host);
    console.log('✨ All systems operational!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ CONNECTION FAILED!');
    console.error('Error:', error.message);
    console.error('\n📋 Full error details:');
    console.error(error);
    
    if (error.message.includes('authentication failed')) {
      console.error('\n💡 ISSUE: Wrong username or password');
      console.error('   → Check your .env.local credentials');
      console.error('   → Verify user exists in MongoDB Atlas Database Access');
    } else if (error.message.includes('ETIMEOUT')) {
      console.error('\n💡 ISSUE: Connection timeout');
      console.error('   → Check if MongoDB Atlas cluster is paused');
      console.error('   → Verify IP whitelist in Network Access');
    }
    
    process.exit(1);
  });
