import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getRequestRole, isRequestAuthenticated } from "@/lib/auth";

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

export async function GET(req: NextRequest) {
  if (!isRequestAuthenticated(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const products = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(products.map(serializeProduct));
}

export async function POST(req: NextRequest) {
  const role = getRequestRole(req);
  if (!role) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { title, description, imageUrls, productUrl, price } = await req.json();

    if (!title || !productUrl || !price) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const images: string[] =
      Array.isArray(imageUrls) && imageUrls.length
        ? imageUrls.filter((url: string) => typeof url === "string" && url.trim().length > 0)
        : [];

    if (images.length === 0) {
      return NextResponse.json({ error: "At least one image URL is required" }, { status: 400 });
    }

    if (!Number.isFinite(Number(price))) {
      return NextResponse.json({ error: "Price must be numeric" }, { status: 400 });
    }

    const product = await prisma.product.create({
      data: {
        title,
        description,
        imageUrls: images,
        productUrl,
        price: new Prisma.Decimal(price),
        status: "PENDING",
      },
    });

    return NextResponse.json(serializeProduct(product));
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Unable to create product" }, { status: 500 });
  }
}
