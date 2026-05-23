import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        username: true,
        balance: true,
        currency: true,
        squadPower: true,
        winStreak: true,
        bankName: true,
        accountHolder: true,
        accountNumber: true,
        ifscCode: true,
        requirePasswordChange: true,
      }
    });

    if (!user) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const squadPower = parseInt(body.squadPower);
    
    if (isNaN(squadPower)) {
      return NextResponse.json({ error: "Invalid squad power value" }, { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { email: session.user.email },
      data: { squadPower: squadPower },
      select: {
        id: true,
        username: true,
        balance: true,
        currency: true,
        squadPower: true,
        winStreak: true,
        bankName: true,
        accountHolder: true,
        accountNumber: true,
        ifscCode: true,
      }
    });

    return NextResponse.json(updatedUser);
  } catch (error: any) {
    console.error("Update error detail:", error);
    return NextResponse.json({ 
      error: "Failed to update profile", 
      details: error.message || "Unknown error" 
    }, { status: 500 });
  }
}