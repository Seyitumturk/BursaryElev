import mongoose, { Schema, Document } from "mongoose";

export interface IBursary extends Document {
  organization: mongoose.Types.ObjectId;
  title: string;
  description: string;
  applicationUrl: string;
  deadline: Date;
  // New fields for enhanced bursary data
  eligibilityCriteria: string;
  awardAmount: number;
  fieldOfStudy: string[];
  academicLevel: string[];
  financialNeedLevel: string; // low, medium, high
  requiredDocuments: string[];
  // AI-generated fields
  aiTags: string[];
  aiCategorization: string[];
  contentModerationStatus: string; // approved, flagged, rejected
  competitionLevel: string; // low, medium, high (AI-estimated)
  applicationComplexity: string; // low, medium, high (AI-estimated)
  // Document processing
  documents: {
    fileUrl: string;
    fileName: string;
    fileType: string;
    uploadDate: Date;
  }[];
}

const BursarySchema: Schema = new Schema(
  {
    organization: { type: Schema.Types.ObjectId, ref: "OrganizationProfile", required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    applicationUrl: { type: String, required: true },
    deadline: { type: Date, required: true },
    // New fields for enhanced bursary data
    eligibilityCriteria: { type: String, required: true },
    awardAmount: { type: Number, required: true },
    fieldOfStudy: { type: [String], required: true },
    academicLevel: { type: [String], required: true },
    financialNeedLevel: { 
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
      required: true 
    },
    requiredDocuments: { type: [String], default: [] },
    // AI-generated fields
    aiTags: { type: [String], default: [] },
    aiCategorization: { type: [String], default: [] },
    contentModerationStatus: { 
      type: String, 
      enum: ["pending", "approved", "flagged", "rejected"], 
      default: "pending" 
    },
    competitionLevel: { 
      type: String, 
      enum: ["low", "medium", "high"], 
      default: "medium" 
    },
    applicationComplexity: { 
      type: String, 
      enum: ["low", "medium", "high"], 
      default: "medium" 
    },
    // Document processing
    documents: [{
      fileUrl: { type: String },
      fileName: { type: String },
      fileType: { type: String },
      uploadDate: { type: Date, default: Date.now }
    }]
  },
  { timestamps: true }
);

export default mongoose.models.Bursary ||
  mongoose.model<IBursary>("Bursary", BursarySchema); 