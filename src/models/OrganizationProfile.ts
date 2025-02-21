import mongoose, { Schema, Document } from "mongoose";

export interface IOrganizationProfile extends Document {
  user: mongoose.Types.ObjectId;
  title: string;
  category: string;
  about: string;
  mission: string;
  images: {
    profileImage?: string;
    headerBanner?: string;
    logo?: string;
  };
  contact: {
    address: string;
    province: string;
    city: string;
    postalCode: string;
    officeNumber: string;
    alternativePhone?: string;
    email: string;
    website?: string;
    socialMedia?: {
      twitter?: string;
      facebook?: string;
      linkedin?: string;
    };
  };
  status: "pending" | "active";
}

const OrganizationProfileSchema: Schema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    category: { type: String, required: true },
    about: { type: String, required: true },
    mission: { type: String, required: true },
    images: {
      profileImage: { type: String },
      headerBanner: { type: String },
      logo: { type: String },
    },
    contact: {
      address: { type: String, required: true },
      province: { type: String, required: true },
      city: { type: String, required: true },
      postalCode: { type: String, required: true },
      officeNumber: { type: String, required: true },
      alternativePhone: { type: String },
      email: { type: String, required: true },
      website: { type: String },
      socialMedia: {
        twitter: { type: String },
        facebook: { type: String },
        linkedin: { type: String },
      },
    },
    status: { type: String, enum: ["pending", "active"], default: "pending" },
  },
  { timestamps: true }
);

export default mongoose.models.OrganizationProfile ||
  mongoose.model<IOrganizationProfile>("OrganizationProfile", OrganizationProfileSchema); 