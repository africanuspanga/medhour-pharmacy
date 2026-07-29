import Link from "next/link";
import Image from "next/image";
import type { Category } from "@/lib/types";
import { ImagePlaceholder } from "@/components/ui/image-placeholder";

export function CategoryCard({ category }: { category: Category }) {
  return (
    <Link
      href={`/categories/${category.slug}`}
      className="group flex flex-col items-center gap-3 rounded-2xl border border-ink/8 bg-white p-5 text-center shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="relative h-24 w-24 overflow-hidden rounded-full bg-brand-light">
        {category.image_url ? (
          <Image
            src={category.image_url}
            alt={category.name}
            fill
            sizes="96px"
            className="object-cover"
          />
        ) : (
          <ImagePlaceholder label={category.name} className="rounded-full" />
        )}
      </div>
      <div>
        <h3 className="text-sm font-semibold text-ink group-hover:text-brand">{category.name}</h3>
        <span className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-brand">
          View products
          <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </span>
      </div>
    </Link>
  );
}
