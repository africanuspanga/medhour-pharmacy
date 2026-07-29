"use client";

import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { ImagePlaceholder } from "@/components/ui/image-placeholder";

/** Renders a product image, or the placeholder when no image exists yet. */
export function ProductImage({
  src,
  alt,
  className,
  sizes = "(max-width: 768px) 50vw, 25vw",
}: {
  src: string | null | undefined;
  alt: string;
  className?: string;
  sizes?: string;
}) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return <ImagePlaceholder label={alt} className={className} />;
  }

  return (
    <div className={cn("relative overflow-hidden", className)}>
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        className="object-cover"
        onError={() => setFailed(true)}
      />
    </div>
  );
}
