import { toast } from "@/components/ui/use-toast";

// Define interface for chat messages
export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

// Ollama API configuration
const OLLAMA_API_URL = 'http://localhost:11434'; // Default Ollama API URL

// Model to use - match the model you have installed
const DEFAULT_MODEL = 'llama3.2'; 

// Default system prompt for health assistant
export const DEFAULT_SYSTEM_PROMPT = `You are HealthyAI, a helpful and knowledgeable health assistant designed to provide concise information about health topics.

IMPORTANT INSTRUCTIONS:
1. Keep your responses brief and to the point - aim for 1-3 short paragraphs maximum.
2. Use simple, clear language that anyone can understand.
3. Avoid lengthy explanations - be direct and concise.
4. When providing health information, balance being helpful with being concise.
5. Prioritize clarity over comprehensiveness.
6. Break responses into short bullet points when appropriate.

When providing health information:
- Be clear that you're not a doctor or medical professional
- Encourage users to seek professional medical advice for specific health concerns
- Avoid making definitive diagnoses or prescribing treatments
- Focus on evidence-based information from reliable sources
- Acknowledge limitations of your knowledge and be transparent when you're unsure

Your purpose is to help users understand general health concepts, lifestyle improvements, and wellness strategies in a clear, concise, and friendly manner.`;

/**
 * Format messages for the completion API
 */
function formatPrompt(messages: Message[]): string {
  let prompt = DEFAULT_SYSTEM_PROMPT + "\n\n";
  
  // Add conversation history
  for (const msg of messages) {
    if (msg.role === 'user') {
      prompt += `User: ${msg.content}\n`;
    } else if (msg.role === 'assistant') {
      prompt += `Assistant: ${msg.content}\n`;
    } else if (msg.role === 'system' && msg.content !== DEFAULT_SYSTEM_PROMPT) {
      // Add custom system messages as context notes
      prompt += `Context: ${msg.content}\n`;
    }
  }
  
  // Add assistant prompt
  prompt += "Assistant: ";
  
  return prompt;
}

/**
 * Chat completion with Ollama using the completion API instead of chat API
 * to avoid JSON parsing issues
 */
export async function ollamaChat(
  messages: Message[],
  options: {
    model?: string;
    temperature?: number;
    maxTokens?: number;
  } = {}
): Promise<string> {
  const {
    model = DEFAULT_MODEL,
    temperature = 0.7,
    maxTokens = 500,
  } = options;

  // Add system message if not already present
  if (!messages.some(msg => msg.role === 'system')) {
    messages = [
      { role: 'system', content: DEFAULT_SYSTEM_PROMPT },
      ...messages
    ];
  }

  try {
    console.log('Sending request to Ollama Completion API:', {
      model,
      messagesCount: messages.length,
      endpoint: `${OLLAMA_API_URL}/api/generate`
    });
    
    // Format the messages into a single prompt string
    const formattedPrompt = formatPrompt(messages);
    console.log('Formatted prompt:', formattedPrompt);
    
    // Use the completion API instead of the chat API
    const response = await fetch(`${OLLAMA_API_URL}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        prompt: formattedPrompt,
        stream: false,
        options: {
          temperature,
          num_predict: maxTokens,
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Ollama API error response:', {
        status: response.status,
        statusText: response.statusText,
        errorText
      });
      throw new Error(`Ollama API error: ${response.status} - ${errorText}`);
    }

    // Get the raw text first for debugging
    const rawText = await response.text();
    console.log('Raw response:', rawText);
    
    // Parse the response
    let data;
    try {
      data = JSON.parse(rawText);
    } catch (jsonError) {
      console.error('JSON parsing error:', jsonError);
      throw new Error(`Failed to parse Ollama response: ${jsonError.message}`);
    }
    
    if (data && data.response) {
      return data.response;
    } else {
      console.error('Unexpected API response format:', data);
      return 'Received an unexpected response format from the AI service.';
    }
  } catch (error) {
    console.error('Error calling Ollama API:', error);
    toast({
      title: "AI Assistant Error",
      description: "Failed to connect to the AI assistant. Make sure Ollama is running locally.",
      variant: "destructive",
    });
    return "I'm having trouble connecting to the AI service. Please make sure Ollama is running on your machine. Error details: " + (error instanceof Error ? error.message : String(error));
  }
}

/**
 * Available health models from Ollama
 */
export async function listAvailableModels(): Promise<string[]> {
  try {
    console.log('Fetching available models from Ollama');
    const response = await fetch(`${OLLAMA_API_URL}/api/tags`);
    if (!response.ok) {
      console.error('Failed to fetch models:', response.status, response.statusText);
      throw new Error(`Failed to fetch models: ${response.status}`);
    }
    const data = await response.json();
    console.log('Available models:', data);
    
    if (!data.models) {
      console.warn('No models found in response:', data);
      return [];
    }
    
    return data.models.map((model: any) => model.name) || [];
  } catch (error) {
    console.error('Error listing models:', error);
    return [];
  }
}

/**
 * Pull a health-specific model if possible
 */
export async function pullHealthModel(model: string = 'llama3'): Promise<boolean> {
  try {
    const response = await fetch(`${OLLAMA_API_URL}/api/pull`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: model,
      }),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to pull model: ${response.status}`);
    }
    
    return true;
  } catch (error) {
    console.error('Error pulling model:', error);
    return false;
  }
}

/**
 * Function to ensure a health-focused response by checking the prompt
 */
export function isHealthRelatedQuery(query: string): boolean {
  // Basic keywords to identify health-related queries
  const healthKeywords = [
    'health', 'medical', 'medicine', 'doctor', 'nurse', 'hospital', 'clinic',
    'symptom', 'disease', 'condition', 'treatment', 'therapy', 'diagnosis',
    'diet', 'nutrition', 'exercise', 'fitness', 'workout', 'calories',
    'protein', 'carbs', 'fat', 'vitamin', 'mineral', 'supplement',
    'sleep', 'stress', 'anxiety', 'depression', 'mental health',
    'blood pressure', 'heart rate', 'glucose', 'cholesterol', 'BMI',
    'weight', 'body mass', 'metabolism', 'cardio', 'strength training'
  ];
  
  const lowerQuery = query.toLowerCase();
  
  // Check if query contains any health-related keywords
  return healthKeywords.some(keyword => lowerQuery.includes(keyword.toLowerCase()));
} 