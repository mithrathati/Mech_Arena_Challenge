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
        mechArenaId: true,
        country: true,
        balance: true,
        currency: true,
        squadPower: true,
        winStreak: true,
        totalMatches: true,
        totalWins: true,
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

    // Calculate Global Rank based on balance
    const rank = await prisma.user.count({
      where: {
        role: 'USER',
        balance: {
          gt: user.balance
        }
      }
    });

    const totalUsers = await prisma.user.count({
      where: { role: 'USER' }
    });

    return NextResponse.json({
      ...user,
      globalRank: rank + 1,
      totalUsers: totalUsers
    });
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
    const updateData: any = {};

    if (body.squadPower !== undefined) {
      const squadPower = parseInt(body.squadPower);
      if (isNaN(squadPower)) {
        return NextResponse.json({ error: "Invalid squad power value" }, { status: 400 });
      }
      updateData.squadPower = squadPower;
    }

    if (body.username) updateData.username = body.username;
    // mechArenaId is permanent for users - removed from updateData
    if (body.country) updateData.country = body.country;
    if (body.currency) updateData.currency = body.currency;

    // Check for unique constraints if username is being updated
    if (updateData.username) {
      const existingUser = await prisma.user.findFirst({
        where: {
          username: updateData.username,
          NOT: { email: session.user.email }
        }
      });

      if (existingUser) {
        return NextResponse.json({ error: "Username already taken" }, { status: 400 });
      }
    }

    const updatedUser = await prisma.user.update({
      where: { email: session.user.email },
      data: updateData,
      select: {
        id: true,
        username: true,
        balance: true,
        currency: true,
        squadPower: true,
        winStreak: true,
        totalMatches: true,
        totalWins: true,
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