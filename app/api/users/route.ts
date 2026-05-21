import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      where: {
        role: 'USER'
      },
      select: {
        id: true,
        username: true,
        mechArenaId: true,
        squadPower: true,
        currency: true,
      },
      take: 10 
    });

    // Add mock active status for demonstration
    const usersWithStatus = users.map((user, index) => ({
      ...user,
      isActive: index % 3 === 0 // Mark every 3rd user as active for now
    }));

    return NextResponse.json(usersWithStatus);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}