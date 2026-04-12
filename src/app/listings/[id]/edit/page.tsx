"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  Upload,
  Loader2,
  X,
  Plus,
  ArrowLeft,
} from "lucide-react";
import { useAppStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import {
  PRICE_TYPE_LABELS,
  CONDITION_LABELS,
} from "@/lib/constants";

interface ExistingImage {
  id: string;
  url: string;
}

interface NewImage {
  id: string;
  url: string;
  file: File;
  preview: string;
  uploading?: boolean;
  error?: string;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  subcategories: { id: string; name: string; slug: string }[];
}

interface FormData {
  categoryId: string;
  subcategoryId: string;
  title: string;
  description: string;
  price: string;
  priceType: string;
  condition: string;
  location: string;
}

export default function EditListingPage() {
  const router = useRouter();
  const params = useParams();
  const listingId = params.id as string;
  const { user, openAuthModal } = useAppStore();

  const [form, setForm] = useState<FormData>({
    categoryId: "",
    subcategoryId: "",
    title: "",
    description: "",
    price: "",
    priceType: "FIXED",
    condition: "USED",
    location: "",
  });

  const [categories, setCategories] = useState<Category[]>([]);
  const [existingImages, setExistingImages] = useState<ExistingImage[]>([]);
  const [newImages, setNewImages] = useState<NewImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notAuthorized, setNotAuthorized] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [deletingImageIds, setDeletingImageIds] = useState<Set<string>>(new Set());
  const fileInputRef = useRef<HTMLInputElement>(null);

  const maxImages = 4;
  const totalImages = existingImages.length + newImages.length;

  // Fetch categories and listing data
  useEffect(() => {
    if (!user) return;

    async function fetchData() {
      try {
        const [catRes, listingRes] = await Promise.all([
          fetch("/api/categories"),
          fetch(`/api/listings/${listingId}`),
        ]);

        // Parse categories
        const catData = await catRes.json();
        const cats = Array.isArray(catData)
          ? catData
          : catData.categories ?? catData.data ?? [];
        setCategories(cats);

        // Parse listing
        if (!listingRes.ok) {
          if (listingRes.status === 404) {
            setNotFound(true);
          }
          setLoading(false);
          return;
        }

        const listing = await listingRes.json();
        const listingData = listing.data ?? listing;

        // Check ownership
        if (listingData.userId !== user?.id) {
          setNotAuthorized(true);
          setLoading(false);
          return;
        }

        // Populate form
        setForm({
          categoryId: listingData.categoryId || "",
          subcategoryId: listingData.subcategoryId || "",
          title: listingData.title || "",
          description: listingData.description || "",
          price: listingData.price != null ? String(listingData.price) : "",
          priceType: listingData.priceType || "FIXED",
          condition: listingData.condition || "USED",
          location: listingData.location || "",
        });

        // Populate existing images
        if (listingData.images && Array.isArray(listingData.images)) {
          setExistingImages(
            listingData.images.map((img: { id: string; url: string }) => ({
              id: img.id,
              url: img.url,
            }))
          );
        }
      } catch {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [user, listingId]);

  // Auth guard
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl border border-gray-200 p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Upload className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">
            Sign in to edit your listing
          </h1>
          <p className="text-gray-500 mb-6">
            You need to be logged in to edit a listing on Zambia.net Market.
          </p>
          <button
            onClick={() => openAuthModal("login")}
            className="w-full py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors"
          >
            Sign In
          </button>
          <button
            onClick={() => openAuthModal("register")}
            className="w-full mt-2 py-3 border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
          >
            Create an Account
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl border border-gray-200 p-8 max-w-md w-full text-center">
          <h1 className="text-xl font-bold text-gray-900 mb-2">
            Listing not found
          </h1>
          <p className="text-gray-500 mb-6">
            The listing you are trying to edit does not exist or has been removed.
          </p>
          <button
            onClick={() => router.push("/dashboard")}
            className="w-full py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (notAuthorized) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl border border-gray-200 p-8 max-w-md w-full text-center">
          <h1 className="text-xl font-bold text-gray-900 mb-2">
            Not authorized
          </h1>
          <p className="text-gray-500 mb-6">
            You do not have permission to edit this listing.
          </p>
          <button
            onClick={() => router.push("/dashboard")}
            className="w-full py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const selectedCategory = categories.find((c) => c.id === form.categoryId);
  const subcategories = selectedCategory?.subcategories ?? [];

  function updateField(field: keyof FormData, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  }

  function validate(): boolean {
    const newErrors: Partial<Record<keyof FormData, string>> = {};

    if (!form.title.trim()) newErrors.title = "Title is required";
    else if (form.title.trim().length < 3)
      newErrors.title = "Title must be at least 3 characters";
    else if (form.title.trim().length > 120)
      newErrors.title = "Title must be under 120 characters";

    if (!form.categoryId) newErrors.categoryId = "Please select a category";

    if (form.priceType === "FIXED" || form.priceType === "NEGOTIABLE") {
      if (!form.price.trim()) newErrors.price = "Price is required";
      else if (isNaN(Number(form.price)) || Number(form.price) < 0)
        newErrors.price = "Enter a valid price";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files) return;

    const remaining = maxImages - totalImages;
    const selected = Array.from(files).slice(0, remaining);

    const imgs: NewImage[] = selected.map((file) => ({
      id: `temp-${Date.now()}-${Math.random()}`,
      url: "",
      file,
      preview: URL.createObjectURL(file),
    }));

    setNewImages((prev) => [...prev, ...imgs]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function removeNewImage(id: string) {
    setNewImages((prev) => {
      const img = prev.find((i) => i.id === id);
      if (img?.preview) URL.revokeObjectURL(img.preview);
      return prev.filter((i) => i.id !== id);
    });
  }

  async function deleteExistingImage(id: string) {
    setDeletingImageIds((prev) => new Set(prev).add(id));
    try {
      const res = await fetch(`/api/images/${id}`, { method: "DELETE" });
      if (res.ok) {
        setExistingImages((prev) => prev.filter((img) => img.id !== id));
      } else {
        alert("Failed to delete image. Please try again.");
      }
    } catch {
      alert("Failed to delete image. Please try again.");
    } finally {
      setDeletingImageIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  }

  async function uploadNewImages() {
    const pending = newImages.filter((img) => img.file && !img.uploading);
    for (const img of pending) {
      const fd = new globalThis.FormData();
      fd.append("file", img.file);
      fd.append("listingId", listingId);

      setNewImages((prev) =>
        prev.map((i) => (i.id === img.id ? { ...i, uploading: true } : i))
      );

      try {
        const res = await fetch("/api/images/upload", {
          method: "POST",
          body: fd,
        });
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Upload failed");
        }
        const uploaded = await res.json();
        // Move from newImages to existingImages
        setNewImages((prev) => prev.filter((i) => i.id !== img.id));
        setExistingImages((prev) => [
          ...prev,
          { id: uploaded.id, url: uploaded.url },
        ]);
      } catch (err: unknown) {
        setNewImages((prev) =>
          prev.map((i) =>
            i.id === img.id
              ? {
                  ...i,
                  uploading: false,
                  error: err instanceof Error ? err.message : "Failed",
                }
              : i
          )
        );
      }
    }
  }

  async function handleSave() {
    if (!validate()) return;

    setSaving(true);
    try {
      // Upload any new images first
      if (newImages.length > 0) {
        await uploadNewImages();
      }

      const body: Record<string, unknown> = {
        title: form.title.trim(),
        description: form.description.trim() || undefined,
        categoryId: form.categoryId,
        subcategoryId: form.subcategoryId || undefined,
        priceType: form.priceType,
        condition: form.condition,
        location: form.location.trim() || undefined,
      };

      if (
        (form.priceType === "FIXED" || form.priceType === "NEGOTIABLE") &&
        form.price
      ) {
        body.price = parseFloat(form.price);
      }

      const res = await fetch(`/api/listings/${listingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "Failed to update listing");
        setSaving(false);
        return;
      }

      router.push(`/listings/${listingId}`);
    } catch {
      alert("Something went wrong. Please try again.");
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => router.push("/dashboard")}
            className="p-2 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Edit Listing</h1>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => {
                    updateField("categoryId", cat.id);
                    updateField("subcategoryId", "");
                  }}
                  className={cn(
                    "p-4 rounded-xl border-2 text-left transition-colors",
                    form.categoryId === cat.id
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  )}
                >
                  <span className="text-2xl block mb-1">
                    {cat.icon || "📁"}
                  </span>
                  <span className="text-sm font-medium text-gray-900">
                    {cat.name}
                  </span>
                </button>
              ))}
            </div>
            {errors.categoryId && (
              <p className="text-red-500 text-sm mt-2">{errors.categoryId}</p>
            )}

            {/* Subcategories */}
            {subcategories.length > 0 && (
              <div className="mt-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">
                  Subcategory (optional)
                </h3>
                <div className="flex flex-wrap gap-2">
                  {subcategories.map((sub) => (
                    <button
                      key={sub.id}
                      type="button"
                      onClick={() =>
                        updateField(
                          "subcategoryId",
                          form.subcategoryId === sub.id ? "" : sub.id
                        )
                      }
                      className={cn(
                        "px-4 py-2 rounded-full text-sm font-medium border transition-colors",
                        form.subcategoryId === sub.id
                          ? "border-blue-500 bg-blue-50 text-blue-700"
                          : "border-gray-200 text-gray-600 hover:border-gray-300"
                      )}
                    >
                      {sub.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => updateField("title", e.target.value)}
              maxLength={120}
              placeholder="What are you selling?"
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <div className="flex justify-between mt-1">
              {errors.title && (
                <p className="text-red-500 text-sm">{errors.title}</p>
              )}
              <p className="text-xs text-gray-400 ml-auto">
                {form.title.length}/120
              </p>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={form.description}
              onChange={(e) => updateField("description", e.target.value)}
              rows={4}
              placeholder="Describe your item, include details like brand, size, condition..."
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>

          {/* Price type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Price type
            </label>
            <div className="flex flex-wrap gap-2">
              {Object.entries(PRICE_TYPE_LABELS).map(([val, label]) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => updateField("priceType", val)}
                  className={cn(
                    "px-4 py-2 rounded-full text-sm font-medium border transition-colors",
                    form.priceType === val
                      ? "border-blue-500 bg-blue-50 text-blue-700"
                      : "border-gray-200 text-gray-600 hover:border-gray-300"
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Price input */}
          {(form.priceType === "FIXED" || form.priceType === "NEGOTIABLE") && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                  K
                </span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.price}
                  onChange={(e) => updateField("price", e.target.value)}
                  placeholder="0"
                  className="w-full border border-gray-300 rounded-lg pl-8 pr-4 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              {errors.price && (
                <p className="text-red-500 text-sm mt-1">{errors.price}</p>
              )}
            </div>
          )}

          {/* Condition */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Condition
            </label>
            <div className="flex flex-wrap gap-2">
              {Object.entries(CONDITION_LABELS).map(([val, label]) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => updateField("condition", val)}
                  className={cn(
                    "px-4 py-2 rounded-full text-sm font-medium border transition-colors",
                    form.condition === val
                      ? "border-blue-500 bg-blue-50 text-blue-700"
                      : "border-gray-200 text-gray-600 hover:border-gray-300"
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Location
            </label>
            <input
              type="text"
              value={form.location}
              onChange={(e) => updateField("location", e.target.value)}
              placeholder="City or area"
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Images */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Photos ({totalImages}/{maxImages})
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              multiple
              onChange={handleFileSelect}
              className="hidden"
            />
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {/* Existing images */}
              {existingImages.map((img) => (
                <div
                  key={img.id}
                  className="relative aspect-square rounded-xl overflow-hidden border border-gray-200 bg-gray-100"
                >
                  <img
                    src={img.url}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                  {deletingImageIds.has(img.id) ? (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <Loader2 className="w-6 h-6 text-white animate-spin" />
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => deleteExistingImage(img.id)}
                      className="absolute top-1 right-1 w-6 h-6 bg-black/60 rounded-full flex items-center justify-center hover:bg-black/80 transition"
                    >
                      <X className="w-3.5 h-3.5 text-white" />
                    </button>
                  )}
                </div>
              ))}

              {/* New images (pending upload) */}
              {newImages.map((img) => (
                <div
                  key={img.id}
                  className="relative aspect-square rounded-xl overflow-hidden border border-gray-200 bg-gray-100"
                >
                  <img
                    src={img.preview}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                  {img.uploading && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <Loader2 className="w-6 h-6 text-white animate-spin" />
                    </div>
                  )}
                  {img.error && (
                    <div className="absolute inset-0 bg-red-500/40 flex items-center justify-center">
                      <p className="text-white text-xs font-medium px-1 text-center">
                        {img.error}
                      </p>
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => removeNewImage(img.id)}
                    className="absolute top-1 right-1 w-6 h-6 bg-black/60 rounded-full flex items-center justify-center hover:bg-black/80 transition"
                  >
                    <X className="w-3.5 h-3.5 text-white" />
                  </button>
                </div>
              ))}

              {/* Add photo button */}
              {totalImages < maxImages && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="aspect-square rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center gap-1 hover:border-blue-400 hover:bg-blue-50 transition"
                >
                  <Plus className="w-6 h-6 text-gray-400" />
                  <span className="text-xs text-gray-500">Add photo</span>
                </button>
              )}
            </div>
            <p className="text-xs text-gray-400 mt-2">
              JPEG, PNG, WebP or GIF. Max 5MB each.
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-between pt-5 border-t border-gray-100">
            <button
              onClick={() => router.push("/dashboard")}
              className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors px-4 py-2.5"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 bg-blue-600 text-white font-semibold py-2.5 px-8 rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
