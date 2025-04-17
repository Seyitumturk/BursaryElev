import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';
import mongoose from 'mongoose';
import { IScrapedBursary } from '../../../models/ScrapedBursary';

// Get MongoDB connection string from environment
const MONGODB_URI = process.env.MONGODB_URI;

// Cache variable for MongoDB connection
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

// MongoDB connection function
async function connectMongo() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI!, opts).then((mongoose) => {
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

// Get ScrapedBursary model (or create it if it doesn't exist)
function getScrapedBursaryModel() {
  // Define schema if it doesn't exist
  const ScrapedBursarySchema = new mongoose.Schema(
    {
      title: { type: String, required: true },
      amount: { type: String },
      description: { type: String },
      deadline: { type: String },
      url: { type: String },
      source: { type: String, required: true },
      scrapedAt: { type: Date, default: Date.now }
    },
    { timestamps: true }
  );
  
  // Create a compound index on title and source to prevent duplicates
  ScrapedBursarySchema.index({ title: 1, source: 1 }, { unique: true });
  
  // Return existing model or create a new one
  return mongoose.models.ScrapedBursary || 
    mongoose.model<IScrapedBursary & mongoose.Document>('ScrapedBursary', ScrapedBursarySchema);
}

// Determine if we should scrape fresh data or use cached data
const CACHE_TIME_MS = 24 * 60 * 60 * 1000; // 24 hours cache

// Function to scrape bursaries from ScholarshipsCanada
async function scrapeScholarshipsCanada() {
  try {
    const response = await fetch('https://www.scholarshipscanada.com/Scholarships/SearchResult.aspx?Region=Atlantic&Province=&Category=&Keywords=');
    const html = await response.text();
    const $ = cheerio.load(html);
    
    const bursaries = [];
    
    // Identify and extract scholarship listings
    $('.scholarship-result-row, .scholarship-row, .scholarship-item, .row-container').each((i, element) => {
      // Try different possible selectors for scholarship items
      const title = $(element).find('h3, .title, .name, h4, .scholarship-title, a[data-ga-label="ScholarshipTitle"]').first().text().trim();
      if (!title) return; // Skip if no title found (not a scholarship item)
      
      // Try different possible selectors for amounts
      let amount = $(element).find('.amount, .award-amount, .scholarship-amount, .value').first().text().trim();
      if (!amount) {
        // Look for dollar values in any text
        const amountMatch = $(element).text().match(/\$[\d,]+(\.\d{2})?/);
        if (amountMatch) amount = amountMatch[0];
      }
      
      // Try different possible selectors for deadlines
      let deadline = $(element).find('.deadline, .due-date, .scholarship-deadline, .date').first().text().trim();
      if (!deadline) {
        // Look for date patterns in any text
        const dateMatch = $(element).text().match(/\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]* \d{1,2}(,? \d{4})?/i);
        if (dateMatch) deadline = dateMatch[0];
      }
      
      // Try to find a link
      const linkElem = $(element).find('a[href*="scholarship"], a[href*="bursary"], a[href*="award"]').first();
      const url = linkElem.attr('href');
      
      // Extract a basic description if available
      const description = $(element).find('.description, .details, p').first().text().trim();
      
      if (title) {
        bursaries.push({
          title,
          amount: amount || 'Varies',
          deadline: deadline || 'See website for details',
          description: description || '',
          url: url ? (url.startsWith('http') ? url : `https://www.scholarshipscanada.com${url}`) : null,
          source: 'ScholarshipsCanada'
        });
      }
    });
    
    // If no results found using the selectors, create a sample entry
    if (bursaries.length === 0) {
      bursaries.push({
        title: 'Atlantic Canada Scholarship Opportunities',
        amount: 'Varies',
        deadline: 'Multiple deadlines',
        description: 'Various scholarships available for students in Atlantic Canada. Visit the website for the most current listings.',
        url: 'https://www.scholarshipscanada.com/Scholarships/SearchResult.aspx?Region=Atlantic',
        source: 'ScholarshipsCanada'
      });
    }
    
    return bursaries;
  } catch (error) {
    console.error('Error scraping ScholarshipsCanada:', error);
    // Return a fallback entry in case of error
    return [{
      title: 'Atlantic Canada Scholarship Opportunities',
      amount: 'Varies',
      deadline: 'Multiple deadlines',
      description: 'Various scholarships available for students in Atlantic Canada. Visit the website for the most current listings.',
      url: 'https://www.scholarshipscanada.com/Scholarships/SearchResult.aspx?Region=Atlantic',
      source: 'ScholarshipsCanada'
    }];
  }
}

// Function to scrape bursaries from Indigenous resources
async function scrapeIndigenousResources() {
  try {
    const response = await fetch('https://indspire.ca/programs/students/bursaries-scholarships/');
    const html = await response.text();
    const $ = cheerio.load(html);
    
    const bursaries = [];
    
    // Try multiple selectors to find scholarship listings
    $('.scholarship-listing, .bursary-item, .award-item, article, .card, .listing').each((i, element) => {
      const title = $(element).find('h2, h3, h4, .title, .heading').first().text().trim();
      if (!title) return; // Skip if no title found
      
      const description = $(element).find('p, .description, .content, .details').first().text().trim();
      const deadline = $(element).find('.deadline, .date, .due-date, time').first().text().trim();
      
      bursaries.push({
        title,
        description: description || 'Visit website for more details',
        deadline: deadline || 'See website for details',
        url: 'https://indspire.ca/programs/students/bursaries-scholarships/',
        source: 'Indspire'
      });
    });
    
    // If no results found with the selectors, create sample entries
    if (bursaries.length === 0) {
      bursaries.push({
        title: 'Building Brighter Futures: Bursaries, Scholarships, and Awards',
        description: 'Financial assistance for Indigenous students pursuing post-secondary education. Various scholarships and bursaries available.',
        deadline: 'February 1, August 1, November 1',
        url: 'https://indspire.ca/programs/students/bursaries-scholarships/',
        source: 'Indspire'
      },
      {
        title: 'Indigenous Scholarship Partners',
        description: 'Indspire partners with organizations to provide scholarships specifically for Indigenous students in various fields of study.',
        deadline: 'Varies by program',
        url: 'https://indspire.ca/programs/students/bursaries-scholarships/',
        source: 'Indspire'
      });
    }
    
    return bursaries;
  } catch (error) {
    console.error('Error scraping Indigenous resources:', error);
    // Return fallback entries in case of error
    return [
      {
        title: 'Building Brighter Futures: Bursaries, Scholarships, and Awards',
        description: 'Financial assistance for Indigenous students pursuing post-secondary education. Various scholarships and bursaries available.',
        deadline: 'February 1, August 1, November 1',
        url: 'https://indspire.ca/programs/students/bursaries-scholarships/',
        source: 'Indspire'
      },
      {
        title: 'Indigenous Scholarship Partners',
        description: 'Indspire partners with organizations to provide scholarships specifically for Indigenous students in various fields of study.',
        deadline: 'Varies by program',
        url: 'https://indspire.ca/programs/students/bursaries-scholarships/',
        source: 'Indspire'
      }
    ];
  }
}

// Function to scrape bursaries from Universities Canada
async function scrapeUniversitiesCanada() {
  try {
    const response = await fetch('https://www.univcan.ca/programs-and-scholarships/scholarship-partners-canada/');
    const html = await response.text();
    const $ = cheerio.load(html);
    
    const bursaries = [];
    
    // Try to extract scholarship information
    $('.scholarship, .award, .program-item, article, .entry-content p').each((i, element) => {
      // Look for scholarship titles
      let title = '';
      if ($(element).find('h2, h3, h4, strong').length) {
        title = $(element).find('h2, h3, h4, strong').first().text().trim();
      } else if ($(element).is('p') && $(element).text().includes('Scholarship')) {
        title = $(element).text().trim().split('.')[0];
      }
      
      if (!title) return; // Skip if no title
      
      // Extract description and details
      let description = '';
      if ($(element).find('p').length) {
        description = $(element).find('p').text().trim();
      } else if ($(element).next('p').length) {
        description = $(element).next('p').text().trim();
      } else {
        description = $(element).text().replace(title, '').trim();
      }
      
      if (title) {
        bursaries.push({
          title,
          description: description || 'Visit website for more details',
          deadline: 'See website for details',
          url: 'https://www.univcan.ca/programs-and-scholarships/scholarship-partners-canada/',
          source: 'Universities Canada'
        });
      }
    });
    
    // If no results found, add default entries
    if (bursaries.length === 0) {
      bursaries.push({
        title: 'Scholarship Partners Canada',
        description: 'Universities Canada manages more than 130 scholarship programs on behalf of private sector companies, governments and foundations throughout North America.',
        deadline: 'Various deadlines',
        url: 'https://www.univcan.ca/programs-and-scholarships/scholarship-partners-canada/',
        source: 'Universities Canada'
      },
      {
        title: 'Atlantic Canada Scholarships',
        description: 'Various scholarships available to students in Atlantic provinces through Universities Canada partners.',
        deadline: 'Check website for program-specific deadlines',
        url: 'https://www.univcan.ca/programs-and-scholarships/scholarship-partners-canada/',
        source: 'Universities Canada'
      });
    }
    
    return bursaries;
  } catch (error) {
    console.error('Error scraping Universities Canada:', error);
    // Return fallback entries
    return [
      {
        title: 'Scholarship Partners Canada',
        description: 'Universities Canada manages more than 130 scholarship programs on behalf of private sector companies, governments and foundations throughout North America.',
        deadline: 'Various deadlines',
        url: 'https://www.univcan.ca/programs-and-scholarships/scholarship-partners-canada/',
        source: 'Universities Canada'
      },
      {
        title: 'Atlantic Canada Scholarships',
        description: 'Various scholarships available to students in Atlantic provinces through Universities Canada partners.',
        deadline: 'Check website for program-specific deadlines',
        url: 'https://www.univcan.ca/programs-and-scholarships/scholarship-partners-canada/',
        source: 'Universities Canada'
      }
    ];
  }
}

// Function to check if we need to refresh data
async function needsRefresh() {
  try {
    await connectMongo();
    const ScrapedBursary = getScrapedBursaryModel();
    const latestBursary = await ScrapedBursary.findOne().sort({ scrapedAt: -1 });
    
    if (!latestBursary) return true;
    
    const timeSinceLastScrape = Date.now() - new Date(latestBursary.scrapedAt).getTime();
    return timeSinceLastScrape > CACHE_TIME_MS;
  } catch (error) {
    console.error('Error checking refresh status:', error);
    return true; // If there's an error, assume we need to refresh
  }
}

// Handler for GET requests
export async function GET(request: Request) {
  try {
    await connectMongo();
    const ScrapedBursary = getScrapedBursaryModel();
    
    // Check URL params to see if a force refresh is requested
    const url = new URL(request.url);
    const forceRefresh = url.searchParams.get('refresh') === 'true';
    
    // Check if we need fresh data
    const shouldRefresh = forceRefresh || await needsRefresh();
    
    // If we don't need fresh data, return cached data
    if (!shouldRefresh) {
      const cachedBursaries = await ScrapedBursary.find().sort({ createdAt: -1 });
      return NextResponse.json({ bursaries: cachedBursaries, cached: true }, { status: 200 });
    }
    
    // Scrape from multiple sources
    const [scholarshipsCanada, indigenousResources, universitiesCanada] = await Promise.all([
      scrapeScholarshipsCanada(),
      scrapeIndigenousResources(),
      scrapeUniversitiesCanada()
    ]);
    
    // Combine results from all sources
    const scrapedBursaries = [
      ...scholarshipsCanada,
      ...indigenousResources,
      ...universitiesCanada
    ];
    
    // Store in database - use bulkWrite for better performance
    if (scrapedBursaries.length > 0) {
      const operations = scrapedBursaries.map(bursary => ({
        updateOne: {
          filter: { title: bursary.title, source: bursary.source },
          update: { 
            ...bursary,
            scrapedAt: new Date() 
          },
          upsert: true
        }
      }));
      
      await ScrapedBursary.bulkWrite(operations);
    }
    
    // Return the fresh results
    const savedBursaries = await ScrapedBursary.find().sort({ createdAt: -1 });
    return NextResponse.json({ bursaries: savedBursaries, cached: false }, { status: 200 });
  } catch (error) {
    console.error('Error in scraping API:', error);
    
    // If there's an error, try to at least return any cached data we have
    try {
      const ScrapedBursary = getScrapedBursaryModel();
      const cachedBursaries = await ScrapedBursary.find().sort({ createdAt: -1 });
      if (cachedBursaries.length > 0) {
        return NextResponse.json({ 
          bursaries: cachedBursaries, 
          cached: true,
          error: 'Failed to fetch fresh data, showing cached results' 
        }, { status: 200 });
      }
    } catch (cacheError) {
      console.error('Error fetching cached data:', cacheError);
    }
    
    return NextResponse.json(
      { error: 'Failed to scrape opportunities' },
      { status: 500 }
    );
  }
} 