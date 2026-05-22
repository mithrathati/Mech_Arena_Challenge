import { NextResponse } from "next-auth/next";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const messages = await prisma.message.findMany({
    where: { challengeId: id },
    include: { sender: { select: { username: true } } },
    orderBy: { createdAt: 'asc' }
  });
  return NextResponse.json(messages);
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  try {
    const { content } = await req.json();
    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const message = await prisma.message.create({
      data: {
        content,
        challengeId: id,
        senderId: user.id
      },
      include: { sender: { select: { username: true } } }
    });
    return NextResponse.json(message);
  } catch (error) {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
