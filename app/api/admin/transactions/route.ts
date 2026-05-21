import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const admin = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!admin || admin.role !== 'ADMIN') return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');

  const transactions = await prisma.transaction.findMany({
    where: userId ? { userId } : { status: 'PENDING' },
    include: { user: { select: { username: true, email: true } } },
    orderBy: { createdAt: 'desc' }
  });
  return NextResponse.json(transactions);
}

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const admin = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!admin || admin.role !== 'ADMIN') return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { transactionId, action } = await req.json();
    const transaction = await prisma.transaction.findUnique({ where: { id: transactionId } });
    if (!transaction) return NextResponse.json({ error: "Not found" }, { status: 404 });

    if (action === 'APPROVE') {
      const user = await prisma.user.findUnique({ where: { id: transaction.userId } });
      if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

      if (transaction.type === 'DEPOSIT') {
        const previousBalance = user.balance;
        const newBalance = previousBalance + transaction.amount;
        
        await prisma.$transaction([
          prisma.user.update({ where: { id: transaction.userId }, data: { balance: newBalance } }),
          prisma.transaction.update({ 
            where: { id: transactionId }, 
            data: { 
              status: 'APPROVED',
              previousBalance,
              newBalance
            } 
          })
        ]);
      } else {
        // For WITHDRAWAL, balance was already deducted during request.
        // We just confirm it here. But to show history correctly, 
        // maybe we should have recorded balance then.
        // Let's record the snapshot at the moment of approval if not already set.
        await prisma.transaction.update({ 
          where: { id: transactionId }, 
          data: { 
            status: 'APPROVED',
            // For withdrawal, previousBalance and newBalance should ideally be set during request.
            // If they aren't, we can set them here based on current balance (which is already after deduction).
            // previousBalance = user.balance + amount
            // newBalance = user.balance
            previousBalance: user.balance + transaction.amount,
            newBalance: user.balance
          } 
        });
      }
    } else {
      if (transaction.type === 'WITHDRAWAL') {
        const user = await prisma.user.findUnique({ where: { id: transaction.userId } });
        if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
        
        const previousBalance = user.balance;
        const newBalance = previousBalance + transaction.amount;

        await prisma.$transaction([
          prisma.user.update({ where: { id: transaction.userId }, data: { balance: newBalance } }),
          prisma.transaction.update({ 
            where: { id: transactionId }, 
            data: { 
              status: 'REJECTED',
              previousBalance,
              newBalance
            } 
          })
        ]);
      } else {
        await prisma.transaction.update({ where: { id: transactionId }, data: { status: 'REJECTED' } });
      }
    }
    return NextResponse.json({ message: "Success" });
  } catch (error) {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}