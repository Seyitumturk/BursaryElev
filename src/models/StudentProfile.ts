import mongoose, { Schema, Document } from "mongoose";

export interface IStudentProfile extends Document {
  user: mongoose.Types.ObjectId;
  institution: string;
  major: string;
  graduationYear: number;
  interests?: string;
  bio?: string;
}

const StudentProfileSchema: Schema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    institution: { type: String, required: true },
    major: { type: String, required: true },
    graduationYear: { type: Number, required: true },
    interests: { type: String },
    bio: { type: String },
  },
  { timestamps: true }
);

export default mongoose.models.StudentProfile ||
  mongoose.model<IStudentProfile>("StudentProfile", StudentProfileSchema); 