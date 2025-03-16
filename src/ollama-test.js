// Simple test script for Ollama API
// Run with: node src/ollama-test.js

const testOllama = async () => {
  console.log('🔍 Testing Ollama API connection...');
  
  try {
    // First test: Check if Ollama is running
    console.log('Step 1: Checking if Ollama is running...');
    const listResponse = await fetch('http://localhost:11434/api/tags');
    
    if (!listResponse.ok) {
      throw new Error(`Failed to connect to Ollama API: ${listResponse.status} ${listResponse.statusText}`);
    }
    
    const listData = await listResponse.json();
    console.log('✅ Ollama is running!');
    console.log('Available models:', listData.models?.map(m => m.name) || []);
    
    // Second test: Try a simple chat completion
    console.log('\nStep 2: Testing chat completion with a simple health query...');
    
    const chatResponse = await fetch('http://localhost:11434/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama3.2',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful health assistant. Keep responses brief and accurate.'
          },
          {
            role: 'user',
            content: 'How much water should I drink daily?'
          }
        ]
      })
    });
    
    if (!chatResponse.ok) {
      const errorText = await chatResponse.text();
      throw new Error(`Chat API error: ${chatResponse.status} - ${errorText}`);
    }
    
    const chatData = await chatResponse.json();
    console.log('✅ Successfully received response from Ollama!');
    console.log('\nQuestion: How much water should I drink daily?');
    console.log('\nOllama response:');
    console.log(chatData.message?.content || 'No content returned');
    
  } catch (error) {
    console.error('❌ Error testing Ollama:', error.message);
    
    if (error.message.includes('Failed to fetch')) {
      console.log('\n🔧 Troubleshooting tips:');
      console.log('1. Make sure Ollama is running (check if the Ollama app is open)');
      console.log('2. Try running "ollama list" in your terminal to verify it\'s working');
      console.log('3. Check if there are any firewall settings blocking localhost:11434');
    }
  }
};

// Run the test
testOllama();

// Add instructions for running the test manually
console.log('\n==================================================');
console.log('To run this test, open a terminal and enter:');
console.log('node src/ollama-test.js');
console.log('=================================================='); 