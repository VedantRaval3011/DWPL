# MongoDB Connection Timeout Fix

## Error
```
querySrv ETIMEOUT _mongodb._tcp.cluster0.iqlhxn9.mongodb.net
```

This error means your application **cannot connect to MongoDB Atlas**. The connection is timing out.

## Common Causes & Solutions

### 1. **MongoDB Atlas Cluster is Paused** ⏸️

**Check:**
1. Go to [MongoDB Atlas](https://cloud.mongodb.com/)
2. Log in to your account
3. Check if your cluster shows "PAUSED" or "STOPPED"

**Fix:**
- Click "Resume" on your cluster
- Wait 1-2 minutes for it to start
- Refresh your application

---

### 2. **IP Whitelist Restriction** 🔒 (Most Common)

MongoDB Atlas blocks connections from IP addresses that aren't whitelisted.

**Check:**
1. Go to MongoDB Atlas → Your Cluster
2. Click "Network Access" in the left sidebar
3. Check if your current IP is listed

**Fix Option A: Allow All IPs (Development Only)**
1. Click "Add IP Address"
2. Click "Allow Access from Anywhere"
3. Enter `0.0.0.0/0` in the IP Address field
4. Click "Confirm"

**Fix Option B: Add Your Current IP**
1. Click "Add IP Address"
2. Click "Add Current IP Address"
3. Click "Confirm"

⚠️ **Note:** If you're on a dynamic IP (home internet), you may need to update this regularly.

---

### 3. **Incorrect Connection String** 🔗

**Check your `.env.local` file:**

```bash
# Should look like this:
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/dwpl?retryWrites=true&w=majority
```

**Common mistakes:**
- ❌ Missing `mongodb+srv://` prefix
- ❌ Wrong username or password
- ❌ Missing database name (`/dwpl`)
- ❌ Special characters in password not URL-encoded

**Fix:**
1. Go to MongoDB Atlas → Your Cluster
2. Click "Connect" → "Connect your application"
3. Copy the connection string
4. Replace `<password>` with your actual password
5. Add `/dwpl` before the `?` to specify database name
6. Update `.env.local`

---

### 4. **Network/Firewall Issues** 🔥

**Check:**
- Corporate firewall blocking MongoDB ports
- VPN interfering with connection
- Antivirus blocking outbound connections

**Fix:**
- Temporarily disable VPN
- Add exception in firewall for MongoDB (port 27017)
- Try from a different network

---

### 5. **MongoDB Atlas Free Tier Limitations** 💰

Free tier clusters (M0) can pause after inactivity.

**Check:**
- Is your cluster M0 (Free)?
- Has it been inactive for 60+ days?

**Fix:**
- Resume the cluster
- Consider upgrading if you need 24/7 availability

---

## Quick Fix Steps (In Order)

### Step 1: Check MongoDB Atlas
```
1. Go to https://cloud.mongodb.com/
2. Log in
3. Check cluster status
4. If paused → Click "Resume"
```

### Step 2: Fix IP Whitelist
```
1. Click "Network Access" (left sidebar)
2. Click "Add IP Address"
3. Click "Allow Access from Anywhere"
4. Enter: 0.0.0.0/0
5. Click "Confirm"
6. Wait 1-2 minutes
```

### Step 3: Verify Connection String
```
1. Check .env.local file
2. Ensure format: mongodb+srv://user:pass@cluster0.xxxxx.mongodb.net/dwpl
3. Restart dev server: npm run dev
```

### Step 4: Test Connection
```
1. Refresh your application
2. Check browser console
3. Should see: "Successfully connected to MongoDB"
```

---

## Alternative: Use Local MongoDB

If you can't connect to Atlas, use local MongoDB:

### Install MongoDB Locally

**Windows:**
```bash
# Download from: https://www.mongodb.com/try/download/community
# Or use Chocolatey:
choco install mongodb

# Start MongoDB:
mongod
```

**Update `.env.local`:**
```bash
MONGODB_URI=mongodb://localhost:27017/dwpl
```

**Restart dev server:**
```bash
npm run dev
```

---

## Verify Connection

After applying fixes, check the terminal where `npm run dev` is running:

**Success:**
```
✓ Connected to MongoDB
✓ Database: dwpl
```

**Still failing:**
```
✗ MongoDB connection error: ETIMEOUT
```

---

## Enhanced Connection with Timeout Settings

If timeouts persist, update `src/lib/db.ts`:

```typescript
const opts = {
  bufferCommands: false,
  serverSelectionTimeoutMS: 10000, // 10 seconds
  socketTimeoutMS: 45000, // 45 seconds
  family: 4, // Use IPv4, skip trying IPv6
};
```

---

## Debug: Check Connection String

Add logging to see what's being used:

```typescript
// In src/lib/db.ts
console.log('Attempting to connect to:', MONGODB_URI.replace(/\/\/.*@/, '//***:***@'));
```

This will show the connection string with password hidden.

---

## Most Likely Solution

**90% of the time, it's the IP whitelist!**

1. Go to MongoDB Atlas
2. Network Access → Add IP Address
3. Allow Access from Anywhere (`0.0.0.0/0`)
4. Wait 1-2 minutes
5. Refresh your app

---

## Status Check

Run this in your browser console to test the connection:

```javascript
fetch('/api/party-master')
  .then(r => r.json())
  .then(data => {
    if (data.success) {
      console.log('✅ MongoDB connected! Found', data.data.length, 'parties');
    } else {
      console.error('❌ Error:', data.error);
    }
  });
```

---

**Next Step:** Check MongoDB Atlas cluster status and IP whitelist settings!
