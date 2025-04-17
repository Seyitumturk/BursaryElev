import { Document } from "mongoose";

export interface IScrapedBursary extends Document {
  title: string;
  amount?: string;
  description?: string;
  deadline?: string;
  url?: string;
  source: string;
  scrapedAt: Date;
} 