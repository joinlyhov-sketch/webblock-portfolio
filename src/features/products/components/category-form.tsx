"use client";

import { useState, useTransition, type KeyboardEvent } from "react";
import { Add, Category, Trash } from "iconsax-reactjs";
import { toast } from "@/components/common/toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createCategoryAction } from "../actions";
import { categoryNameError, PRODUCT_LIMITS } from "../schemas";
import type { ProductCategoryCount } from "../types";
import { ProductDialogHeader } from "./product-parts";

const fieldClasses = "h-[38px] rounded-xl px-3 text-sm";
/** Anything that isn't a letter, a space or & ' - (the full rule is in `schemas.ts`). */
const BAD_CHARACTER = /[^\p{L}\p{M} &'’-]/u;

/** Sends one category name to the server; keeps the pending state and the field error. */
function useCreateCategory(websiteId: string, onAdded: (name: string) => void) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function add(name: string, after?: () => void) {
    // Same rules as the server, checked here first so the message shows without a round trip.
    const problem = categoryNameError(name);
    if (problem) {
      setError(problem);
      return;
    }
    const formData = new FormData();
    formData.set("name", name);
    startTransition(async () => {
      const result = await createCategoryAction(websiteId, formData);
      if (result.ok) {
        setError(null);
        onAdded(result.data);
        toast.success("Category added", result.message);
        after?.();
      } else {
        setError(result.fieldErrors?.name?.[0] ?? result.message);
      }
    });
  }

  /** While typing, only flag characters that can never be used (digits, emoji, symbols). */
  function check(name: string) {
    setError(BAD_CHARACTER.test(name) ? "Use letters only. Spaces, & and - between words are fine." : null);
  }

  return { add, check, pending, error, clearError: () => setError(null) };
}

/**
 * "Categories" popup, opened from the Products toolbar: add a category at the top, and delete one
 * below. A category that products still use can't be deleted (every product needs a category).
 */
export function CategoriesForm({
  websiteId,
  categories,
  onAdded,
  onDelete,
  onDone,
}: {
  websiteId: string;
  /** Every category with how many products use it. */
  categories: ProductCategoryCount[];
  onAdded: (name: string) => void;
  /** Asks "Are you sure?" and deletes. Only offered for categories no product uses. */
  onDelete: (name: string) => void;
  onDone: () => void;
}) {
  const [name, setName] = useState("");
  const { add, check, pending, error } = useCreateCategory(websiteId, onAdded);
  const someInUse = categories.some((c) => c.count > 0);

  return (
    <div className="p-[22px]">
      <ProductDialogHeader
        icon={<Category variant="Outline" />}
        title="Categories"
        subtitle="Categories become the filter tabs on your website."
        onClose={onDone}
      />
      <form
        noValidate
        className="border-b border-border py-4"
        onSubmit={(event) => {
          event.preventDefault();
          add(name, () => setName(""));
        }}
      >
        <label htmlFor="category-name" className="block pb-1.5 text-[13px] leading-5 font-semibold text-foreground">
          New category
        </label>
        <div className="flex items-center gap-2">
          <Input
            id="category-name"
            value={name}
            maxLength={PRODUCT_LIMITS.category}
            autoFocus
            placeholder="e.g. Wedding flowers"
            onChange={(event) => {
              setName(event.target.value);
              check(event.target.value);
            }}
            aria-invalid={!!error}
            aria-describedby={error ? "category-name-error" : undefined}
            className={fieldClasses}
          />
          <Button type="submit" variant="soft" size="sm" loading={pending} className="h-[38px] shrink-0 rounded-xl">
            <Add variant="Outline" aria-hidden /> Add
          </Button>
        </div>
        {error && (
          <p id="category-name-error" role="alert" className="pt-1 text-xs text-danger">
            {error}
          </p>
        )}
      </form>

      <div className="pt-4">
        <h3 className="pb-2 text-[13px] leading-5 font-semibold text-foreground">
          Your categories <span className="font-normal text-muted-foreground">{categories.length}</span>
        </h3>
        {categories.length === 0 ? (
          <p className="text-[13px] text-muted-foreground">No categories yet. Add your first one above.</p>
        ) : (
          <ul className="max-h-[264px] divide-y divide-border overflow-y-auto rounded-xl border border-border [scrollbar-color:var(--color-border)_transparent] [scrollbar-width:thin]">
            {categories.map(({ category, count }) => (
              <li key={category} className="flex items-center gap-3 py-2 pr-2 pl-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">{category}</p>
                  <p className="text-xs text-muted-foreground">
                    {count === 0 ? "No products" : `${count} ${count === 1 ? "product" : "products"}`}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label={`Delete ${category}`}
                  aria-describedby={count > 0 ? "category-in-use" : undefined}
                  disabled={count > 0}
                  onClick={() => onDelete(category)}
                  className="shrink-0 text-danger hover:bg-danger-soft hover:text-danger"
                >
                  <Trash variant="Outline" aria-hidden />
                </Button>
              </li>
            ))}
          </ul>
        )}
        {someInUse && (
          <p id="category-in-use" className="pt-2 text-xs text-muted-foreground">
            A category with products can’t be deleted. Move its products to another category first.
          </p>
        )}
      </div>

      <div className="flex justify-end pt-4">
        <Button variant="secondary" size="sm" onClick={onDone}>
          Done
        </Button>
      </div>
    </div>
  );
}

/**
 * Inside the product form: a "New category" link that turns into a name field and an Add button.
 * It is not a nested form, so Enter adds the category instead of saving the product.
 */
export function InlineCategoryCreator({
  websiteId,
  hasCategories,
  onAdded,
}: {
  websiteId: string;
  /** With no categories yet the field is always shown: a product can't be saved without one. */
  hasCategories: boolean;
  onAdded: (name: string) => void;
}) {
  const [opened, setOpen] = useState(false);
  const open = opened || !hasCategories;
  const canCancel = hasCategories;
  const [name, setName] = useState("");
  const { add, check, pending, error, clearError } = useCreateCategory(websiteId, onAdded);

  function submit() {
    add(name, () => {
      setName("");
      setOpen(false);
    });
  }

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    // Enter adds the category; without this it would submit (save) the product form around it.
    if (event.key === "Enter") {
      event.preventDefault();
      submit();
    }
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-1.5 inline-flex items-center gap-1 rounded-md text-xs font-semibold text-primary outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/40"
      >
        <Add variant="Outline" aria-hidden className="size-3.5" /> New category
      </button>
    );
  }

  return (
    <div className="mt-2">
      <div className="flex items-center gap-2">
        <Input
          aria-label="New category name"
          value={name}
          maxLength={PRODUCT_LIMITS.category}
          autoFocus={opened}
          placeholder="New category name"
          onChange={(event) => {
            setName(event.target.value);
            check(event.target.value);
          }}
          onKeyDown={onKeyDown}
          aria-invalid={!!error}
          aria-describedby={error ? "inline-category-error" : undefined}
          className={fieldClasses}
        />
        <Button variant="soft" size="sm" onClick={submit} loading={pending} className="h-[38px] shrink-0 rounded-xl">
          Add
        </Button>
        {canCancel && (
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Cancel new category"
            onClick={() => {
              setOpen(false);
              clearError();
            }}
            className="shrink-0"
          >
            <Add variant="Outline" aria-hidden className="rotate-45" />
          </Button>
        )}
      </div>
      {error && (
        <p id="inline-category-error" role="alert" className="pt-1 text-xs text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
