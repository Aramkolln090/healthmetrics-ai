import { KnowledgeEntry } from "@/components/ai/HealthKnowledgeBase";

// Local storage key for knowledge base
const KNOWLEDGE_BASE_STORAGE_KEY = 'health_knowledge_base';

/**
 * Save knowledge base to local storage
 */
export function saveKnowledgeBase(entries: KnowledgeEntry[]): void {
  localStorage.setItem(KNOWLEDGE_BASE_STORAGE_KEY, JSON.stringify(entries));
}

/**
 * Load knowledge base from local storage
 */
export function loadKnowledgeBase(): KnowledgeEntry[] {
  const stored = localStorage.getItem(KNOWLEDGE_BASE_STORAGE_KEY);
  if (!stored) return [];
  
  try {
    return JSON.parse(stored);
  } catch (e) {
    console.error('Failed to parse knowledge base from local storage:', e);
    return [];
  }
}

/**
 * Find relevant knowledge entries for a query
 */
export function findRelevantKnowledge(query: string, entries: KnowledgeEntry[], maxResults: number = 3): KnowledgeEntry[] {
  // Simple relevance algorithm - checks for keyword matches in title and content
  // A more sophisticated implementation could use embeddings or a vector database
  const queryTerms = query.toLowerCase().split(/\s+/).filter(term => term.length > 3);
  
  // Calculate relevance score for each entry
  const scoredEntries = entries.map(entry => {
    const titleLower = entry.title.toLowerCase();
    const contentLower = entry.content.toLowerCase();
    const categoryLower = entry.category.toLowerCase();
    
    let score = 0;
    
    // Check for direct term matches
    queryTerms.forEach(term => {
      // Title matches are weighted heavily
      if (titleLower.includes(term)) score += 10;
      
      // Category matches are weighted medium
      if (categoryLower === term) score += 5;
      
      // Content matches are counted by occurrence
      const contentMatches = (contentLower.match(new RegExp(term, 'g')) || []).length;
      score += contentMatches;
    });
    
    return {
      entry,
      score
    };
  });
  
  // Sort by score (highest first) and take top results
  return scoredEntries
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, maxResults)
    .map(item => item.entry);
}

/**
 * Generate a knowledge context prompt for the AI
 */
export function generateKnowledgeContextPrompt(query: string, knowledgeBase: KnowledgeEntry[]): string {
  const relevantEntries = findRelevantKnowledge(query, knowledgeBase);
  
  if (relevantEntries.length === 0) {
    return "";
  }
  
  // Construct a context prompt with the relevant knowledge
  let contextPrompt = `Here is some relevant health information to consider when answering:\n\n`;
  
  relevantEntries.forEach((entry, index) => {
    contextPrompt += `--- ${entry.title} ---\n${entry.content}\nSource: ${entry.sources}\n\n`;
  });
  
  contextPrompt += `Please use this information to provide an accurate and helpful response to the user's question.`;
  
  return contextPrompt;
}

/**
 * Enhance a user query with knowledge context for improved AI responses
 */
export function enhanceWithKnowledgeContext(userMessage: string, knowledgeBase: KnowledgeEntry[]): string {
  const contextPrompt = generateKnowledgeContextPrompt(userMessage, knowledgeBase);
  
  if (!contextPrompt) {
    return userMessage;
  }
  
  // Combine the user's message with the context prompt
  return `${userMessage}\n\n[CONTEXT INFORMATION: This is for you to consider, not to repeat verbatim to the user]\n${contextPrompt}`;
} 