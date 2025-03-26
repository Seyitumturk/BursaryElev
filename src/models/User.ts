import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  clerkId: string;
  email: string;
  role: "student" | "organization" | "funder" | "admin";
  firstName?: string;
  lastName?: string;
  adminInfo?: {
    position?: string;
    contact?: string;
    bio?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

// Admin info schema for users with admin role
const AdminInfoSchema = new Schema({
  position: { type: String },
  contact: { type: String },
  bio: { type: String }
}, { _id: false });

const UserSchema: Schema = new Schema(
  {
    clerkId: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    role: { 
      type: String, 
      enum: ["student", "organization", "funder", "admin"], 
      required: true,
      default: "organization"
    },
    firstName: { type: String },
    lastName: { type: String },
    adminInfo: AdminInfoSchema, // Add the adminInfo field for admin users
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model<IUser>("User", UserSchema); 