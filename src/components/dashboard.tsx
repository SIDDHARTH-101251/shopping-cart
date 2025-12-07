"use client";

import Image from "next/image";
import Link from "next/link";
import React, { FormEvent, startTransition, useEffect, useOptimistic, useState } from "react";
import { createPortal } from "react-dom";
import dynamic from "next/dynamic";

const CatFollower = dynamic(() => import("./cat-follower"), { ssr: false });
const CatEmojiMobile = dynamic(() => import("./cat-emoji").then((m) => m.CatEmojiMobile), { ssr: false });

export type ProductStatus = "PENDING" | "APPROVED" | "REJECTED";

export type ProductDTO = {
  id: string;
  title: string;
  description: string | null;
  imageUrls: string[];
  productUrl: string;
  price: string;
  status: ProductStatus;
  createdAt: string;
  updatedAt: string;
};

type AddProductPayload = {
  title: string;
  description?: string | null;
  imageUrls: string[];
  productUrl: string;
  price: string;
};

type OptimisticAction =
  | { type: "status"; id: string; status: ProductStatus }
  | { type: "add"; product: ProductDTO }
  | { type: "reset"; products: ProductDTO[] };

type ImageRect = { top: number; left: number; width: number; height: number };

const statusStyles: Record<ProductStatus, string> = {
  PENDING: "border-amber-500/30 bg-amber-500/10 text-amber-200",
  APPROVED: "border-emerald-500/30 bg-emerald-500/10 text-emerald-200",
  REJECTED: "border-rose-500/30 bg-rose-500/10 text-rose-200",
};

const statusCopy: Record<ProductStatus, string> = {
  PENDING: "Pending",
  APPROVED: "Approved",
  REJECTED: "Rejected",
};

function formatPrice(value: string) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return value;

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(numeric);
}

function StatusBadge({ status }: { status: ProductStatus }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-semibold ${statusStyles[status]}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {statusCopy[status]}
    </span>
  );
}

function ActionButton({
  label,
  onClick,
  color,
  disabled,
  icon,
}: {
  label: string;
  onClick: () => void;
  color: string;
  disabled: boolean;
  icon: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold shadow-lg transition ${color} disabled:cursor-not-allowed disabled:opacity-60`}
    >
      <span className="text-base leading-none">{icon}</span>
      {label}
    </button>
  );
}

function ProductCard({
  product,
  onApprove,
  onReject,
  disabled,
  onImageClick,
  canDelete,
  onDelete,
  pulse,
}: {
  product: ProductDTO;
  onApprove: () => void;
  onReject: () => void;
  disabled: boolean;
  onImageClick: (images: string[], index: number, rect?: ImageRect | null) => void;
  canDelete: boolean;
  onDelete?: () => void;
  pulse?: "approve" | "reject";
}) {
  const images = product.imageUrls && product.imageUrls.length > 0 ? product.imageUrls : [];
  const [activeIndex, setActiveIndex] = useState(0);
  const activeImage = images[activeIndex] ?? null;
  const pulseClass =
    pulse === "approve"
      ? "ring-2 ring-emerald-400/80 shadow-emerald-500/30 animate-pop-card"
      : pulse === "reject"
        ? "ring-2 ring-amber-400/80 shadow-amber-500/30 animate-wiggle-card"
        : "";

  const cardRef = React.useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    setActiveIndex(0);
  }, [product.id, images.length]);

  // Notify mobile cat of approximate card position
  useEffect(() => {
    const sendPosition = () => {
      const rect = cardRef.current?.getBoundingClientRect();
      if (rect) {
        const viewportHeight = window.innerHeight;
        const yPercent = ((rect.top + rect.height / 2) / viewportHeight) * 100;
        window.dispatchEvent(new CustomEvent("cat-focus-product", { detail: { y: yPercent } }));
      }
    };
    sendPosition();
    window.addEventListener("resize", sendPosition);
    return () => window.removeEventListener("resize", sendPosition);
  }, []);

  return (
    <article
      ref={cardRef}
      className={`group relative flex h-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 shadow-xl shadow-black/25 transition hover:-translate-y-1 hover:border-emerald-400/30 ${pulseClass}`}
    >
      {pulse ? (
        <div
          className={`pointer-events-none absolute left-4 top-4 z-20 rounded-full px-3 py-1 text-xs font-semibold shadow ${
            pulse === "approve"
              ? "bg-emerald-500/20 text-emerald-50 shadow-emerald-500/30"
              : "bg-amber-500/20 text-amber-50 shadow-amber-500/30"
          }`}
        >
          {pulse === "approve" ? "Approved ✨" : "Rejected 💸 saved"}
        </div>
      ) : null}
      <div className="relative w-full bg-slate-900/70 p-4">
        {activeImage ? (
          <>
            <div className="relative hidden md:block">
              <button
                type="button"
                onClick={() => {
                  const rect = cardRef.current?.getBoundingClientRect();
                  const payload = rect
                    ? { top: rect.top, left: rect.left, width: rect.width, height: rect.height }
                    : undefined;
                  onImageClick(images, activeIndex, payload);
                }}
                className="relative block h-64 w-full overflow-hidden rounded-2xl border border-white/10 bg-slate-950/80 transition hover:border-emerald-400/50 hover:shadow-xl hover:shadow-emerald-500/20"
              >
                <Image
                  src={activeImage}
                  alt={product.title}
                  fill
                  sizes="(min-width: 1024px) 420px, 100vw"
                  className="object-contain p-4 transition duration-500 group-hover:scale-[1.02]"
                />
              </button>
              {images.length > 1 ? (
                <>
                  <button
                    type="button"
                    onClick={() => setActiveIndex((i) => (i === 0 ? images.length - 1 : i - 1))}
                    className="absolute left-6 top-1/2 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-white/10 text-slate-100 transition hover:border-emerald-400/60 hover:text-emerald-100 md:flex"
                    aria-label="Previous image"
                  >
                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
                      <path d="M15 18l-6-6 6-6" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveIndex((i) => (i === images.length - 1 ? 0 : i + 1))}
                    className="absolute right-6 top-1/2 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-white/10 text-slate-100 transition hover:border-emerald-400/60 hover:text-emerald-100 md:flex"
                    aria-label="Next image"
                  >
                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
                      <path d="M9 6l6 6-6 6" />
                    </svg>
                  </button>
                </>
              ) : null}
            </div>

            <div className="flex gap-3 overflow-x-auto pb-2 md:hidden">
              {images.map((src, idx) => (
                <button
                  key={src}
                  type="button"
                  onClick={() => {
                    setActiveIndex(idx);
                    const rect = cardRef.current?.getBoundingClientRect();
                    const payload = rect
                      ? { top: rect.top, left: rect.left, width: rect.width, height: rect.height }
                      : undefined;
                    onImageClick(images, idx, payload);
                  }}
                  className="relative min-w-[70%] snap-center overflow-hidden rounded-2xl border border-white/10 bg-slate-950/80 transition hover:border-emerald-400/50"
                >
                  <div className="relative h-52 w-full">
                    <Image
                      src={src}
                      alt={product.title}
                      fill
                      sizes="(max-width: 768px) 90vw, 100vw"
                      className="object-contain p-3"
                    />
                  </div>
                </button>
              ))}
            </div>

            {images.length > 1 ? (
              <div className="mt-3 hidden items-center justify-center gap-2 md:flex">
                {images.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveIndex(idx)}
                    className={`h-2.5 w-2.5 rounded-full transition ${
                      idx === activeIndex ? "bg-emerald-400" : "bg-white/20 hover:bg-white/40"
                    }`}
                    aria-label={`Go to image ${idx + 1}`}
                  />
                ))}
              </div>
            ) : null}
          </>
        ) : (
          <div className="flex h-48 w-full items-center justify-center rounded-2xl border border-dashed border-white/10 bg-slate-900/70 text-sm text-slate-500">
            No images
          </div>
        )}
        {canDelete && onDelete ? (
          <button
            type="button"
            onClick={onDelete}
            className="absolute right-4 top-4 inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/5 text-slate-200 transition hover:border-rose-400/60 hover:text-rose-100 hover:shadow-lg hover:shadow-rose-500/30"
            aria-label="Delete product"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6}>
              <path d="M6 7h12" />
              <path d="M10 11v6" />
              <path d="M14 11v6" />
              <path d="M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
              <path d="M7 7h10l-.6 11a1 1 0 0 1-1 .94H8.6a1 1 0 0 1-1-.94L7 7Z" />
            </svg>
          </button>
        ) : null}
      </div>
      <div className="flex flex-1 flex-col space-y-4 p-5">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-lg font-semibold text-slate-50 line-clamp-1">{product.title}</h3>
          <StatusBadge status={product.status} />
        </div>
        {product.description ? (
          <p className="text-sm leading-relaxed text-slate-300 line-clamp-3">{product.description}</p>
        ) : (
          <p className="text-sm text-slate-500">No description provided.</p>
        )}
        <div className="flex items-center justify-between text-sm font-semibold text-emerald-200">
          <span>{formatPrice(product.price)}</span>
          <Link
            href={product.productUrl}
            className="inline-flex items-center gap-2 text-xs font-semibold text-cyan-200 underline-offset-4 transition hover:text-cyan-100"
          >
            View source
            <span aria-hidden className="text-lg leading-none">&rarr;</span>
          </Link>
        </div>
        <div className="mt-auto flex items-center gap-3">
          <ActionButton
            label="Approve"
            icon={
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6}>
                <path d="M5 13l4 4L19 7" />
              </svg>
            }
            onClick={onApprove}
            disabled={disabled}
            color="border border-emerald-400/50 bg-emerald-400/10 text-emerald-100 hover:bg-emerald-400/20"
          />
          <ActionButton
            label="Reject"
            icon={
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6}>
                <path d="M6 6l12 12M18 6l-12 12" />
              </svg>
            }
            onClick={onReject}
            disabled={disabled}
            color="border border-rose-400/50 bg-rose-400/10 text-rose-100 hover:bg-rose-400/20"
          />
        </div>
      </div>
    </article>
  );
}

function AddProductModal({
  open,
  onClose,
  onSubmit,
  loading,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (payload: AddProductPayload) => Promise<boolean>;
  loading: boolean;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrls, setImageUrls] = useState("");
  const [productUrl, setProductUrl] = useState("");
  const [price, setPrice] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);

  if (!open) return null;

  const reset = () => {
    setTitle("");
    setDescription("");
    setImageUrls("");
    setProductUrl("");
    setPrice("");
    setLocalError(null);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLocalError(null);
    const parsedImages = imageUrls
      .split(/[\n,]+/)
      .map((url) => url.trim())
      .filter(Boolean);

    if (parsedImages.length === 0) {
      setLocalError("Please provide at least one image URL.");
      return;
    }

    const success = await onSubmit({
      title,
      description: description || null,
      imageUrls: parsedImages,
      productUrl,
      price,
    });

    if (success) {
      reset();
      onClose();
    } else {
      setLocalError("Could not save product. Please try again.");
    }
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur">
      <div className="relative w-full max-w-2xl rounded-2xl border border-white/10 bg-slate-900/95 p-6 shadow-2xl shadow-emerald-500/20">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.08em] text-emerald-300">Add product</p>
            <h3 className="text-xl font-semibold text-white">New entry</h3>
          </div>
          <button
            onClick={() => {
              reset();
              onClose();
            }}
            className="rounded-full bg-white/5 px-3 py-1 text-sm text-slate-300 transition hover:bg-white/10"
          >
            Close
          </button>
        </div>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-2 text-sm text-slate-200">
              <span>Title</span>
              <input
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-slate-100 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/40"
                placeholder="Product name"
              />
            </label>
            <label className="space-y-2 text-sm text-slate-200">
              <span>Price</span>
              <input
                required
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-slate-100 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/40"
                placeholder="e.g. 24.99"
              />
            </label>
          </div>
          <label className="space-y-2 text-sm text-slate-200">
            <span>Product URL</span>
            <input
              required
              value={productUrl}
              onChange={(e) => setProductUrl(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-slate-100 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/40"
              placeholder="https://"
            />
          </label>
          <label className="space-y-2 text-sm text-slate-200">
            <span>Image URLs (multiple)</span>
            <textarea
              required
              value={imageUrls}
              onChange={(e) => setImageUrls(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-slate-100 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/40"
              placeholder="Paste one per line or separate with commas"
              rows={3}
            />
            <p className="text-xs text-slate-400">Each URL becomes a clickable image. At least one required.</p>
          </label>
          <label className="space-y-2 text-sm text-slate-200">
            <span>Description</span>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-slate-100 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/40"
              placeholder="Optional details"
            />
          </label>
          {localError ? (
            <p className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-100">{localError}</p>
          ) : null}
          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => {
                reset();
                onClose();
              }}
              className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-300 transition hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 shadow-lg shadow-emerald-500/30 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? "Saving..." : "Save product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function Dashboard({
  initialProducts,
  userRole,
}: {
  initialProducts: ProductDTO[];
  userRole: "admin" | "user";
}) {
  const [products, setProducts] = useState<ProductDTO[]>(initialProducts);
  const [optimisticProducts, updateOptimistic] = useOptimistic<
    ProductDTO[],
    OptimisticAction
  >(products, (state, action) => {
    switch (action.type) {
      case "status":
        return state.map((product) =>
          product.id === action.id ? { ...product, status: action.status } : product
        );
      case "add":
        return [action.product, ...state];
      case "reset":
        return action.products;
      default:
        return state;
    }
  });
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [previewIndex, setPreviewIndex] = useState(0);
  const [previewGrowIn, setPreviewGrowIn] = useState(false);
  const [viewportSize, setViewportSize] = useState(() => ({
    width: typeof window !== "undefined" ? window.innerWidth : 1280,
    height: typeof window !== "undefined" ? window.innerHeight : 720,
  }));
  const [cardPulse, setCardPulse] = useState<Record<string, "approve" | "reject">>({});
  const [showApprovedOnly, setShowApprovedOnly] = useState(false);
  const [resettingAll, setResettingAll] = useState(false);
  const [navPortalMobile, setNavPortalMobile] = useState<HTMLElement | null>(null);
  const [navPortalDesktop, setNavPortalDesktop] = useState<HTMLElement | null>(null);

  const renderedProducts = React.useMemo(() => {
    const map = new Map<string, ProductDTO>();
    optimisticProducts.forEach((p) => {
      if (!map.has(p.id)) {
        map.set(p.id, p);
      }
    });
    const list = Array.from(map.values());
    return showApprovedOnly ? list.filter((p) => p.status === "APPROVED") : list;
  }, [optimisticProducts, showApprovedOnly]);

  const handleStatusChange = async (id: string, status: ProductStatus) => {
    const snapshot = products;
    startTransition(() => updateOptimistic({ type: "status", id, status }));
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, status } : p)));
    setErrorMessage(null);
    setLoadingId(id);

    try {
      const response = await fetch(`/api/products/${id}/status`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        throw new Error("Request failed");
      }

      const updated = (await response.json()) as ProductDTO;
      setProducts((prev) => prev.map((p) => (p.id === id ? updated : p)));
      setCardPulse((prev) => ({ ...prev, [id]: status === "APPROVED" ? "approve" : "reject" }));
      setTimeout(() => {
        setCardPulse((prev) => {
          const next = { ...prev };
          delete next[id];
          return next;
        });
      }, 1200);
    } catch (error) {
      setProducts(snapshot);
      startTransition(() => updateOptimistic({ type: "reset", products: snapshot }));
      setErrorMessage("Unable to update status. Please try again.");
    } finally {
      setLoadingId(null);
    }
  };

  const handleCreateProduct = async (payload: AddProductPayload) => {
    const snapshot = products;
    const tempProduct: ProductDTO = {
      id: crypto.randomUUID(),
      title: payload.title,
      description: payload.description ?? null,
      imageUrls: payload.imageUrls,
      productUrl: payload.productUrl,
      price: payload.price,
      status: "PENDING",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setCreating(true);
    setErrorMessage(null);
    setProducts((prev) => [tempProduct, ...prev]);
    startTransition(() => updateOptimistic({ type: "add", product: tempProduct }));

    try {
      const response = await fetch("/api/products", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Request failed");
      }

      const saved = (await response.json()) as ProductDTO;
      setProducts((prev) => [saved, ...prev.filter((p) => p.id !== tempProduct.id)]);
      startTransition(() => updateOptimistic({ type: "reset", products: [saved, ...snapshot] }));
      return true;
    } catch (error) {
      setProducts(snapshot);
      startTransition(() => updateOptimistic({ type: "reset", products: snapshot }));
      setErrorMessage("Unable to add product. Please try again.");
      return false;
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    const snapshot = products;
    const filtered = products.filter((p) => p.id !== id);
    setDeletingId(id);
    setProducts(filtered);
    startTransition(() => updateOptimistic({ type: "reset", products: filtered }));
    setErrorMessage(null);

    try {
      const response = await fetch(`/api/products/${id}`, { method: "DELETE", credentials: "include" });
      if (!response.ok) {
        throw new Error("Request failed");
      }
    } catch (error) {
      setProducts(snapshot);
      startTransition(() => updateOptimistic({ type: "reset", products: snapshot }));
      setErrorMessage("Unable to delete product. Please try again.");
    } finally {
      setDeletingId(null);
    }
  };

  const handleResetAllToPending = async () => {
    const snapshot = products;
    const resetProducts = products.map((p) => ({ ...p, status: "PENDING" as ProductStatus }));
    setResettingAll(true);
    setProducts(resetProducts);
    startTransition(() => updateOptimistic({ type: "reset", products: resetProducts }));
    setErrorMessage(null);

    try {
      await Promise.all(
        products.map((p) =>
          fetch(`/api/products/${p.id}/status`, {
            method: "PATCH",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: "PENDING" }),
          })
        )
      );
    } catch (error) {
      setProducts(snapshot);
      startTransition(() => updateOptimistic({ type: "reset", products: snapshot }));
      setErrorMessage("Unable to reset products. Please try again.");
    } finally {
      setResettingAll(false);
    }
  };

  useEffect(() => {
    const updateViewport = () => {
      setViewportSize({ width: window.innerWidth, height: window.innerHeight });
    };
    updateViewport();
    window.addEventListener("resize", updateViewport);
    return () => window.removeEventListener("resize", updateViewport);
  }, []);

  useEffect(() => {
    setNavPortalMobile(document.getElementById("nav-controls"));
    setNavPortalDesktop(document.getElementById("nav-controls-desktop"));
  }, []);

  useEffect(() => {
    if (previewImage) {
      const frame = requestAnimationFrame(() => setPreviewGrowIn(true));
      return () => cancelAnimationFrame(frame);
    }
    setPreviewGrowIn(false);
  }, [previewImage]);

  const horizontalPadding = 32;
  const verticalPadding = 32;
  const modalWidth = Math.min(Math.max(viewportSize.width - horizontalPadding * 2, 360), 1200);
  const modalHeight = Math.min(Math.max(viewportSize.height - verticalPadding * 2, 360), 900);

  const ToolbarControls = () => (
    <>
      {userRole === "user" ? (
        <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.08em] text-emerald-200 shadow-inner shadow-emerald-500/30">
          EEPY-approved
        </div>
      ) : null}
      <span className="inline-flex items-center gap-1 rounded-full bg-white/5 px-3 py-2 text-xs font-semibold text-slate-300 ring-1 ring-white/10">
        <svg className="h-4 w-4 text-emerald-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7}>
          <circle cx="12" cy="12" r="9" className="opacity-60" />
          <path d="M12 7v5l3 2" />
        </svg>
        <span className="hidden sm:inline">Items:</span>
        {renderedProducts.length}
      </span>
      <button
        onClick={() => setShowApprovedOnly((prev) => !prev)}
        className={`inline-flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold transition sm:px-4 sm:text-sm ${
          showApprovedOnly
            ? "border border-emerald-400/60 bg-emerald-400/15 text-emerald-100 shadow-lg shadow-emerald-500/25"
            : "border border-white/15 bg-white/5 text-slate-200 hover:border-emerald-400/40"
        }`}
        aria-label={showApprovedOnly ? "Show all" : "Show approved"}
      >
        <svg className="h-4 w-4 sm:h-5 sm:w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7}>
          <path d="M3 7h18" />
          <path d="M6 12h12" />
          <path d="M10 17h4" />
        </svg>
        <span className="hidden sm:inline">{showApprovedOnly ? "Show all" : "Show approved"}</span>
      </button>
      {userRole === "admin" ? (
        <button
          onClick={handleResetAllToPending}
          disabled={resettingAll}
          className="inline-flex items-center gap-2 rounded-full border border-amber-400/40 bg-amber-400/10 p-2 text-amber-100 shadow-lg shadow-amber-500/25 transition hover:-translate-y-0.5 hover:border-amber-300/70 hover:text-amber-50 disabled:opacity-60"
          aria-label="Reset all to pending"
          title="Reset all to pending"
        >
          {resettingAll ? (
            <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
              <circle cx="12" cy="12" r="9" className="opacity-30" />
              <path d="M12 3v6l4-2" />
            </svg>
          ) : (
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
              <path d="M21 12a9 9 0 1 1-9-9" />
              <path d="M21 3v6h-6" />
            </svg>
          )}
        </button>
      ) : null}
      {userRole === "admin" ? (
        <button
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-1 rounded-xl bg-emerald-500 px-3 py-2 text-xs font-semibold text-slate-950 shadow-lg shadow-emerald-500/25 transition hover:-translate-y-0.5 hover:bg-emerald-400 sm:px-4 sm:text-sm"
          aria-label="Add product"
        >
          <svg className="h-4 w-4 sm:h-5 sm:w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
            <path d="M12 5v14" />
            <path d="M5 12h14" />
          </svg>
          <span className="hidden sm:inline">Add product</span>
        </button>
      ) : null}
    </>
  );

  return (
    <section className="flex h-full flex-col space-y-6 overflow-hidden">
      <CatFollower />
      <CatEmojiMobile />
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex-1" />
        {!navPortalMobile && !navPortalDesktop ? (
          <div className="flex flex-wrap items-center gap-2">
            <ToolbarControls />
          </div>
        ) : null}
        {navPortalMobile
          ? createPortal(
              <div className="flex flex-wrap items-center gap-2 sm:hidden">
                <ToolbarControls />
              </div>,
              navPortalMobile
            )
          : null}
        {navPortalDesktop
          ? createPortal(
              <div className="hidden flex-wrap items-center gap-2 sm:flex">
                <ToolbarControls />
              </div>,
              navPortalDesktop
            )
          : null}
      </header>

      {errorMessage ? (
        <div className="rounded-xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
          {errorMessage}
        </div>
      ) : null}

      <div className="flex-1 min-h-0 overflow-y-auto pr-1">
        {optimisticProducts.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-slate-900/70 via-slate-900/40 to-slate-900/70 p-10 text-center text-slate-300 shadow-xl shadow-emerald-500/10">
            <p className="text-lg font-semibold text-white">No products yet</p>
            <p className="mt-2 text-sm text-slate-300">
              {userRole === "admin"
                ? "Drop something shiny to impress the cat."
                : "Ping your admin to feed the dashboard some goodies."}
            </p>
            {userRole === "admin" ? (
              <button
                onClick={() => setModalOpen(true)}
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 shadow-lg shadow-emerald-500/25 transition hover:-translate-y-0.5 hover:bg-emerald-400"
              >
                Add your first product
              </button>
            ) : null}
          </div>
        ) : (
          <div className="grid gap-6 pb-2 md:grid-cols-2 xl:grid-cols-3">
            {renderedProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onApprove={() => handleStatusChange(product.id, "APPROVED")}
                onReject={() => handleStatusChange(product.id, "REJECTED")}
                disabled={loadingId === product.id || deletingId === product.id}
            onImageClick={(images, idx, rect) => {
              setPreviewGrowIn(false);
              setPreviewImages(images);
              setPreviewIndex(idx);
              setPreviewImage(images[idx]);
            }}
            canDelete={userRole === "admin"}
            onDelete={userRole === "admin" ? () => handleDeleteProduct(product.id) : undefined}
            pulse={cardPulse[product.id]}
          />
            ))}
          </div>
        )}
      </div>

      {userRole === "admin" ? (
        <AddProductModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          onSubmit={handleCreateProduct}
          loading={creating}
        />
      ) : null}

      {previewImage ? (
        <div
          className={`fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 px-4 py-8 backdrop-blur transition-opacity duration-300 ${previewGrowIn ? "opacity-100" : "opacity-0"}`}
          onClick={() => setPreviewImage(null)}
        >
          <div
            className={`relative z-50 flex h-full w-full max-h-[92vh] max-w-[1200px] flex-col gap-4 overflow-hidden rounded-3xl border border-white/10 bg-slate-900/95 p-4 shadow-2xl shadow-emerald-500/20 backdrop-blur-sm transition-transform duration-300 ${previewGrowIn ? "translate-y-0 scale-100" : "translate-y-2 scale-95"}`}
            style={{ width: modalWidth, height: modalHeight }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="relative flex-1 min-h-[40vh] max-h-[70vh] overflow-hidden rounded-2xl bg-slate-950/60"
            >
              <Image
                src={previewImage}
                alt="Preview"
                fill
                sizes="(min-width: 1024px) 1100px, 90vw"
                className="object-contain"
              />
            </div>
            <div className="flex flex-col gap-3">
              {previewImages.length > 1 ? (
                <div className="flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      const next = previewIndex === 0 ? previewImages.length - 1 : previewIndex - 1;
                      setPreviewIndex(next);
                      setPreviewImage(previewImages[next]);
                    }}
                    className="inline-flex items-center gap-2 rounded-xl border border-white/15 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:border-emerald-400/60 hover:text-white hover:shadow-lg hover:shadow-emerald-500/20"
                  >
                    <span aria-hidden>←</span> Previous
                  </button>
                  <div className="flex items-center gap-2 text-xs text-slate-300">
                    {previewImages.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setPreviewIndex(idx);
                          setPreviewImage(previewImages[idx]);
                        }}
                        className={`h-2.5 w-2.5 rounded-full transition ${idx === previewIndex ? "bg-emerald-400" : "bg-white/25 hover:bg-white/50"}`}
                        aria-label={`Go to image ${idx + 1}`}
                      />
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const next = previewIndex === previewImages.length - 1 ? 0 : previewIndex + 1;
                      setPreviewIndex(next);
                      setPreviewImage(previewImages[next]);
                    }}
                    className="inline-flex items-center gap-2 rounded-xl border border-white/15 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:border-emerald-400/60 hover:text-white hover:shadow-lg hover:shadow-emerald-500/20"
                  >
                    Next <span aria-hidden>→</span>
                  </button>
                </div>
              ) : null}
              <button
                type="button"
                onClick={() => setPreviewImage(null)}
                className="w-full rounded-xl border border-white/15 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:border-emerald-400/60 hover:text-white hover:shadow-lg hover:shadow-emerald-500/20"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      ) : null}

    </section>
  );
}
