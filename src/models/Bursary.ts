import mongoose, { Schema, Document } from "mongoose";

export interface IBursary extends Document {
  organization: mongoose.Types.ObjectId;
  title: string;
  description: string;
  applicationUrl: string;
  deadline: Date;
}

const BursarySchema: Schema = new Schema(
  {
    organization: { type: Schema.Types.ObjectId, ref: "OrganizationProfile", required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    applicationUrl: { type: String, required: true },
    deadline: { type: Date, required: true },
  },
  { timestamps: true }
);

export default mongoose.models.Bursary ||
  mongoose.model<IBursary>("Bursary", BursarySchema); 