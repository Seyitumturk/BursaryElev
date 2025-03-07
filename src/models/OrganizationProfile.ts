import mongoose, { Schema, Document } from "mongoose";

export interface IOrganizationProfile extends Document {
  user: mongoose.Types.ObjectId;
  name: string;
  description: string;
  contact: {
    email: string;
    phone?: string;
    website?: string;
    socialMedia?: {
      twitter?: string;
      facebook?: string;
      linkedin?: string;
    };
  };
  address: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  status?: "pending" | "active";
}

const OrganizationProfileSchema: Schema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },
    description: { type: String, default: "" },
    contact: {
      email: { type: String, default: "" },
      phone: { type: String },
      website: { type: String },
      socialMedia: {
        twitter: { type: String },
        facebook: { type: String },
        linkedin: { type: String },
      },
    },
    address: {
      street: { type: String },
      city: { type: String },
      state: { type: String },
      zipCode: { type: String },
      country: { type: String },
    },
    status: { type: String, enum: ["pending", "active"], default: "active" },
  },
  { timestamps: true }
);

export default mongoose.models.OrganizationProfile ||
  mongoose.model<IOrganizationProfile>("OrganizationProfile", OrganizationProfileSchema); 