import mongoose, { Schema, Document } from "mongoose";

export interface IStudentProfile extends Document {
  user: mongoose.Types.ObjectId;
  institution: string;
  major: string;
  graduationYear: number;
  interests?: string[];
  bio?: string;
  skills?: string[];
  languages?: string[];
  achievements?: string[];
  financialBackground?: string;
  careerGoals?: string;
  locationPreferences?: string[];
}

const StudentProfileSchema: Schema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    institution: { type: String, required: true },
    major: { type: String, required: true },
    graduationYear: { type: Number, required: true },
    interests: { type: [String], default: [] },
    bio: { type: String, default: "" },
    skills: { type: [String], default: [] },
    languages: { type: [String], default: [] },
    achievements: { type: [String], default: [] },
    financialBackground: { type: String, default: "" },
    careerGoals: { type: String, default: "" },
    locationPreferences: { type: [String], default: [] },
  },
  { 
    timestamps: true,
    strict: true, // Enforce schema validation
    // Add this to include all virtuals when converting to JSON
    toJSON: { virtuals: true }
  }
);

// Clear existing model to force schema refresh
// This is needed when we modify the schema
mongoose.models = {};

export default mongoose.model<IStudentProfile>("StudentProfile", StudentProfileSchema); 