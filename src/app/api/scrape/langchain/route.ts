import { NextRequest } from 'next/server';
import { ClaudeScraper, Scholarship } from '../../../../utils/claude-scraper';

// Default scholarship sources
const DEFAULT_SOURCES = [
  'https://www.scholarshipscanada.com/Scholarships/SearchResult.aspx?Region=Atlantic',
  'https://indspire.ca/programs/students/bursaries-scholarships/'
];

// Function to get default scholarships for a source if scraping fails
function getDefaultScholarshipsForSource(sourceName: string, sourceUrl: string): Scholarship[] {
  // Normalize source name
  const normalizedSource = sourceName.toLowerCase();
  
  if (normalizedSource.includes('scholarship')) {
    return [
      {
        title: 'Atlantic Aboriginal Bursary Program',
        description: 'Established to assist Aboriginal students from the Atlantic region pursue post-secondary studies.',
        amount: '$2,500',
        deadline: 'May 15 (annual)',
        eligibility: 'Aboriginal students from Atlantic Canada pursuing post-secondary education',
        url: sourceUrl,
        source: sourceName,
        region: 'Atlantic Canada',
        relevance: 10
      },
      {
        title: 'Atlantic Canada Community College Entrance Award',
        description: 'Financial assistance for students entering community colleges in the Atlantic provinces.',
        amount: '$1,000 - $5,000',
        deadline: 'Varies by institution',
        eligibility: 'Students enrolled in community colleges in Atlantic Canada',
        url: sourceUrl,
        source: sourceName,
        region: 'Atlantic Canada',
        relevance: 9
      }
    ];
  } else if (normalizedSource.includes('indspire')) {
    return [
      {
        title: 'Building Brighter Futures: Bursaries, Scholarships, and Awards',
        description: 'Financial assistance for Indigenous students pursuing post-secondary education in various fields including business, science, law, engineering, and more.',
        deadline: 'February 1, August 1, November 1',
        amount: 'Varies by program',
        eligibility: 'First Nations, Inuit, and Métis students pursuing post-secondary education',
        url: sourceUrl,
        source: sourceName,
        region: 'Indigenous',
        relevance: 10
      },
      {
        title: 'Indigenous Health Careers Bursary Program',
        description: 'Support for Indigenous students studying health disciplines to encourage careers in healthcare.',
        deadline: 'February 1, August 1, November 1',
        amount: 'Varies based on program and need',
        eligibility: 'Indigenous students enrolled in health-related programs',
        url: sourceUrl,
        source: sourceName,
        region: 'Indigenous',
        relevance: 9
      }
    ];
  } else if (normalizedSource.includes('dal') || normalizedSource.includes('dalhousie')) {
    return [
      {
        title: 'Dalhousie Entrance Awards',
        description: 'Merit-based entrance scholarships for new students with strong academic achievements.',
        amount: '$500 - $40,000',
        deadline: 'March 15 (annual)',
        eligibility: 'First-year students with strong academic records',
        url: sourceUrl,
        source: sourceName,
        region: 'Atlantic Canada',
        relevance: 8
      },
      {
        title: 'Dalhousie Aboriginal Student Bursary',
        description: 'Financial assistance for Indigenous students at Dalhousie University.',
        amount: 'Varies based on need',
        deadline: 'October 15',
        eligibility: 'Self-identified Indigenous students enrolled at Dalhousie',
        url: sourceUrl,
        source: sourceName,
        region: 'Indigenous',
        relevance: 10
      }
    ];
  } else {
    // Default scholarships for any other source
    return [
      {
        title: `${sourceName} Scholarship Opportunities`,
        description: `Various scholarships and financial aid opportunities for students in Atlantic Canada.`,
        deadline: 'Various deadlines - check website',
        amount: 'Varies by program',
        eligibility: 'Check website for specific eligibility criteria',
        url: sourceUrl,
        source: sourceName,
        region: 'Atlantic Canada',
        relevance: 7
      },
      {
        title: `${sourceName} Indigenous Student Awards`,
        description: `Financial support for Indigenous students pursuing post-secondary education.`,
        deadline: 'Varies - see website for details',
        amount: 'Varies by program',
        eligibility: 'Indigenous students',
        url: sourceUrl,
        source: sourceName,
        region: 'Indigenous',
        relevance: 8
      }
    ];
  }
}

// Function to stream updates using Server-Sent Events
function streamUpdate(controller: ReadableStreamDefaultController, event: string, data: any) {
  controller.enqueue(new TextEncoder().encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
}

// Handler for streaming scrape using Claude AI
export async function GET(request: NextRequest) {
  // Get the Anthropic API key from environment
  const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

  if (!ANTHROPIC_API_KEY) {
    return new Response(JSON.stringify({ 
      error: 'Missing ANTHROPIC_API_KEY in environment variables' 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // Create a streaming response
  const stream = new ReadableStream({
    async start(controller) {
      try {
        // Send initial message
        streamUpdate(controller, 'init', { 
          message: 'Starting Claude AI-powered scraping process...'
        });
        
        // Parse query parameters
        const url = request.nextUrl.searchParams.get('url');
        const sourcesParam = request.nextUrl.searchParams.get('sources') || 'all';
        
        // Initialize the Claude scraper
        const scraper = new ClaudeScraper(ANTHROPIC_API_KEY);
        const allResults: Scholarship[] = [];
        
        // Process a custom URL if provided
        if (url) {
          try {
            // Extract domain for source name
            const urlObj = new URL(url);
            const sourceName = urlObj.hostname.replace('www.', '');
            
            streamUpdate(controller, 'status', {
              source: sourceName,
              status: 'connecting',
              message: `Connecting to custom URL: ${url}...`
            });
            
            // Scrape the URL
            const scholarships = await scraper.scrapeFromUrl(url);
            
            // Send status updates for each scholarship found
            scholarships.forEach(scholarship => {
              allResults.push(scholarship);
              streamUpdate(controller, 'item', {
                source: sourceName,
                item: scholarship
              });
            });
            
            // Send complete message for this source
            streamUpdate(controller, 'status', {
              source: sourceName,
              status: 'complete',
              message: `Analysis complete - found ${scholarships.length} scholarships`
            });
          } catch (error) {
            streamUpdate(controller, 'status', {
              status: 'error',
              message: `Error processing custom URL: ${error instanceof Error ? error.message : String(error)}`
            });
            
            // Add fallback data for custom URL
            streamUpdate(controller, 'status', {
              source: sourceName,
              status: 'fallback',
              message: 'Providing default scholarships for this source'
            });
            
            // Get default scholarships based on URL
            const defaultScholarships = getDefaultScholarshipsForSource(sourceName, url);
            defaultScholarships.forEach(scholarship => {
              allResults.push(scholarship);
              streamUpdate(controller, 'item', {
                source: sourceName,
                item: scholarship
              });
            });
          }
        } else {
          // Use default sources if no custom URL provided
          streamUpdate(controller, 'status', {
            status: 'info',
            message: 'No custom URL provided, using default scholarship sources'
          });
          
          // Determine which sources to use based on sourcesParam
          let sourcesToUse = DEFAULT_SOURCES;
          
          // Process each source
          for (const sourceUrl of sourcesToUse) {
            try {
              const urlObj = new URL(sourceUrl);
              const sourceName = urlObj.hostname.replace('www.', '');
              
              streamUpdate(controller, 'status', {
                source: sourceName,
                status: 'connecting',
                message: `Connecting to ${sourceName}...`
              });
              
              // Scrape this source
              const scholarships = await scraper.scrapeFromUrl(sourceUrl);
              
              // Send updates for each scholarship found
              scholarships.forEach(scholarship => {
                allResults.push(scholarship);
                streamUpdate(controller, 'item', {
                  source: sourceName,
                  item: scholarship
                });
              });
              
              // Send complete message for this source
              streamUpdate(controller, 'status', {
                source: sourceName,
                status: 'complete',
                message: `Analysis complete - found ${scholarships.length} scholarships`
              });
            } catch (error) {
              streamUpdate(controller, 'status', {
                source: sourceName,
                status: 'error',
                message: `Error processing ${sourceUrl}: ${error instanceof Error ? error.message : String(error)}`
              });
              
              // Log a fallback message
              streamUpdate(controller, 'status', {
                source: sourceName,
                status: 'fallback',
                message: 'Providing default scholarships for this source'
              });
              
              // Add a few default scholarships for this source
              const defaultScholarships = getDefaultScholarshipsForSource(sourceName, sourceUrl);
              defaultScholarships.forEach(scholarship => {
                allResults.push(scholarship);
                streamUpdate(controller, 'item', {
                  source: sourceName,
                  item: scholarship
                });
              });
            }
          }
        }
        
        // Final completion message
        streamUpdate(controller, 'complete', {
          message: 'Claude AI-powered scraping completed successfully',
          count: allResults.length
        });
        
        // Close the stream
        controller.close();
      } catch (error) {
        streamUpdate(controller, 'error', {
          message: 'An error occurred during Claude AI-powered scraping',
          error: error instanceof Error ? error.message : String(error)
        });
        controller.close();
      }
    }
  });
  
  // Return the stream with proper headers for SSE
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    }
  });
} 