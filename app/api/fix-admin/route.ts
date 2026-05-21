import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function GET() {
  const hashedPassword = await bcrypt.hash("Mithra@Mech7576", 10);
  await prisma.user.update({
    where: { email: "thatimitra@gmail.com" },
    data: { 
      password: hashedPassword,
      role: 'ADMIN' 
    }
  });
  return NextResponse.json({ message: "Admin password reset to Mithra@Mech7576 and role set to ADMIN" });
}