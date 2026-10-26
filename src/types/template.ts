export type TemplateCategory = "CLOTHES" | "FOOD_BEVERAGES" | "TECHNOLOGY" | "HANDMADE";

export type TemplatePreviewImage = { url: string; width: number; height: number };

export type TemplatePreviews = {
  desktop: TemplatePreviewImage;
  tablet: TemplatePreviewImage;
  mobile: TemplatePreviewImage;
};

export type Template = {
  id: string;
  name: string;
  description: string;
  category: TemplateCategory;
  thumbnailUrl: string;
  /** Short label shown next to the name on the preview screen, e.g. "Popular". */
  badge?: string;
  /** Full-page captures of the template site, shown scrollable in the preview device frame. */
  previews: TemplatePreviews;
};
