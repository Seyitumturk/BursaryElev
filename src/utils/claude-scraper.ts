import { ChatAnthropic } from '@langchain/anthropic';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { CheerioWebBaseLoader } from '@langchain/community/document_loaders/web/cheerio';
import { StructuredOutputParser } from '@langchain/core/output_parsers';
import { PromptTemplate } from '@langchain/core/prompts';
import { z } from 'zod';

// Define the scholarship schema
const scholarshipSchema = z.object({
  title: z.string().describe("The full title of the scholarship or bursary"),
  amount: z.string().describe("The monetary value of the scholarship (e.g. '$5,000', 'Up to $10,000', or 'Varies')"),
  deadline: z.string().describe("The application deadline date(s) (e.g. 'March 31, 2023', 'Rolling', or 'See website for details')"),
  description: z.string().describe("A brief description of the scholarship, including eligibility criteria and purpose"),
  eligibility: z.string().describe("The eligibility requirements for applicants"),
  region: z.string().optional().describe("The geographic region this scholarship is specific to, if any (e.g. 'Atlantic Canada', 'Indigenous')"),
});

export type Scholarship = z.infer<typeof scholarshipSchema> & {
  source: string;
  url: string;
  relevance?: number;
  scrapedAt?: Date;
};

/**
 * Utility class that provides Claude AI-based scholarship scraping functionality
 */
export class ClaudeScraper {
  private anthropicApiKey: string;
  private model: ChatAnthropic;
  private parser: StructuredOutputParser;
  private promptTemplate: PromptTemplate;

  constructor(anthropicApiKey: string) {
    this.anthropicApiKey = anthropicApiKey;
    
    // Set up the Claude model
    this.model = new ChatAnthropic({
      anthropicApiKey: this.anthropicApiKey,
      modelName: "claude-3-haiku-20240307",
      temperature: 0.2,
    });
    
    // Create structured output parser
    this.parser = StructuredOutputParser.fromZodSchema(
      z.array(scholarshipSchema)
    );
    
    // Create prompt template
    this.promptTemplate = new PromptTemplate({
      template: `You are an expert at identifying scholarship and bursary information from website content.
      The following text was extracted from the website of {source_name}.
      
      Extract all scholarships, bursaries, and financial aid opportunities mentioned in the text.
      Focus specifically on extracting COMPLETE scholarship information. Only include scholarships
      that have enough information to be useful to students.
      
      Pay special attention to scholarships related to Atlantic Canada (Nova Scotia, New Brunswick, PEI,
      Newfoundland and Labrador) and Indigenous students.
      
      If the text is not about scholarships or doesn't contain identifiable scholarship information, return an empty array.
      
      Each scholarship entry should have a properly formatted title (not cut off or abbreviated),
      clear description, amount information if available, and deadline details.
      
      INPUT TEXT:
      {text}
      
      {format_instructions}
      `,
      inputVariables: ["text", "source_name"],
      partialVariables: {
        format_instructions: this.parser.getFormatInstructions(),
      },
    });
  }
  
  /**
   * Extracts scholarship data from a custom URL
   */
  async scrapeFromUrl(url: string, sourceName?: string): Promise<Scholarship[]> {
    try {
      // Use CheerioWebBaseLoader to load the page content
      const loader = new CheerioWebBaseLoader(url, {
        timeout: 15000,
        gzip: true,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });
      
      const docs = await loader.load();
      
      if (docs.length === 0) {
        throw new Error('No content could be loaded from the URL');
      }
      
      // If source name not provided, derive it from the URL
      if (!sourceName) {
        const urlObj = new URL(url);
        const hostname = urlObj.hostname.replace('www.', '');
        sourceName = hostname.split('.')[0].charAt(0).toUpperCase() + hostname.split('.')[0].slice(1);
      }
      
      // Use the content extraction method
      return this.extractScholarshipsFromContent(docs[0].pageContent, sourceName, url);
    } catch (error) {
      console.error(`Error processing URL ${url}:`, error);
      return [];
    }
  }
  
  /**
   * Extracts scholarships from text content
   */
  async extractScholarshipsFromContent(
    content: string,
    sourceName: string,
    baseUrl: string
  ): Promise<Scholarship[]> {
    // Split content into manageable chunks
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 12000,
      chunkOverlap: 200,
    });
    
    const chunks = await splitter.splitText(content);
    
    // Process each chunk and collect results
    let allScholarships: Scholarship[] = [];
    const maxChunksToProcess = 2;
    
    for (let i = 0; i < Math.min(chunks.length, maxChunksToProcess); i++) {
      try {
        // Format the prompt with this chunk
        const prompt = await this.promptTemplate.format({
          text: chunks[i],
          source_name: sourceName,
        });
        
        // Get Claude's response
        const response = await this.model.invoke(prompt);
        
        // Parse the scholarships
        let scholarships = [];
        try {
          // Safely access the response content
          let responseText = '';
          if (response?.content && Array.isArray(response.content) && response.content.length > 0 && typeof response.content[0]?.text === 'string') {
            responseText = response.content[0].text;
          } else {
            // Log unexpected response structure
            console.warn('Unexpected Claude response structure:', JSON.stringify(response, null, 2));
            throw new Error('Could not extract text from Claude response');
          }
          
          // Only attempt to parse if responseText is not empty
          if (responseText) {
            scholarships = await this.parser.parse(responseText);
          } else {
            throw new Error('Empty response text received from Claude');
          }
        } catch (err) {
          // Fallback: try to extract JSON manually
          console.error("Failed to parse structured output, attempting fallback:", err);
          let responseText = '';
          
          // Handle different potential response formats in fallback
          if (response?.content && Array.isArray(response.content) && response.content.length > 0 && typeof response.content[0]?.text === 'string') {
            responseText = response.content[0].text || '';
          } else if (response?.content && typeof response.content === 'string') {
            responseText = response.content;
          } else if (typeof response === 'string') {
            // If the response itself is a string (less likely with current model)
            responseText = response;
          }
          
          // Log the text we're trying to parse in fallback
          console.log("Attempting fallback JSON extraction from text:", responseText.substring(0, 200) + "...");
          
          const jsonMatch = responseText.match(/\[\s*\{.*\}\s*\]/s);
          if (jsonMatch) {
            try {
              scholarships = JSON.parse(jsonMatch[0]);
              console.log(`Fallback JSON extraction successful, found ${scholarships.length} items.`);
            } catch (e) {
              console.error("Failed to parse JSON from response even with fallback:", e);
              // If fallback fails, continue to the next chunk or return empty
            }
          } else {
            console.log("No JSON array found in fallback text.");
            // No valid JSON found, continue
          }
        }
        
        // Enhance scholarships with metadata
        if (scholarships.length > 0) {
          scholarships.forEach(scholarship => {
            scholarship.source = sourceName;
            scholarship.url = baseUrl;
            // Calculate relevance score
            scholarship.relevance = this.calculateRelevance(scholarship);
          });
          
          allScholarships = [...allScholarships, ...scholarships];
        }
      } catch (error) {
        console.error(`Error processing chunk ${i} for ${sourceName}:`, error);
      }
    }
    
    // Remove duplicates based on title
    const uniqueScholarships = allScholarships.filter((scholarship, index, self) =>
      index === self.findIndex((s) => s.title === scholarship.title)
    );
    
    // Sort by relevance
    uniqueScholarships.sort((a, b) => (b.relevance || 0) - (a.relevance || 0));
    
    return uniqueScholarships;
  }
  
  /**
   * Calculates relevance score for a scholarship
   */
  calculateRelevance(scholarship: any): number {
    let score = 0;
    const textToCheck = [
      scholarship.title,
      scholarship.description,
      scholarship.amount,
      scholarship.deadline,
      scholarship.eligibility
    ].filter(Boolean).join(' ').toLowerCase();
    
    // Check for Atlantic Canada keywords
    const atlanticKeywords = ['atlantic', 'nova scotia', 'new brunswick', 'pei', 'prince edward island', 'newfoundland', 'labrador', 'halifax', 'moncton', 'fredericton', 'charlottetown', 'st. john'];
    atlanticKeywords.forEach(keyword => {
      if (textToCheck.includes(keyword.toLowerCase())) {
        score += 5;
        scholarship.region = scholarship.region || 'Atlantic Canada';
      }
    });
    
    // Check for Indigenous keywords
    const indigenousKeywords = ['indigenous', 'aboriginal', 'first nation', 'métis', 'metis', 'inuit', 'native'];
    indigenousKeywords.forEach(keyword => {
      if (textToCheck.includes(keyword.toLowerCase())) {
        score += 5;
        scholarship.region = scholarship.region || 'Indigenous';
      }
    });
    
    // Check for education level
    const gradKeywords = ['undergrad', 'undergraduate', 'graduate', 'phd', 'master', 'doctoral', 'post-secondary', 'college', 'university'];
    gradKeywords.forEach(keyword => {
      if (textToCheck.includes(keyword.toLowerCase())) {
        score += 3;
      }
    });
    
    // Bonus for scholarship keywords
    const scholarshipKeywords = ['bursary', 'scholarship', 'grant', 'financial aid', 'fellowship', 'award'];
    scholarshipKeywords.forEach(keyword => {
      if (textToCheck.includes(keyword.toLowerCase())) {
        score += 2;
      }
    });
    
    return score;
  }
} 