import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const topUsers = await prisma.user.findMany({
      where: {
        role: 'USER'
      },
      select: {
        id: true,
        username: true,
        mechArenaId: true,
        balance: true,
        currency: true,
        totalWins: true,
        totalMatches: true,
      },
      orderBy: {
        balance: 'desc'
      },
      take: 20
    });

    return NextResponse.json(topUsers);
  } catch (error) {
    console.error("Leaderboard fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch leaderboard" }, { status: 500 });
  }
}
