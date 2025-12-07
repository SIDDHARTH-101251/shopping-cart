-- Drop old single image column and add array of image URLs
ALTER TABLE "Product"
  DROP COLUMN IF EXISTS "imageUrl",
  ADD COLUMN     "imageUrls" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
