#!/usr/bin/env node

/**
 * Test Script for Daily Email Sending
 *
 * This script simulates the cron job that sends daily check-in emails to all employees.
 *
 * Usage:
 *   node test-email-send.js
 *
 * Make sure your .env.local has:
 *   - CRON_SECRET
 *   - NEXT_PUBLIC_APP_URL
 *   - RESEND_API_KEY or SENDGRID_API_KEY (optional for testing)
 */

import https from 'https';
import http from 'http';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables manually
const envPath = join(__dirname, '.env.local');
let CRON_SECRET = 'dev-test-secret-12345';
let APP_URL = 'http://localhost:3002';

try {
  const envFile = readFileSync(envPath, 'utf8');
  const envLines = envFile.split('\n');

  for (const line of envLines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    const [key, ...valueParts] = trimmed.split('=');
    const value = valueParts.join('=').trim();

    if (key === 'CRON_SECRET') CRON_SECRET = value;
    if (key === 'NEXT_PUBLIC_APP_URL') APP_URL = value;
  }
} catch (err) {
  console.warn('Could not read .env.local, using defaults');
}

if (!CRON_SECRET) {
  console.error('❌ Error: CRON_SECRET not found in .env.local');
  console.log('\n💡 Add this to your .env.local file:');
  console.log('   CRON_SECRET=your-secret-here\n');
  process.exit(1);
}

console.log('🚀 Testing Daily Email Send...\n');
console.log(`📍 Endpoint: ${APP_URL}/api/send-daily-emails`);
console.log(`🔐 Using CRON_SECRET: ${CRON_SECRET.substring(0, 10)}...`);
console.log('');

const url = new URL('/api/send-daily-emails', APP_URL);
const protocol = url.protocol === 'https:' ? https : http;

const options = {
  hostname: url.hostname,
  port: url.port || (url.protocol === 'https:' ? 443 : 3000),
  path: url.pathname,
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${CRON_SECRET}`,
  },
};

const req = protocol.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    console.log(`📡 Response Status: ${res.statusCode}\n`);

    try {
      const result = JSON.parse(data);

      if (res.statusCode === 200) {
        console.log('✅ SUCCESS!\n');
        console.log(`📧 Total emails sent: ${result.totalEmailsSent}`);

        if (result.errors && result.errors.length > 0) {
          console.log(`\n⚠️  Errors encountered (${result.errors.length}):`);
          result.errors.forEach((err, i) => {
            console.log(`   ${i + 1}. ${err}`);
          });
        }

        console.log('\n💡 Tips:');
        console.log('   - Check your email inbox for the check-in email');
        console.log('   - If no email service configured, check console logs above');
        console.log('   - Emails are logged to console in development mode');
      } else {
        console.log('❌ FAILED!\n');
        console.log('Response:', result);
      }
    } catch (e) {
      console.log('❌ Failed to parse response');
      console.log('Raw response:', data);
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Request failed:', error.message);
  console.log('\n💡 Make sure:');
  console.log('   1. Your dev server is running (npm run dev)');
  console.log('   2. Convex is running (npx convex dev)');
  console.log('   3. The URL is correct');
});

req.end();
