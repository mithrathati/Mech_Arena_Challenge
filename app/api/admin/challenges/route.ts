import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";

export async function GET() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email }
  });

  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const challenges = await prisma.challenge.findMany({
      where: { status: 'COMPLETED' },
      include: {
        challenger: { select: { username: true, currency: true } },
        challenged: { select: { username: true, currency: true } },
      },
      orderBy: { updatedAt: 'desc' }
    });
    return NextResponse.json(challenges);
  } catch (error) {
    return NextResponse.json({ error: "Fetch failed" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email }
  });

  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { challengeId, action, winnerId } = await req.json(); // action: 'APPROVE', 'REJECT'
    const challenge = await prisma.challenge.findUnique({ 
      where: { id: challengeId },
      include: { challenger: true, challenged: true }
    });

    if (!challenge) return NextResponse.json({ error: "Not found" }, { status: 404 });

    if (action === 'APPROVE') {
      if (!winnerId) return NextResponse.json({ error: "Winner selection is required" }, { status: 400 });
      
      const winner = await prisma.user.findUnique({ where: { id: winnerId } });
      if (!winner) return NextResponse.json({ error: "Winner not found" }, { status: 404 });

      const totalPot = challenge.amount * 2;
      const commission = totalPot * 0.05;
      const winnerPayout = totalPot - commission;
      const previousBalance = winner.balance;
      const newBalance = previousBalance + winnerPayout;

      await prisma.$transaction([
        // Give the payout to the winner (Total - 5%)
        prisma.user.update({
          where: { id: winnerId },
          data: { balance: newBalance }
        }),
        // Update challenge status to SETTLED
        prisma.challenge.update({
          where: { id: challengeId },
          data: { status: 'SETTLED', winnerId: winnerId }
        }),
        // Create transaction history for the winner
        prisma.transaction.create({
          data: {
            userId: winnerId,
            type: 'WIN_CREDIT',
            amount: winnerPayout,
            currency: challenge.challenger.currency,
            status: 'APPROVED',
            transactionId: `CHALLENGE_${challengeId}`,
            previousBalance,
            newBalance
          }
        })
      ]);
    } else {
      // If rejected, return money to both players
      await prisma.$transaction([
        prisma.user.update({ where: { id: challenge.challengerId }, data: { balance: { increment: challenge.amount } } }),
        prisma.user.update({ where: { id: challenge.challengedId }, data: { balance: { increment: challenge.amount } } }),
        prisma.challenge.update({ where: { id: challengeId }, data: { status: 'DISPUTED' } })
      ]);
    }

    return NextResponse.json({ message: "Success" });
  } catch (error) {
    return NextResponse.json({ error: "Processing failed" }, { status: 500 });
  }
}