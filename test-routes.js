const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();

// Middleware
app.use(express.json());

console.log('Testing route loading...');

try {
  // Test each route individually
  const routeFiles = [
    'leads', 'quotations', 'purchaseOrders', 'do1', 'do2', 
    'inventory', 'tally', 'invoice', 'invoices', 'sms', 'reports'
  ];

  for (const routeFile of routeFiles) {
    try {
      console.log(`Loading ${routeFile}...`);
      const route = require(`./backend/routes/${routeFile}.js`);
      app.use(`/api/${routeFile}`, route);
      console.log(`✅ ${routeFile} loaded successfully`);
    } catch (error) {
      console.error(`❌ Error loading ${routeFile}:`, error.message);
      console.error('Stack:', error.stack);
    }
  }

  console.log('All routes tested');
  process.exit(0);
} catch (error) {
  console.error('Error during route testing:', error);
  process.exit(1);
}