import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession();
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;
    const { action, screenshotUrl } = await req.json(); // action: 'ACCEPT', 'REJECT', 'UPLOAD_PROOF'
    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    const challenge = await prisma.challenge.findUnique({ 
      where: { id },
      include: { challenger: true, challenged: true }
    });

    if (!user || !challenge) return NextResponse.json({ error: "Not found" }, { status: 404 });

    if (action === 'ACCEPT') {
      if (challenge.challengedId !== user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      
      // Check if both have enough money
      if (challenge.challenger.balance < challenge.amount || challenge.challenged.balance < challenge.amount) {
        return NextResponse.json({ error: "One player has insufficient balance" }, { status: 400 });
      }

      const challengerNewBalance = challenge.challenger.balance - challenge.amount;
      const challengedNewBalance = challenge.challenged.balance - challenge.amount;

      // Lock funds (Escrow)
      await prisma.$transaction([
        prisma.user.update({ where: { id: challenge.challengerId }, data: { balance: challengerNewBalance } }),
        prisma.user.update({ where: { id: challenge.challengedId }, data: { balance: challengedNewBalance } }),
        prisma.challenge.update({ where: { id }, data: { status: 'ACCEPTED' } }),
        // Create loss debit transactions for history
        prisma.transaction.create({
          data: {
            userId: challenge.challengerId,
            type: 'LOSS_DEBIT',
            amount: challenge.amount,
            currency: challenge.challenger.currency,
            status: 'APPROVED',
            transactionId: `ESCROW_LOCK_${id}`,
            previousBalance: challenge.challenger.balance,
            newBalance: challengerNewBalance
          }
        }),
        prisma.transaction.create({
          data: {
            userId: challenge.challengedId,
            type: 'LOSS_DEBIT',
            amount: challenge.amount,
            currency: challenge.challenged.currency,
            status: 'APPROVED',
            transactionId: `ESCROW_LOCK_${id}`,
            previousBalance: challenge.challenged.balance,
            newBalance: challengedNewBalance
          }
        })
      ]);
    } 
    
    else if (action === 'REJECT') {
      if (challenge.challengedId !== user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      await prisma.challenge.update({ where: { id }, data: { status: 'REJECTED' } });
    }

    else if (action === 'UPLOAD_PROOF') {
      if (!screenshotUrl) return NextResponse.json({ error: "Screenshot is required" }, { status: 400 });
      
      const isChallenger = challenge.challengerId === user.id;
      
      // Update the proof and set status to COMPLETED (meaning review pending)
      await prisma.challenge.update({ 
        where: { id }, 
        data: { 
          status: 'COMPLETED', 
          [isChallenger ? 'challengerProof' : 'challengedProof']: screenshotUrl,
        } 
      });
    }

    return NextResponse.json({ message: "Success" });
  } catch (error) {
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}