import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/dwpl';

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var mongoose: MongooseCache | undefined;
}

let cached: MongooseCache = global.mongoose || { conn: null, promise: null };

if (!global.mongoose) {
  global.mongoose = cached;
}

export async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 10000, // 10 seconds timeout
      socketTimeoutMS: 45000, // 45 seconds socket timeout
      family: 4, // Use IPv4, skip trying IPv6
    };

    console.log('🔌 Attempting to connect to MongoDB...');
    console.log('📍 Connection string:', MONGODB_URI.replace(/\/\/.*@/, '//***:***@'));

    cached.promise = mongoose.connect(MONGODB_URI, opts);
  }

  try {
    cached.conn = await cached.promise;
    console.log('✅ Successfully connected to MongoDB');
    console.log('📊 Database:', cached.conn.connection.db?.databaseName || 'unknown');
  } catch (e: any) {
    cached.promise = null;
    console.error('❌ MongoDB connection failed!');
    console.error('Error:', e.message);
    
    // Provide helpful error messages
    if (e.message.includes('ETIMEOUT')) {
      console.error('\n💡 TIMEOUT ERROR - Possible causes:');
      console.error('  1. MongoDB Atlas cluster is paused → Resume it in Atlas dashboard');
      console.error('  2. IP not whitelisted → Add your IP in Network Access (or use 0.0.0.0/0)');
      console.error('  3. Network/firewall blocking connection');
      console.error('  4. Incorrect connection string in .env.local');
    } else if (e.message.includes('authentication failed')) {
      console.error('\n💡 AUTHENTICATION ERROR:');
      console.error('  - Check username and password in MONGODB_URI');
      console.error('  - Ensure password special characters are URL-encoded');
    } else if (e.message.includes('ENOTFOUND')) {
      console.error('\n💡 DNS ERROR:');
      console.error('  - Check connection string format');
      console.error('  - Ensure cluster URL is correct');
    }
    
    throw e;
  }

  return cached.conn;
}
