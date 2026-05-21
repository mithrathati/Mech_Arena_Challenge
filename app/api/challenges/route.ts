import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";

// Create a new challenge
export async function POST(req: Request) {
  const session = await getServerSession();
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { challengedId, amount } = await req.json();
    const challenger = await prisma.user.findUnique({ where: { email: session.user.email } });
    const challengeAmount = parseFloat(amount);

    if (!challenger || challenger.balance < challengeAmount) {
      return NextResponse.json({ error: "Insufficient balance" }, { status: 400 });
    }

    if (challenger.id === challengedId) {
      return NextResponse.json({ error: "You cannot challenge yourself" }, { status: 400 });
    }

    const challenge = await prisma.challenge.create({
      data: {
        challengerId: challenger.id,
        challengedId,
        amount: challengeAmount,
        status: 'PENDING',
      },
    });

    return NextResponse.json(challenge, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create challenge" }, { status: 500 });
  }
}

// Get challenges for the current user
export async function GET() {
  const session = await getServerSession();
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const challenges = await prisma.challenge.findMany({
      where: {
        OR: [
          { challengerId: user.id },
          { challengedId: user.id }
        ],
        AND: [
          { challenger: { role: 'USER' } },
          { challenged: { role: 'USER' } }
        ]
      },
      include: {
        challenger: { select: { username: true, squadPower: true, role: true, mechArenaId: true } },
        challenged: { select: { username: true, squadPower: true, role: true, mechArenaId: true } },
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(challenges);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch challenges" }, { status: 500 });
  }
}