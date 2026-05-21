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
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(users);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
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
    const { userId, balance, role, type } = await req.json(); // type: 'DEPOSIT' or 'WITHDRAWAL'
    
    const userToUpdate = await prisma.user.findUnique({ where: { id: userId } });
    if (!userToUpdate) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { 
        balance: parseFloat(balance),
        role: role 
      }
    });

    // Create a transaction record reflecting the change
    const diff = parseFloat(balance) - userToUpdate.balance;
    if (diff !== 0) {
      await prisma.transaction.create({
        data: {
          userId,
          type: type || (diff > 0 ? 'DEPOSIT' : 'WITHDRAWAL'),
          amount: Math.abs(diff),
          currency: updatedUser.currency,
          status: 'APPROVED',
          transactionId: 'ADMIN_ADJUSTMENT'
        }
      });
    }

    return NextResponse.json(updatedUser);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
  }
}