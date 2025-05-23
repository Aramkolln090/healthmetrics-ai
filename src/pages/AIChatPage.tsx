import React, { useState, useEffect } from "react";
import PageLayout from "@/components/layout/PageLayout";
import { SharedSidebar } from "@/components/ui/shared-sidebar";
import { HealthChatInterface } from "@/components/ai/HealthChatInterface";
import { HealthKnowledgeBase } from "@/components/ai/HealthKnowledgeBase";
import { Loader2, MessageSquare, BookOpen, Home, Settings, Calendar, Brain } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { pullHealthModel } from "@/lib/ollama";
import { toast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import { Analytics } from "@vercel/analytics/react"
import { SpeedInsights } from "@vercel/speed-insights/next"


const AIChatPage = () => {
  const navigate = useNavigate();
  const [isCheckingOllama, setIsCheckingOllama] = useState(true);
  const [isOllamaReady, setIsOllamaReady] = useState(false);
  const [isPullingModel, setIsPullingModel] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("chat");
  const [connectionError, setConnectionError] = useState<string | null>(null);

  // Check if Ollama service is running
  useEffect(() => {
    const checkOllamaService = async () => {
      try {
        console.log('Checking Ollama service at http://localhost:11434/api/tags');
        const response = await fetch("http://localhost:11434/api/tags");
        console.log('Ollama API response status:', response.status);
        
        if (response.ok) {
          const data = await response.json();
          console.log('Ollama API response data:', data);
          setIsOllamaReady(true);
          setConnectionError(null);
        } else {
          console.error('Ollama API returned non-OK status:', response.status, response.statusText);
          const errorText = await response.text();
          console.error('Error text:', errorText);
          setIsOllamaReady(false);
          setConnectionError(`Ollama returned status ${response.status}: ${errorText}`);
        }
      } catch (error) {
        console.error('Error checking Ollama service:', error);
        setIsOllamaReady(false);
        setConnectionError(error instanceof Error ? error.message : String(error));
      } finally {
        setIsCheckingOllama(false);
      }
    };

    checkOllamaService();
  }, []);

  const handlePullModel = async () => {
    setIsPullingModel(true);
    try {
      const result = await pullHealthModel("llama3"); // You can change this to another model
      if (result) {
        toast({
          title: "Success",
          description: "Health model successfully downloaded. You can now use the chat!",
        });
        setIsOllamaReady(true);
      } else {
        toast({
          title: "Error",
          description: "Failed to download the model. Please try again or check Ollama logs.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error pulling model:", error);
      toast({
        title: "Error",
        description: "Failed to download the model. Please try again or check Ollama logs.",
        variant: "destructive",
      });
    } finally {
      setIsPullingModel(false);
    }
  };

  const getSidebarItems = () => {
    return [
      { icon: <Home className="h-5 w-5" />, label: 'Dashboard', onClick: () => navigate('/') },
      { icon: <Brain className="h-5 w-5" />, label: 'AI Chat', onClick: () => navigate('/ai-health') },
      { icon: <Calendar className="h-5 w-5" />, label: 'Calendar', onClick: () => navigate('/calendar') },
      { icon: <Settings className="h-5 w-5" />, label: 'Settings', onClick: () => navigate('/settings') },
    ];
  };

  return (
    <PageLayout>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-1">
          <SharedSidebar items={getSidebarItems()} />
        </div>
          
        <div className="md:col-span-3">
          <div className="mb-6">
            <h1 className="text-3xl font-bold mb-2">Health AI Assistant</h1>
            <p className="text-muted-foreground mb-6">
              Ask health questions and manage your health knowledge base
            </p>
            
            {isCheckingOllama ? (
              <div className="p-8 text-center health-card">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
                <p>Checking Ollama service...</p>
              </div>
            ) : !isOllamaReady ? (
              <div className="p-8 text-center border rounded-lg bg-card shadow-sm">
                <h2 className="text-xl font-semibold mb-4">Ollama Service Not Detected</h2>
                <p className="mb-6 text-muted-foreground">
                  To use the Health AI Assistant, you need to have Ollama running on your local machine.
                </p>
                {connectionError && (
                  <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md text-sm text-destructive">
                    <p className="font-semibold">Error details:</p>
                    <p className="font-mono text-xs mt-1">{connectionError}</p>
                  </div>
                )}
                <div className="space-y-4">
                  <div className="bg-muted p-4 rounded-md text-sm text-left">
                    <p className="font-medium mb-2">Follow these steps:</p>
                    <ol className="list-decimal pl-5 space-y-2">
                      <li>Download and install Ollama from <a href="https://ollama.ai/download" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">https://ollama.ai/download</a></li>
                      <li>Launch the Ollama application</li>
                      <li>Verify Ollama is running with: <code className="bg-muted-foreground/20 dark:bg-muted-foreground/10 px-1 rounded">ollama list</code></li>
                      <li>Make sure you have the llama3.2 model: <code className="bg-muted-foreground/20 dark:bg-muted-foreground/10 px-1 rounded">ollama pull llama3.2</code></li>
                      <li>Once running, refresh this page</li>
                    </ol>
                  </div>
                  
                  <div className="flex justify-center space-x-4">
                    <Button
                      onClick={() => window.location.reload()}
                      variant="outline"
                    >
                      Refresh Page
                    </Button>
                    <Button
                      onClick={handlePullModel}
                      disabled={isPullingModel}
                    >
                      {isPullingModel ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Downloading Model...
                        </>
                      ) : (
                        "Download Health Model"
                      )}
                    </Button>
                  </div>

                  <div className="text-center pt-4 pb-2">
                    <p className="text-sm text-muted-foreground">
                      Even without Ollama, you can still manage your Health Knowledge Base:
                    </p>
                    <Button
                      variant="link"
                      onClick={() => setActiveTab("knowledge")}
                      className="text-primary"
                    >
                      <BookOpen className="h-4 w-4 mr-2" />
                      Access Knowledge Base
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="chat" className="flex items-center">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    AI Chat
                  </TabsTrigger>
                  <TabsTrigger value="knowledge" className="flex items-center">
                    <BookOpen className="h-4 w-4 mr-2" />
                    Knowledge Base
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="chat" className="mt-0">
                  <HealthChatInterface />
                </TabsContent>
                
                <TabsContent value="knowledge" className="mt-0">
                  <HealthKnowledgeBase />
                </TabsContent>
              </Tabs>
            )}
            
            {/* Show knowledge base tab even when Ollama is not available */}
            {!isOllamaReady && !isCheckingOllama && activeTab === "knowledge" && (
              <div className="mt-6">
                <HealthKnowledgeBase />
              </div>
            )}
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default AIChatPage; 