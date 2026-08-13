"use client";

import { useSelectedLayoutSegment } from "next/navigation";
import { Breadcrumb } from "./react-aria/Breadcrumbs";

export function DynamicBreadcrumb({ basePath }: { basePath: string }) {
  const segment = useSelectedLayoutSegment();

  if (!segment) return null;

  return <Breadcrumb href={`${basePath}/${segment}`}>{segment}</Breadcrumb>;
}
