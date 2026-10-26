"use client";

import { useState } from "react";
import { Layer } from "iconsax-reactjs";
import { EmptyState } from "@/components/common/empty-state";
import type { Template } from "@/types/template";
import { BusinessInfoModal } from "./business-info-modal";
import { TemplateCard } from "./template-card";

/** Grid of template cards. "Use template" opens the business form for that template. */
export function TemplatesGrid({
  templates,
  businessTypes,
}: {
  templates: Template[];
  businessTypes: string[];
}) {
  const [selected, setSelected] = useState<Template | null>(null);

  if (templates.length === 0) {
    return (
      <EmptyState
        icon={<Layer />}
        title="No templates found"
        description="Try another category or search, or choose All to see every template."
      />
    );
  }

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {templates.map((template) => (
          <TemplateCard key={template.id} template={template} onUse={setSelected} />
        ))}
      </div>
      <BusinessInfoModal template={selected} businessTypes={businessTypes} onClose={() => setSelected(null)} />
    </>
  );
}
