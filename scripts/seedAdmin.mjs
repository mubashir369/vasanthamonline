import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

import fs from 'fs';
import path from 'path';

let envUri = process.env.MONGODB_URI;
if (fs.existsSync('.env.local')) {
  const content = fs.readFileSync('.env.local', 'utf-8');
  const match = content.match(/MONGODB_URI\s*=\s*([^\r\n]+)/);
  if (match) {
    envUri = match[1].trim();
  }
}
const MONGODB_URI = envUri || 'mongodb://127.0.0.1:27017/vasantham_test';

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['SUPER_ADMIN', 'ADMIN', 'CUSTOMER'], default: 'CUSTOMER' },
    phone: { type: String },
    addresses: [
      {
        fullName: String,
        phone: String,
        street: String,
        landmark: String,
        city: String,
        district: String,
        state: String,
        pincode: String,
        isDefault: Boolean,
      },
    ],
  },
  { timestamps: true }
);

const User = mongoose.models.User || mongoose.model('User', UserSchema);

async function seedAdmin() {
  console.log('Connecting to database...');
  await mongoose.connect(MONGODB_URI);

  const email = 'admin@vasantham.com';
  const password = 'admin123';
  const passwordHash = await bcrypt.hash(password, 10);

  const existingAdmin = await User.findOne({ email });

  if (existingAdmin) {
    existingAdmin.name = 'Vasantham Administrator';
    existingAdmin.passwordHash = passwordHash;
    existingAdmin.role = 'SUPER_ADMIN';
    existingAdmin.phone = '+91 73061 60066';
    await existingAdmin.save();
    console.log(`✓ Admin user (${email}) password and role updated successfully!`);
  } else {
    await User.create({
      name: 'Vasantham Administrator',
      email,
      passwordHash,
      role: 'SUPER_ADMIN',
      phone: '+91 73061 60066',
      addresses: [
        {
          fullName: 'Store Head Office',
          phone: '+91 73061 60066',
          street: 'OPP. MY G Future, Main road Mannarkkad',
          city: 'Mannarkkad',
          district: 'Palakkad',
          state: 'Kerala',
          pincode: '678582',
          isDefault: true,
        },
      ],
    });
    console.log(`✓ Admin user (${email}) created successfully!`);
  }

  // Also ensure StoreSettings is updated
  await mongoose.connection.collection('storesettings').updateOne(
    {},
    {
      $set: {
        contactPhone: '+91 73061 60066',
        whatsappPhone: '+91 73061 60066',
        contactEmail: 'info@vasanthamonline.com',
        logoUrl: '/logo.png',
        instagramUrl: 'https://www.instagram.com/vasanthamonline?cplk=MWZqM21vdTVsZWk0aA=='
      }
    },
    { upsert: true }
  );
  console.log('✓ StoreSettings contact information updated!');

  console.log(`Admin Email: ${email}`);
  console.log(`Admin Password: ${password}`);
  console.log(`Role: SUPER_ADMIN`);

  await mongoose.disconnect();
  process.exit(0);
}

seedAdmin().catch((err) => {
  console.error('Failed to seed admin:', err);
  process.exit(1);
});
