"use client";

import * as React from "react";
import { ArrowDown2, ArrowUp2, TickCircle } from "iconsax-reactjs";
import { Select as SelectPrimitive } from "radix-ui";
import { cn } from "@/lib/utils";
import { menuContentClasses, menuItemClasses } from "./dropdown-menu"
import { usePortalContainer } from "./portal-container";

// shadcn/ui Select, restyled: the open list looks exactly like the website card "…" menu.

function Select({
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Root>) {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen);
  const open = openProp ?? uncontrolledOpen;
  const releaseGutter = React.useRef<number | null>(null);

  const handleOpenChange = React.useCallback((next: boolean) => {
    if (releaseGutter.current !== null) {
      cancelAnimationFrame(releaseGutter.current);
      releaseGutter.current = null;
    }

    setUncontrolledOpen(next);
    if (next && window.innerWidth > document.documentElement.clientWidth) {
      document.documentElement.dataset.selectStableGutter = "";
    } else if (!next) {
      // Let Radix release its body scroll lock before releasing the reserved scrollbar space.
      releaseGutter.current = requestAnimationFrame(() => {
        delete document.documentElement.dataset.selectStableGutter;
        releaseGutter.current = null;
      });
    }

    onOpenChange?.(next);
  }, [onOpenChange]);

  React.useEffect(
    () => () => {
      if (releaseGutter.current !== null) cancelAnimationFrame(releaseGutter.current);
      delete document.documentElement.dataset.selectStableGutter;
    },
    [],
  );

  return (
    <SelectPrimitive.Root
      data-slot="select"
      {...props}
      open={open}
      onOpenChange={handleOpenChange}
    />
  );
}

function SelectGroup({
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Group>) {
  return <SelectPrimitive.Group data-slot="select-group" {...props} />;
}

function SelectValue({
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Value>) {
  return <SelectPrimitive.Value data-slot="select-value" {...props} />;
}

/** Unstyled apart from layout: each caller gives it its field or pill look. `hideIcon` drops the chevron. */
function SelectTrigger({
  className,
  children,
  hideIcon,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Trigger> & {
  hideIcon?: boolean;
}) {
  return (
    <SelectPrimitive.Trigger
      data-slot="select-trigger"
      className={cn(
        "flex items-center justify-between gap-2 text-left whitespace-nowrap outline-none disabled:cursor-not-allowed disabled:opacity-50 data-[placeholder]:text-placeholder *:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:min-w-0 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-2 [&_svg]:pointer-events-none [&_svg]:shrink-0",
        className,
      )}
      {...props}
    >
      {children}
      {!hideIcon && (
        <SelectPrimitive.Icon asChild>
          <ArrowDown2 variant="Outline" className="size-4 text-foreground" />
        </SelectPrimitive.Icon>
      )}
    </SelectPrimitive.Trigger>
  );
}

function SelectContent({
  className,
  children,
  position = "popper",
  align = "start",
  sideOffset = 6,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Content>) {
  return (
    <SelectPrimitive.Portal container={usePortalContainer()}>
      <SelectPrimitive.Content
        data-slot="select-content"
        className={cn(
          "relative z-50 max-h-(--radix-select-content-available-height) max-w-(--radix-select-content-available-width) min-w-[8rem] origin-(--radix-select-content-transform-origin) overflow-x-hidden overflow-y-auto motion-safe:data-[state=closed]:animate-out motion-safe:data-[state=closed]:fade-out-0 motion-safe:data-[state=closed]:zoom-out-95 motion-safe:data-[state=open]:animate-in motion-safe:data-[state=open]:fade-in-0 motion-safe:data-[state=open]:zoom-in-95",
          menuContentClasses,
          className,
        )}
        position={position}
        align={align}
        sideOffset={sideOffset}
        {...props}
      >
        <SelectScrollUpButton />
        <SelectPrimitive.Viewport
          className={cn(
            "flex flex-col gap-0.5",
            position === "popper" &&
              "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]",
          )}
        >
          {children}
        </SelectPrimitive.Viewport>
        <SelectScrollDownButton />
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  );
}

function SelectLabel({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Label>) {
  return (
    <SelectPrimitive.Label
      data-slot="select-label"
      className={cn("px-2.5 py-1.5 text-xs text-muted-foreground", className)}
      {...props}
    />
  );
}

function SelectItem({
  className,
  children,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Item>) {
  return (
    <SelectPrimitive.Item
      data-slot="select-item"
      className={cn(
        "relative flex w-full cursor-pointer items-center pr-8 outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[state=checked]:text-brand-deep data-[state=checked]:font-semibold [&_svg]:pointer-events-none [&_svg]:shrink-0",
        menuItemClasses,
        className,
      )}
      {...props}
    >
      <span
        data-slot="select-item-indicator"
        className="absolute right-2.5 flex size-4 items-center justify-center text-brand"
      >
        <SelectPrimitive.ItemIndicator>
          <TickCircle variant="Outline" className="size-4" />
        </SelectPrimitive.ItemIndicator>
      </span>
      {/* Options can be data (website names, categories): plain text ends in "…" in the list and in the
          closed field, which shows this same node, with the full text on hover. */}
      <SelectPrimitive.ItemText className="min-w-0">
        {typeof children === "string" ? (
          <span title={children} className="block truncate">
            {children}
          </span>
        ) : (
          children
        )}
      </SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  );
}

function SelectSeparator({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Separator>) {
  return (
    <SelectPrimitive.Separator
      data-slot="select-separator"
      className={cn(
        "pointer-events-none mx-1 my-[3px] h-px bg-border",
        className,
      )}
      {...props}
    />
  );
}

function SelectScrollUpButton({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollUpButton>) {
  return (
    <SelectPrimitive.ScrollUpButton
      data-slot="select-scroll-up-button"
      className={cn(
        "flex items-center justify-center py-1 text-muted-foreground",
        className,
      )}
      {...props}
    >
      <ArrowUp2 variant="Outline" className="size-4" />
    </SelectPrimitive.ScrollUpButton>
  );
}

function SelectScrollDownButton({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollDownButton>) {
  return (
    <SelectPrimitive.ScrollDownButton
      data-slot="select-scroll-down-button"
      className={cn(
        "flex items-center justify-center py-1 text-muted-foreground",
        className,
      )}
      {...props}
    >
      <ArrowDown2 variant="Outline" className="size-4" />
    </SelectPrimitive.ScrollDownButton>
  );
}

export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
};
