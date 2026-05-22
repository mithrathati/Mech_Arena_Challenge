import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  try {
    const { action, screenshotUrl } = await req.json();
    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const challenge = await prisma.challenge.findUnique({ where: { id } });
    if (!challenge) return NextResponse.json({ error: "Not found" }, { status: 404 });

    if (action === 'ACCEPT') {
      if (user.balance < challenge.amount) return NextResponse.json({ error: "Insufficient balance" }, { status: 400 });
      await prisma.$transaction([
        prisma.challenge.update({ where: { id }, data: { status: 'ACCEPTED' } }),
        prisma.user.update({ where: { id: user.id }, data: { balance: { decrement: challenge.amount } } })
      ]);
    } else if (action === 'REJECT') {
      await prisma.$transaction([
        prisma.challenge.update({ where: { id }, data: { status: 'REJECTED' } }),
        prisma.user.update({ where: { id: challenge.challengerId }, data: { balance: { increment: challenge.amount } } })
      ]);
    } else if (action === 'UPLOAD_PROOF') {
      const isChallenger = challenge.challengerId === user.id;
      await prisma.challenge.update({
        where: { id },
        data: isChallenger ? { challengerProof: screenshotUrl } : { challengedProof: screenshotUrl }
      });

      // If both uploaded, mark as COMPLETED for admin review
      const updated = await prisma.challenge.findUnique({ where: { id } });
      if (updated?.challengerProof && updated?.challengedProof) {
        await prisma.challenge.update({ where: { id }, data: { status: 'COMPLETED' } });
      }
    }

    return NextResponse.json({ message: "Success" });
  } catch (error) {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
