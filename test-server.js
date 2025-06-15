#!/usr/bin/env node

/**
 * Simple test script for the TimeChimp MCP Server
 * This script tests basic functionality without requiring a real API key
 */

import { spawn } from 'child_process';

console.log('Testing TimeChimp MCP Server...\n');

// Set a dummy API key for testing
process.env.TIMECHIMP_API_KEY = 'test-key-123';

// Start the server
const server = spawn('node', ['timechimp-mcp-server.js'], {
  stdio: ['pipe', 'pipe', 'pipe']
});

let output = '';
let errorOutput = '';

server.stdout.on('data', (data) => {
  output += data.toString();
});

server.stderr.on('data', (data) => {
  errorOutput += data.toString();
  console.log('Server output:', data.toString());
});

// Send a list tools request
const listToolsRequest = {
  jsonrpc: '2.0',
  id: 1,
  method: 'tools/list',
  params: {}
};

// Wait a moment for server to start
setTimeout(() => {
  console.log('Sending list tools request...');
  server.stdin.write(JSON.stringify(listToolsRequest) + '\n');
  
  // Wait for response then close
  setTimeout(() => {
    console.log('\nServer response:', output);
    server.kill();
    
    if (output.includes('get_projects') && output.includes('get_users') && output.includes('get_time_entries')) {
      console.log('\n✅ Test passed! Server is working correctly.');
      console.log('The server successfully registered all three tools:');
      console.log('- get_projects');
      console.log('- get_users'); 
      console.log('- get_time_entries');
    } else {
      console.log('\n❌ Test failed! Server did not respond correctly.');
    }
    
    process.exit(0);
  }, 2000);
}, 1000);

server.on('error', (error) => {
  console.error('❌ Failed to start server:', error.message);
  process.exit(1);
});

server.on('close', (code) => {
  if (code !== 0 && code !== null) {
    console.error(`❌ Server exited with code ${code}`);
    if (errorOutput) {
      console.error('Error output:', errorOutput);
    }
  }
}); 