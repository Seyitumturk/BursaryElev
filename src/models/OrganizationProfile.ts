import mongoose, { Schema, Document } from "mongoose";

export interface IOrganizationProfile extends Document {
  user: mongoose.Types.ObjectId;
  name: string;
  title: string;
  about: string;
  mission: string;
  category: string;
  description: string;
  contact: {
    email: string;
    phone?: string;
    officeNumber?: string;
    alternativePhone?: string;
    website?: string;
    address?: string;
    province?: string;
    city?: string;
    postalCode?: string;
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
    title: { type: String },
    about: { type: String, default: "" },
    mission: { type: String, default: "" },
    category: { type: String, default: "" },
    description: { type: String, default: "" },
    contact: {
      email: { type: String, default: "" },
      phone: { type: String },
      officeNumber: { type: String },
      alternativePhone: { type: String },
      website: { type: String },
      address: { type: String },
      province: { type: String },
      city: { type: String },
      postalCode: { type: String },
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