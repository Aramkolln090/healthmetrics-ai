import React, { useState, useEffect } from 'react';
import Navbar from "@/components/layout/Navbar";
import { SharedSidebar } from "@/components/ui/shared-sidebar";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import SimpleOllamaChat from '@/components/ai/SimpleOllamaChat';
import DirectOllamaChat from '@/components/ai/DirectOllamaChat';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const OllamaTestPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [showRawResponse, setShowRawResponse] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("diagnostics");
  const [isOllamaReady, setIsOllamaReady] = useState<boolean | null>(null);

  useEffect(() => {
    // Check if Ollama is running on mount
    checkOllamaStatus();
  }, []);

  const checkOllamaStatus = async () => {
    try {
      const response = await fetch('http://localhost:11434/api/tags');
      setIsOllamaReady(response.ok);
    } catch (error) {
      setIsOllamaReady(false);
    }
  };

  const runTest = async () => {
    setIsLoading(true);
    setResult(null);
    setError(null);

    try {
      // First test - Check if Ollama is running
      let testResults = { steps: [] };
      
      testResults.steps.push({
        name: 'Connection Check',
        status: 'running'
      });
      
      setResult(testResults);
      
      const listResponse = await fetch('http://localhost:11434/api/tags');
      const listData = await listResponse.json();
      
      testResults.steps[0].status = 'success';
      testResults.steps[0].details = {
        status: listResponse.status,
        models: listData.models?.map((m: any) => m.name) || []
      };
      
      setResult({...testResults});

      // Second test - Try a simple chat completion
      testResults.steps.push({
        name: 'Chat API Test',
        status: 'running'
      });
      
      setResult({...testResults});

      try {
        const chatResponse = await fetch('http://localhost:11434/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'llama3.2',
            stream: false, // Explicitly disable streaming
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

        // Handle the response as text first
        const rawText = await chatResponse.text();
        console.log('Raw chat response:', rawText);
        
        let chatData;
        try {
          chatData = JSON.parse(rawText);
        } catch (jsonError) {
          console.error('JSON parse error:', jsonError);
          testResults.steps[1].status = 'failed';
          testResults.steps[1].details = {
            error: `Failed to parse response as JSON: ${jsonError.message}`,
            rawResponse: rawText.substring(0, 500) // Show first 500 chars of raw response
          };
          setResult({...testResults});
          throw new Error(`Failed to parse Ollama response: ${jsonError.message}`);
        }
        
        testResults.steps[1].status = 'success';
        testResults.steps[1].details = {
          status: chatResponse.status,
          response: chatData
        };
        
        setResult({...testResults});
      } catch (error) {
        console.error('Chat test failed:', error);
        if (testResults.steps[1].status !== 'failed') {
          testResults.steps[1].status = 'failed';
          testResults.steps[1].details = {
            error: error.message
          };
          setResult({...testResults});
        }
        throw error; // Let the main try/catch handle this
      }

      setIsOllamaReady(true);
      
    } catch (error: any) {
      console.error('Test failed:', error);
      setError(error.message || 'Unknown error occurred');
      setIsOllamaReady(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="flex pt-16">
        <SharedSidebar />
        <main className="flex-1 md:ml-64 p-6">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-4 text-healthBlue-950 dark:text-healthBlue-200">
              Ollama Connection Test
            </h1>
            
            <div className="bg-card border rounded-lg p-6 shadow-sm">
              <p className="text-muted-foreground mb-6">
                This page helps diagnose issues with the Ollama integration. Choose a tab below to run tests or try a simplified chat interface.
              </p>
              
              <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
                <TabsList className="grid w-full grid-cols-3 mb-6">
                  <TabsTrigger value="diagnostics">Diagnostics</TabsTrigger>
                  <TabsTrigger value="simplechat">Simple Chat</TabsTrigger>
                  <TabsTrigger value="directchat">Direct Chat</TabsTrigger>
                </TabsList>
                
                <TabsContent value="diagnostics" className="space-y-4">
                  <div className="flex items-center justify-center mb-8">
                    <Button 
                      onClick={runTest} 
                      disabled={isLoading}
                      size="lg"
                      className="bg-healthBlue-700 hover:bg-healthBlue-900"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Running Tests...
                        </>
                      ) : (
                        'Test Ollama Connection'
                      )}
                    </Button>
                  </div>
                  
                  {error && (
                    <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md text-red-800 dark:text-red-300">
                      <h3 className="font-semibold mb-2">Error</h3>
                      <p className="text-sm font-mono whitespace-pre-wrap">{error}</p>
                      
                      <div className="mt-4 text-sm">
                        <h4 className="font-semibold mb-1">Troubleshooting Steps:</h4>
                        <ul className="list-disc pl-5 space-y-1">
                          <li>Ensure Ollama application is running</li>
                          <li>Try running <code className="bg-red-100 dark:bg-red-900 px-1 rounded">ollama list</code> in your terminal to check if it works</li>
                          <li>Check if you have <code className="bg-red-100 dark:bg-red-900 px-1 rounded">llama3.2</code> model installed</li>
                          <li>Restart Ollama application</li>
                          <li>Check for firewall or antivirus blocking localhost:11434</li>
                        </ul>
                      </div>
                    </div>
                  )}
                  
                  {result && (
                    <div className="border rounded-md divide-y">
                      {result.steps.map((step: any, index: number) => (
                        <div key={index} className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-medium">Test {index + 1}: {step.name}</h3>
                            <div>
                              {step.status === 'running' && (
                                <span className="flex items-center text-amber-600 dark:text-amber-400">
                                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                                  Running
                                </span>
                              )}
                              {step.status === 'success' && (
                                <span className="text-green-600 dark:text-green-400">✓ Successful</span>
                              )}
                              {step.status === 'failed' && (
                                <span className="text-red-600 dark:text-red-400">✗ Failed</span>
                              )}
                            </div>
                          </div>
                          
                          {step.details && step.status === 'success' && (
                            <div className="text-sm">
                              {step.name === 'Connection Check' && (
                                <div>
                                  <p>Status: {step.details.status} OK</p>
                                  <p>Available models: {step.details.models.join(', ') || 'None found'}</p>
                                </div>
                              )}
                              
                              {step.name === 'Chat API Test' && (
                                <div>
                                  <p className="font-semibold mt-2 mb-1">Question:</p>
                                  <p className="mb-3">How much water should I drink daily?</p>
                                  
                                  <p className="font-semibold mb-1">Response:</p>
                                  <div className="bg-muted p-3 rounded-md whitespace-pre-wrap">
                                    {step.details.response?.message?.content || 'No content returned'}
                                  </div>
                                  
                                  <div className="mt-4">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => setShowRawResponse(!showRawResponse)}
                                    >
                                      {showRawResponse ? 'Hide' : 'Show'} Raw API Response
                                    </Button>
                                    
                                    {showRawResponse && (
                                      <pre className="mt-2 bg-muted p-3 rounded-md text-xs overflow-auto max-h-48">
                                        {JSON.stringify(step.details.response, null, 2)}
                                      </pre>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="simplechat">
                  <div className="mb-4">
                    <div className={`inline-block px-3 py-1 rounded-full text-sm ${
                      isOllamaReady === true 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                        : isOllamaReady === false
                        ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                        : 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'
                    }`}>
                      {isOllamaReady === true 
                        ? '✓ Ollama is connected'
                        : isOllamaReady === false
                        ? '✗ Ollama is not running'
                        : '? Checking Ollama status...'}
                    </div>
                  </div>
                  
                  {isOllamaReady === false ? (
                    <div className="p-8 text-center border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-lg">
                      <h3 className="text-lg font-medium mb-2">Ollama Not Available</h3>
                      <p className="text-muted-foreground mb-4">
                        You need to start Ollama before you can use the chat interface.
                      </p>
                      <Button onClick={checkOllamaStatus}>
                        Check Again
                      </Button>
                    </div>
                  ) : (
                    <SimpleOllamaChat />
                  )}
                </TabsContent>
                
                <TabsContent value="directchat">
                  <div className="mb-4">
                    <div className={`inline-block px-3 py-1 rounded-full text-sm ${
                      isOllamaReady === true 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                        : isOllamaReady === false
                        ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                        : 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'
                    }`}>
                      {isOllamaReady === true 
                        ? '✓ Ollama is connected'
                        : isOllamaReady === false
                        ? '✗ Ollama is not running'
                        : '? Checking Ollama status...'}
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">
                      This chat uses Ollama's text completion API instead of the chat API to avoid JSON parsing issues.
                    </p>
                  </div>
                  
                  {isOllamaReady === false ? (
                    <div className="p-8 text-center border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-lg">
                      <h3 className="text-lg font-medium mb-2">Ollama Not Available</h3>
                      <p className="text-muted-foreground mb-4">
                        You need to start Ollama before you can use the chat interface.
                      </p>
                      <Button onClick={checkOllamaStatus}>
                        Check Again
                      </Button>
                    </div>
                  ) : (
                    <DirectOllamaChat />
                  )}
                </TabsContent>
              </Tabs>
              
              <div className="mt-6 text-sm text-muted-foreground">
                <p className="font-semibold">Alternative approaches:</p>
                <ol className="list-decimal pl-5 mt-2 space-y-1">
                  <li>Try running Ollama directly in the terminal with: <code className="bg-muted px-1 rounded">ollama run llama3.2 "How much water should I drink daily?"</code></li>
                  <li>Consider trying a different model like Mistral: <code className="bg-muted px-1 rounded">ollama pull mistral</code></li>
                  <li>Check the Ollama documentation for compatibility with your system</li>
                </ol>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default OllamaTestPage; 