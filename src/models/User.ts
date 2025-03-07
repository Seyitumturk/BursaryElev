import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  clerkId: string;
  email: string;
  role: "student" | "organization" | "funder" | "admin";
  firstName?: string;
  lastName?: string;
  createdAt: Date;
  updatedAt: Date;
}

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
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model<IUser>("User", UserSchema); 