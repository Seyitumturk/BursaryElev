import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import dbConnect from "@/lib/dbConnect";
import Bursary from "@/models/Bursary";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    
    if (!id) {
      return NextResponse.json(
        { error: "Bursary ID is required" },
        { status: 400 }
      );
    }
    
    await dbConnect();
    
    const bursary = await Bursary.findById(id).populate({
      path: "organization",
      select: "title images.logo contact.email contact.website",
    });
    
    if (!bursary) {
      return NextResponse.json(
        { error: "Bursary not found" },
        { status: 404 }
      );
    }
    
    return NextResponse.json(bursary);
  } catch (error) {
    console.error("Error fetching bursary details:", error);
    return NextResponse.json(
      { error: "Failed to fetch bursary details" },
      { status: 500 }
    );
  }
} 