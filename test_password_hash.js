// Test password hash verification
const bcrypt = require('bcryptjs');

const passwordHash = '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LFvOe';

// Test different passwords
const testPasswords = [
  'password123',
  'admin123',
  'password',
  'admin',
  '123456'
];

async function testPasswords() {
  console.log('Testing password hash:', passwordHash);
  console.log('');
  
  for (const password of testPasswords) {
    const isValid = await bcrypt.compare(password, passwordHash);
    console.log(`Password "${password}": ${isValid ? '✓ VALID' : '✗ INVALID'}`);
  }
}

testPasswords().catch(console.error);
