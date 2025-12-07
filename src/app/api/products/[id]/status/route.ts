import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getRequestRole } from "@/lib/auth";

const VALID_STATUSES = new Set(["PENDING", "APPROVED", "REJECTED"]);

function serializeProduct(product: {
  price: Prisma.Decimal;
  createdAt: Date;
  updatedAt: Date;
  [key: string]: any;
}) {
  return {
    ...product,
    imageUrls: product.imageUrls ?? [],
    price: product.price.toString(),
    createdAt: product.createdAt.toISOString(),
    updatedAt: product.updatedAt.toISOString(),
  };
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const role = getRequestRole(req);
  if (!role) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  // Both admin and user roles can approve/reject

  const { id } = await params;

  try {
    const { status } = await req.json();

    if (!VALID_STATUSES.has(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const updated = await prisma.product.update({
      where: { id },
      data: { status },
    });

    return NextResponse.json(serializeProduct(updated));
  } catch (error: any) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    console.error(error);
    return NextResponse.json({ error: "Unable to update product" }, { status: 500 });
  }
}
