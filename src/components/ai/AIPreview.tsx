
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { MessageCircle, User, Bot } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
  status?: "typing" | "complete";
}

const AIPreview = () => {
  const [isInView, setIsInView] = useState(false);
  const [containerRef, setContainerRef] = useState<HTMLDivElement | null>(null);
  
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hi there! I'm your healthcare assistant. How can I help you today?",
      status: "complete",
    },
  ]);

  const [currentInteraction, setCurrentInteraction] = useState(0);
  const demoInteractions = [
    {
      user: "I've been having headaches lately and my blood pressure readings are higher than normal. Should I be concerned?",
      assistant: "I see you're concerned about headaches and elevated blood pressure. Based on your recent readings (145/92), this is indeed higher than your normal range (120/80). While I can't diagnose conditions, persistent headaches with elevated BP could warrant medical attention. Would you like me to help schedule an appointment with your doctor?",
    },
    {
      user: "What lifestyle changes can help reduce blood pressure?",
      assistant: "Great question! Several lifestyle modifications can help manage blood pressure: reduce sodium intake, increase physical activity (aim for 150 minutes weekly), maintain healthy weight, limit alcohol, quit smoking, manage stress, and ensure adequate sleep. Your metrics show improvement when your daily steps exceed 8,000 - would you like me to create a personalized plan based on your data?",
    },
  ];

  useEffect(() => {
    if (!containerRef) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsInView(true);
          observer.unobserve(containerRef);
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(containerRef);

    return () => {
      observer.unobserve(containerRef);
    };
  }, [containerRef]);

  useEffect(() => {
    if (!isInView) return;

    let timeoutId: NodeJS.Timeout;

    const runDemo = async () => {
      // Add user message
      setMessages((prev) => [
        ...prev,
        {
          role: "user",
          content: demoInteractions[currentInteraction].user,
          status: "complete",
        },
      ]);

      // Add assistant message with typing effect
      timeoutId = setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: "",
            status: "typing",
          },
        ]);

        // Start typing effect
        let i = 0;
        const response = demoInteractions[currentInteraction].assistant;
        const typingInterval = setInterval(() => {
          if (i < response.length) {
            setMessages((prev) => {
              const newMessages = [...prev];
              const lastMessage = newMessages[newMessages.length - 1];
              if (lastMessage.status === "typing") {
                lastMessage.content = response.substring(0, i + 1);
              }
              return newMessages;
            });
            i++;
          } else {
            clearInterval(typingInterval);
            setMessages((prev) => {
              const newMessages = [...prev];
              const lastMessage = newMessages[newMessages.length - 1];
              if (lastMessage.status === "typing") {
                lastMessage.status = "complete";
              }
              return newMessages;
            });

            // Move to next interaction or restart
            if (currentInteraction < demoInteractions.length - 1) {
              setTimeout(() => {
                setCurrentInteraction((prev) => prev + 1);
              }, 3000);
            } else {
              setTimeout(() => {
                setMessages([
                  {
                    role: "assistant",
                    content: "Hi there! I'm your healthcare assistant. How can I help you today?",
                    status: "complete",
                  },
                ]);
                setCurrentInteraction(0);
              }, 5000);
            }
          }
        }, 30);
      }, 1500);
    };

    if (isInView) {
      runDemo();
    }

    return () => {
      clearTimeout(timeoutId);
    };
  }, [currentInteraction, isInView]);

  return (
    <div
      ref={setContainerRef}
      className="w-full max-w-2xl mx-auto rounded-2xl overflow-hidden backdrop-blur-lg border border-white/20 shadow-xl transition-all duration-500 bg-white/90"
    >
      <div className="bg-primary/90 p-4 text-white flex items-center">
        <MessageCircle className="w-5 h-5 mr-2" />
        <h3 className="font-medium">AI Health Assistant</h3>
      </div>
      <div className="h-96 overflow-y-auto p-4 flex flex-col space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${
              message.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`flex max-w-[80%] ${
                message.role === "user" ? "flex-row-reverse" : "flex-row"
              }`}
            >
              <div
                className={`flex items-center justify-center w-8 h-8 rounded-full flex-shrink-0 ${
                  message.role === "user"
                    ? "bg-primary text-white ml-2"
                    : "bg-muted mr-2"
                }`}
              >
                {message.role === "user" ? (
                  <User className="w-4 h-4" />
                ) : (
                  <Bot className="w-4 h-4" />
                )}
              </div>
              <div
                className={`p-3 rounded-2xl ${
                  message.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-foreground"
                }`}
              >
                <p>{message.content}</p>
                {message.status === "typing" && (
                  <div className="flex space-x-1 mt-1">
                    <div className="w-1.5 h-1.5 bg-current rounded-full animate-pulse"></div>
                    <div className="w-1.5 h-1.5 bg-current rounded-full animate-pulse" style={{ animationDelay: "0.2s" }}></div>
                    <div className="w-1.5 h-1.5 bg-current rounded-full animate-pulse" style={{ animationDelay: "0.4s" }}></div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="p-4 border-t">
        <div className="flex space-x-2">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Type your health question here..."
              className="w-full px-4 py-2 rounded-full border focus:outline-none focus:ring-2 focus:ring-primary"
              disabled
            />
          </div>
          <Button
            disabled
            size="icon"
            className="rounded-full"
          >
            <MessageCircle className="h-5 w-5" />
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-2 text-center">
          Your data is private and secure. We never share your health information.
        </p>
      </div>
    </div>
  );
};

export default AIPreview;
