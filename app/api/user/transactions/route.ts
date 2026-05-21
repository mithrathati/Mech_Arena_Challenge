import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const transactions = await prisma.transaction.findMany({
    where: { user: { email: session.user.email } },
    orderBy: { createdAt: 'desc' }
  });
  return NextResponse.json(transactions);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { type, amount, proofUrl, transactionId, bankName, accountHolder, accountNumber, ifscCode } = await req.json();
    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    if (type === 'WITHDRAWAL') {
      const withdrawAmount = parseFloat(amount);
      if (user.balance < withdrawAmount) return NextResponse.json({ error: "Insufficient balance" }, { status: 400 });
      
      const commission = withdrawAmount * 0.05;
      const netAmount = withdrawAmount - commission;

      const [transaction] = await prisma.$transaction([
        prisma.transaction.create({
          data: { 
            userId: user.id, 
            type: 'WITHDRAWAL', 
            amount: withdrawAmount, 
            commission,
            netAmount,
            currency: user.currency, 
            status: 'PENDING', 
            bankName, 
            accountHolder, 
            accountNumber, 
            ifscCode 
          }
        }),
        prisma.user.update({ where: { id: user.id }, data: { balance: { decrement: withdrawAmount } } }),
        // Save bank details to user profile if provided
        prisma.user.update({
          where: { id: user.id },
          data: {
            bankName: bankName || user.bankName,
            accountHolder: accountHolder || user.accountHolder,
            accountNumber: accountNumber || user.accountNumber,
            ifscCode: ifscCode || user.ifscCode
          }
        })
      ]);
      return NextResponse.json(transaction);
    } else if (type === 'DEPOSIT') {
      const transaction = await prisma.transaction.create({
        data: { userId: user.id, type: 'DEPOSIT', amount: parseFloat(amount), currency: user.currency, status: 'PENDING', proofUrl, transactionId }
      });
      return NextResponse.json(transaction);
    }
    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}