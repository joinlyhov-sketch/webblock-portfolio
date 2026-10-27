import type { ReactNode } from "react";
import Image from "next/image";
import {
  ArrowLeft,
  Call,
  Clock,
  Copy,
  DocumentText,
  Element3,
  Eye,
  Gallery,
  Location,
  Mobile,
  Monitor,
  More,
  RotateLeft,
  RotateRight,
  Save2,
  Send2,
  SidebarBottom,
  Text,
  TextalignCenter,
  TextalignLeft,
  TextalignRight,
  Trash,
} from "iconsax-reactjs";
import { LogoMark } from "@/components/common/logo";
import { cn } from "@/lib/utils";
import { RealSize, Tracked, tl } from "./how-it-works-timeline";

// Screen 02 · "Customize your website" (Figma 5574:226295): the editor at real size (1728 × 1000),
// shown at the instance scale 11/27. The palette switches from Lavender to Bakery mid-loop.

const EDITOR_SCALE = 704 / 1728;

export function CustomizeScreen() {
  return (
    <Tracked tracks={tl.editor} className="absolute inset-0 origin-center">
      <RealSize width={1728} height={1000} scale={EDITOR_SCALE}>
        <div className="flex h-full flex-col overflow-hidden bg-linear-to-b from-hiw-sky-from via-hiw-sky-via via-60% to-hiw-sky-to">
          <EditorTopBar />
          <div className="grid min-h-0 flex-1 grid-cols-[284px_1108px_336px]">
            <BlocksPanel />
            <Canvas />
            <DesignPanel />
          </div>
        </div>
      </RealSize>
    </Tracked>
  );
}

/** Blue accent of the sample site, crossfading to the Bakery accent. */
function AccentFill({ className, children }: { className?: string; children?: ReactNode }) {
  return (
    <span className={cn("relative isolate overflow-hidden bg-brand-strong", className)}>
      <Tracked tracks={tl.bakeryAccent} className="absolute inset-0 -z-10 bg-site-bakery" />
      {children}
    </span>
  );
}

function EditorTopBar() {
  return (
    <div className="flex h-16 shrink-0 items-center gap-3.5 border-b border-border bg-background px-4">
      <span className="flex size-9 items-center justify-center text-foreground-soft">
        <ArrowLeft className="size-[18px]" />
      </span>
      <LogoMark className="size-[30px] rounded-[9px] p-[7px]" />
      <div className="w-[81px]">
        <p className="text-[13px] leading-[19.5px] font-semibold text-foreground">Petal &amp; Stem</p>
        <p className="text-xs leading-[18px] text-muted-foreground">Home page</p>
      </div>
      <span className="ml-1.5 flex h-6 items-center gap-1.5 rounded-full bg-hiw-draft px-2.5 text-xs font-semibold text-foreground-soft">
        <span className="size-1.5 rounded-full bg-foreground-soft" />
        Draft · not deployed yet
      </span>
      <span className="flex-1" />
      <div className="flex gap-1">
        {[RotateLeft, RotateRight].map((Icon, i) => (
          <span
            key={i}
            className="flex size-9 items-center justify-center rounded-full border border-border bg-background text-foreground-soft"
          >
            <Icon className="size-[18px]" />
          </span>
        ))}
      </div>
      <div className="flex w-[134px] gap-0.5 rounded-xl border border-border bg-primary-soft p-1">
        {/* Desktop · tablet · phone (iconsax has no tablet glyph, so a larger phone stands in). */}
        {[
          { Icon: Monitor, size: "size-4" },
          { Icon: Mobile, size: "size-[17px]" },
          { Icon: Mobile, size: "size-3.5" },
        ].map(({ Icon, size }, i) => (
          <span
            key={i}
            className={cn(
              "flex h-8 flex-1 items-center justify-center rounded-[9px] text-foreground-soft",
              i === 0 && "bg-background text-brand-strong shadow-button",
            )}
          >
            <Icon className={size} />
          </span>
        ))}
      </div>
      <span className="flex-1" />
      <TopBarButton icon={<Save2 className="size-4" />}>Save draft</TopBarButton>
      <TopBarButton icon={<Eye className="size-4" />}>Preview</TopBarButton>
      <span className="flex h-10 items-center gap-2 rounded-full bg-brand px-[18px] text-sm font-semibold text-primary-foreground shadow-button">
        <Send2 className="size-4" />
        Deploy
      </span>
    </div>
  );
}

function TopBarButton({ icon, children }: { icon: ReactNode; children: ReactNode }) {
  return (
    <span className="flex h-10 items-center gap-2 rounded-full border border-border bg-background px-[18px] text-sm font-semibold text-foreground shadow-button">
      {icon}
      {children}
    </span>
  );
}

function PanelLabel({ children, hint }: { children: ReactNode; hint?: string }) {
  return (
    <div className="flex items-start justify-between text-[11px] leading-[16.5px] text-placeholder">
      <span className="font-bold tracking-[1.1px]">{children}</span>
      {hint && <span className="font-medium">{hint}</span>}
    </div>
  );
}

const pageSections = [
  { label: "Hero", Icon: Gallery },
  { label: "Product Cards", Icon: Element3, selected: true },
  { label: "About", Icon: DocumentText },
  { label: "Visit us", Icon: Location },
  { label: "Footer", Icon: SidebarBottom },
];

const blocks = [
  { label: "Hero", hint: "Big heading, image, button", Icon: Gallery },
  { label: "Text", hint: "Heading and paragraph", Icon: Text },
  { label: "Product Cards", hint: "Products with prices", Icon: Element3 },
  { label: "About", hint: "Your story", Icon: DocumentText, dragging: true },
  { label: "Location", hint: "Address, hours, map", Icon: Location },
  { label: "Footer", hint: "Contact and links", Icon: SidebarBottom },
];

function BlocksPanel() {
  return (
    <div className="flex flex-col border-r border-border bg-background">
      <div className="border-b border-border p-[17px]">
        <PanelLabel>Page structure</PanelLabel>
        <div className="flex flex-col gap-[8.6px] pt-[8.6px]">
          {pageSections.map(({ label, Icon, selected }) => (
            <div
              key={label}
              className="flex h-[43px] items-center gap-[8.6px] rounded-xl border border-border bg-background p-[8.6px] shadow-card"
            >
              <Icon className={cn("size-[15px]", selected ? "text-brand-deep" : "text-foreground-soft")} />
              <span
                className={cn(
                  "text-[13px] leading-[19.5px]",
                  selected ? "font-semibold text-brand-deep" : "text-foreground-soft",
                )}
              >
                {label}
              </span>
              {selected && (
                <span className="ml-auto flex gap-0.5 text-muted-foreground">
                  <Copy className="m-1.5 size-3.5" />
                  <Trash className="m-1.5 size-3.5" />
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
      <div className="px-[17px] pt-[17px] pb-1">
        <PanelLabel hint="Drag or tap">Add a block</PanelLabel>
        <div className="flex flex-col gap-[8.6px] pt-[8.6px]">
          {blocks.map(({ label, hint, Icon, dragging }) => (
            <div
              key={label}
              className={cn(
                "flex h-[56.5px] items-center gap-2.5 rounded-xl border bg-background px-2.5 py-[9px] shadow-card",
                dragging ? "-rotate-2 border-hiw-drag" : "border-border",
              )}
            >
              <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-brand-soft text-brand">
                <Icon className="size-4" />
              </span>
              <span className="flex w-[135px] flex-col">
                <span className="text-[13px] leading-[19.5px] font-semibold text-foreground">{label}</span>
                <span className="text-[11px] leading-[16.5px] text-muted-foreground">{hint}</span>
              </span>
              <Grip />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/** Six-dot drag handle. */
function Grip() {
  return (
    <span className="ml-auto grid grid-cols-2 gap-[3px] p-1">
      {Array.from({ length: 6 }, (_, i) => (
        <span key={i} className="size-[3px] rounded-full bg-placeholder" />
      ))}
    </span>
  );
}

const products = [
  { name: "Blue lily stem", price: "$6.00", image: "vase" },
  { name: "Gift bouquet", price: "$38.00", image: "gift-bouquet" },
  { name: "Stone vase", price: "$24.00", image: "stone-vase" },
];

const visitInfo = [
  { title: "Open today", text: "9:00 – 18:00", Icon: Clock },
  { title: "Find us", text: "18 Garden Lane", Icon: Location },
  { title: "Call", text: "012 345 678", Icon: Call },
];

function Canvas() {
  return (
    <div className="relative flex flex-col items-center gap-[13px] overflow-hidden bg-hiw-canvas px-[39px] py-[26px]">
      <div
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(circle,var(--color-decor-dot)_1.2px,transparent_1.3px)] bg-size-[24px_24px]"
      />
      <div className="relative flex w-[760px] justify-between text-xs leading-[18px] text-muted-foreground">
        <span>petalandstem.webblock.com · Desktop 1280 · Scroll to see the full page</span>
        <span>100%</span>
      </div>
      <div className="relative flex w-[760px] flex-col overflow-hidden rounded-[14px] border border-border bg-background shadow-card">
        <div className="flex items-center justify-between border-b border-border px-[26px] py-[17px]">
          <span className="font-heading text-[15px] leading-[22.5px] font-bold text-foreground">
            ❀ Petal &amp; Stem
          </span>
          <span className="flex items-center gap-[17px] text-xs leading-[18px] text-muted-foreground">
            <span>Shop</span>
            <span>Weddings</span>
            <span>Visit us</span>
            <AccentFill className="flex h-7 w-28 items-center justify-center rounded-full text-xs font-semibold text-primary-foreground">
              Contact Us
            </AccentFill>
          </span>
        </div>
        <div className="flex items-center gap-[26px] px-[26px] py-[21.6px]">
          <div className="flex flex-1 flex-col gap-[8.6px]">
            <p className="font-heading text-[11px] leading-[16.5px] font-bold tracking-[1.32px] text-site-rose">
              Local flower studio
            </p>
            <p className="w-[400px] font-heading text-[34px] leading-[35.7px] font-semibold tracking-[-0.68px] text-foreground">
              Fresh flowers for every moment.
            </p>
            <p className="w-[400px] text-[13px] leading-[19.5px] text-muted-foreground">
              Hand-tied bouquets, single stems and event flowers, arranged in our studio and delivered
              across town.
            </p>
            <div className="flex gap-[8.6px]">
              <AccentFill className="flex h-[34px] w-[107px] items-center justify-center rounded-full text-xs font-semibold text-primary-foreground">
                Shop flowers
              </AccentFill>
              <span className="flex h-[34px] w-[143px] items-center justify-center rounded-full border border-border text-xs font-semibold text-foreground">
                Visit the studio
              </span>
            </div>
          </div>
          <div className="relative h-[190px] w-[280px] overflow-hidden rounded-2xl">
            <Image src="/landing/how-it-works/vase.webp" alt="" fill sizes="280px" className="object-cover" />
          </div>
        </div>
        <div className="px-[26px] py-[21.6px]">
          <div className="flex items-center justify-between">
            <span className="font-heading text-[17px] leading-[25.5px] font-bold text-foreground">
              Popular this week
            </span>
            <span className="relative text-xs leading-[18px] font-semibold text-brand-strong">
              View all flowers
              <Tracked tracks={tl.bakeryAccent} className="absolute inset-0 text-site-bakery">
                View all flowers
              </Tracked>
            </span>
          </div>
          <div className="grid grid-cols-3 gap-3 pt-[13px]">
            {products.map((product) => (
              <div key={product.name} className="overflow-hidden rounded-xl border border-border">
                <div className="relative h-[86px]">
                  <Image
                    src={`/landing/how-it-works/${product.image}.webp`}
                    alt=""
                    fill
                    sizes="220px"
                    className="object-cover"
                  />
                </div>
                <div className="p-[8.6px]">
                  <p className="font-heading text-xs leading-[18px] font-semibold text-foreground">
                    {product.name}
                  </p>
                  <p className="text-[10px] leading-[15px] text-muted-foreground">{product.price}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 items-center gap-5 px-[26px] py-[21.6px]">
          <div className="relative h-[120px] overflow-hidden rounded-xl">
            <Image src="/landing/how-it-works/about-studio.webp" alt="" fill sizes="330px" className="object-cover" />
          </div>
          <div>
            <p className="font-heading text-[17px] leading-[25.5px] font-bold text-foreground">About the studio</p>
            <p className="pt-1 text-[13px] leading-[19.5px] text-muted-foreground">
              We’re a two-person flower studio on Garden Lane. Every bouquet is arranged by hand the
              morning it goes out.
            </p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3 px-[26px] pt-1 pb-[21.6px]">
          {visitInfo.map(({ title, text, Icon }) => (
            <div key={title} className="flex h-14 items-center gap-[8.6px] rounded-[14px] bg-hiw-info px-[13px] py-[8.6px]">
              <Icon className="size-[15px] text-foreground" />
              <p className="text-xs leading-[18px] text-foreground">
                <span className="block font-bold">{title}</span>
                {text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function OptionGroup({
  options,
  selected,
}: {
  options: { label: string; Icon?: typeof Monitor }[];
  selected: number;
}) {
  return (
    <div className="mt-[8.6px] flex gap-0.5 rounded-xl border-[0.8px] border-border bg-primary-soft p-1">
      {options.map(({ label, Icon }, i) => (
        <span
          key={label}
          className={cn(
            "flex h-8 flex-1 items-center justify-center gap-1.5 rounded-[9px] text-[13px] leading-[19.5px]",
            i === selected
              ? "bg-background font-semibold text-brand-strong shadow-button"
              : "font-medium text-muted-foreground",
          )}
        >
          {Icon && <Icon className="size-4" />}
          {label}
        </span>
      ))}
    </div>
  );
}

function FieldLabel({ children, hint, first }: { children: ReactNode; hint?: string; first?: boolean }) {
  return (
    <div
      className={cn(
        "flex justify-between text-xs leading-[18px]",
        first ? "pt-[13px]" : "pt-[17px]",
      )}
    >
      <span className="font-semibold text-foreground">{children}</span>
      {hint && <span className="text-muted-foreground">{hint}</span>}
    </div>
  );
}

const palettes = [
  { name: "Lavender", swatches: ["bg-brand-strong", "bg-primary-soft", "bg-foreground"], selected: tl.lavenderSelected },
  { name: "Bakery", swatches: ["bg-site-bakery", "bg-site-bakery-light", "bg-site-bakery-dark"], selected: tl.bakerySelected },
  { name: "Sage", swatches: ["bg-site-sage", "bg-site-sage-light", "bg-site-sage-dark"] },
];

function PaletteOption({
  name,
  swatches,
  selected,
}: {
  name: string;
  swatches: string[];
  selected?: typeof tl.lavenderSelected;
}) {
  const label = "text-xs leading-[18px]";
  return (
    <div className="relative flex flex-col items-center gap-1.5 rounded-xl border-[0.8px] border-border bg-background p-2.5">
      {selected && (
        <Tracked
          tracks={selected}
          className="absolute -inset-[0.8px] rounded-xl border-[1.6px] border-brand bg-primary-soft"
        />
      )}
      <span className="relative flex h-7 w-[73px] overflow-hidden rounded-lg">
        {swatches.map((swatch) => (
          <span key={swatch} className={cn("flex-1", swatch)} />
        ))}
      </span>
      <span className={cn("relative font-medium text-foreground-soft", label)}>
        {name}
        {selected && (
          <Tracked tracks={selected} className="absolute inset-0 bg-primary-soft font-semibold text-brand-deep">
            {name}
          </Tracked>
        )}
      </span>
    </div>
  );
}

function DesignPanel() {
  return (
    <div className="flex flex-col border-l border-border bg-background">
      <div className="flex items-center gap-[8.6px] border-b border-border p-[17px]">
        <span className="flex size-10 items-center justify-center rounded-full bg-brand-soft text-brand">
          <Element3 className="size-[18px]" />
        </span>
        <div className="flex-1">
          <p className="text-sm leading-[21px] font-semibold text-foreground">Product Cards</p>
          <p className="text-xs leading-[18px] text-muted-foreground">Section 2 of 5</p>
        </div>
        <More className="m-[9px] size-[18px] rotate-90 text-foreground-soft" />
      </div>
      <div className="flex gap-1 border-b border-border p-[13px] text-[13px] leading-[19.5px]">
        <span className="flex h-[34px] flex-1 items-center justify-center rounded-[10px] font-medium text-muted-foreground">
          Content
        </span>
        <span className="flex h-[34px] flex-1 items-center justify-center rounded-[10px] bg-brand-soft font-semibold text-brand-deep">
          Layout &amp; Design
        </span>
      </div>
      <div className="border-b border-border p-[17px]">
        <PanelLabel>Layout</PanelLabel>
        <FieldLabel first hint="Product cards per row">
          Columns
        </FieldLabel>
        <OptionGroup options={[{ label: "2" }, { label: "3" }, { label: "4" }]} selected={1} />
        <FieldLabel>Content alignment</FieldLabel>
        <OptionGroup
          options={[
            { label: "Left", Icon: TextalignLeft },
            { label: "Center", Icon: TextalignCenter },
            { label: "Right", Icon: TextalignRight },
          ]}
          selected={0}
        />
        <FieldLabel>Spacing</FieldLabel>
        <OptionGroup options={[{ label: "Tight" }, { label: "Normal" }, { label: "Roomy" }]} selected={1} />
      </div>
      <div className="p-[17px]">
        <PanelLabel hint="Whole site">Visual style</PanelLabel>
        <FieldLabel first>Color palette</FieldLabel>
        <div className="grid grid-cols-3 gap-2 pt-[8.6px]">
          {palettes.map((palette) => (
            <PaletteOption key={palette.name} {...palette} />
          ))}
        </div>
        <div className="flex gap-[8.6px] pt-[8.6px] text-xs leading-[18px] text-foreground">
          <span className="flex flex-1 items-center gap-[4.3px] rounded-[14px] border border-border bg-muted px-[8.6px] py-[4.3px]">
            <AccentFill className="size-[18px] rounded-[5px]" />
            Accent
          </span>
          <span className="flex flex-1 items-center gap-[4.3px] rounded-[14px] border border-border bg-muted px-[8.6px] py-[4.3px]">
            <span className="h-[18px] w-1 rounded-[5px] border border-border bg-primary-soft" />
            Background
          </span>
          <span className="flex flex-1 items-center gap-[4.3px] rounded-[14px] border border-border bg-muted px-[8.6px] py-[4.3px]">
            <span className="size-[18px] rounded-[5px] bg-foreground" />
            Text
          </span>
        </div>
        <FieldLabel>Font</FieldLabel>
        <div className="grid grid-cols-3 gap-2 pt-[8.6px]">
          <StyleOption sample={<span className="font-serif text-xl leading-[30px] font-medium">Aa</span>}>
            Editorial
          </StyleOption>
          <StyleOption selected sample={<span className="font-heading text-xl leading-[30px] font-semibold">Aa</span>}>
            Clean
          </StyleOption>
          <StyleOption sample={<span className="text-xl leading-[30px] font-bold tracking-[1px]">Aa</span>}>
            Rounded
          </StyleOption>
        </div>
        <FieldLabel>Buttons</FieldLabel>
        <div className="grid grid-cols-3 gap-2 pt-[8.6px]">
          <StyleOption sample={<span className="h-5 w-14 rounded-[2px] bg-hiw-button-preview" />}>Square</StyleOption>
          <StyleOption sample={<span className="h-5 w-14 rounded-md bg-hiw-button-preview" />}>Rounded</StyleOption>
          <StyleOption selected sample={<span className="h-5 w-14 rounded-full bg-brand" />}>
            Pill
          </StyleOption>
        </div>
      </div>
    </div>
  );
}

function StyleOption({
  sample,
  selected,
  children,
}: {
  sample: ReactNode;
  selected?: boolean;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-1.5 rounded-xl text-xs leading-[18px]",
        selected
          ? "border-[1.6px] border-brand bg-primary-soft p-[9px] font-semibold text-brand-deep"
          : "border-[0.8px] border-border bg-background p-2.5 font-medium text-foreground-soft",
      )}
    >
      {sample}
      {children}
    </div>
  );
}
