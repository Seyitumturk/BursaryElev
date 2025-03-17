import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import OrganizationProfile from "@/models/OrganizationProfile";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Enable CORS
  const response = NextResponse.next();
  response.headers.append('Access-Control-Allow-Origin', '*');
  response.headers.append('Access-Control-Allow-Methods', 'GET, OPTIONS');
  response.headers.append('Access-Control-Allow-Headers', 'Content-Type');

  try {
    console.log("Organization API called with ID:", params.id);
    await dbConnect();
    
    const id = params.id;
    
    if (!id) {
      console.error("Missing organization ID");
      return NextResponse.json(
        { error: "Organization ID is required" },
        { status: 400 }
      );
    }
    
    console.log("Searching for organization with ID:", id);
    
    let organization;
    
    try {
      organization = await OrganizationProfile.findById(id);
    } catch (findError) {
      console.error("Error while finding organization:", findError);
      return NextResponse.json(
        { error: "Invalid organization ID format", message: (findError as Error).message },
        { status: 400 }
      );
    }
    
    if (!organization) {
      console.error("Organization not found for ID:", id);
      return NextResponse.json(
        { error: "Organization not found" },
        { status: 404 }
      );
    }
    
    console.log("Organization found:", organization.title || organization.name);
    return NextResponse.json(organization);
  } catch (error) {
    console.error("ERROR FETCHING ORGANIZATION:", error);
    return NextResponse.json(
      { error: "Failed to fetch organization details", message: (error as Error).message },
      { status: 500 }
    );
  }
} 