"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  Upload,
  Loader2,
  ImageIcon,
  CheckCircle,
  X,
  Plus,
} from "lucide-react";
import dynamic from "next/dynamic";
import { useAppStore } from "@/lib/store";
import { formatPrice, cn } from "@/lib/utils";
import {
  PRICE_TYPE_LABELS,
  CONDITION_LABELS,
} from "@/lib/constants";
import PriceSuggestion from "@/components/PriceSuggestion";

const LocationPicker = dynamic(() => import("@/components/LocationPicker"), { ssr: false });

interface UploadedImage {
  id: string;
  url: string;
  file?: File;
  preview?: string;
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
  latitude: string;
  longitude: string;
}

const STEPS = ["Category", "Details", "Preview"];

const initialForm: FormData = {
  categoryId: "",
  subcategoryId: "",
  title: "",
  description: "",
  price: "",
  priceType: "FIXED",
  condition: "USED",
  location: "",
  latitude: "",
  longitude: "",
};

export default function NewListingPage() {
  const router = useRouter();
  const { user, openAuthModal } = useAppStore();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormData>(initialForm);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>(
    {}
  );
  const [images, setImages] = useState<UploadedImage[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const maxImages = 4;

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files) return;

    const remaining = maxImages - images.length;
    const selected = Array.from(files).slice(0, remaining);

    const newImages: UploadedImage[] = selected.map((file) => ({
      id: `temp-${Date.now()}-${Math.random()}`,
      url: "",
      file,
      preview: URL.createObjectURL(file),
    }));

    setImages((prev) => [...prev, ...newImages]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function removeImage(id: string) {
    setImages((prev) => {
      const img = prev.find((i) => i.id === id);
      if (img?.preview) URL.revokeObjectURL(img.preview);
      return prev.filter((i) => i.id !== id);
    });
  }

  async function uploadImages(listingId: string) {
    const pending = images.filter((img) => img.file);
    for (const img of pending) {
      const formData = new FormData();
      formData.append("file", img.file!);
      formData.append("listingId", listingId);

      setImages((prev) =>
        prev.map((i) => (i.id === img.id ? { ...i, uploading: true } : i))
      );

      try {
        const res = await fetch("/api/images/upload", {
          method: "POST",
          body: formData,
        });
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Upload failed");
        }
        const uploaded = await res.json();
        setImages((prev) =>
          prev.map((i) =>
            i.id === img.id
              ? { ...i, id: uploaded.id, url: uploaded.url, uploading: false, file: undefined }
              : i
          )
        );
      } catch (err: unknown) {
        setImages((prev) =>
          prev.map((i) =>
            i.id === img.id
              ? { ...i, uploading: false, error: err instanceof Error ? err.message : "Failed" }
              : i
          )
        );
      }
    }
  }

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((data) => {
        const cats = Array.isArray(data) ? data : data.categories ?? data.data ?? [];
        setCategories(cats);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Auth guard
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl border border-gray-200 p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Upload className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">
            Sign in to post a listing
          </h1>
          <p className="text-gray-500 mb-6">
            You need to be logged in to create a listing on Zambia.net Marketplace.
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

  const selectedCategory = categories.find((c) => c.id === form.categoryId);
  const subcategories = selectedCategory?.subcategories ?? [];

  function updateField(field: keyof FormData, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  }

  function validateStep(): boolean {
    const newErrors: Partial<Record<keyof FormData, string>> = {};

    if (step === 0) {
      if (!form.categoryId) newErrors.categoryId = "Please select a category";
    }

    if (step === 1) {
      if (!form.title.trim()) newErrors.title = "Title is required";
      else if (form.title.trim().length < 3)
        newErrors.title = "Title must be at least 3 characters";
      else if (form.title.trim().length > 120)
        newErrors.title = "Title must be under 120 characters";

      if (
        form.priceType === "FIXED" ||
        form.priceType === "NEGOTIABLE"
      ) {
        if (!form.price.trim()) newErrors.price = "Price is required";
        else if (isNaN(Number(form.price)) || Number(form.price) < 0)
          newErrors.price = "Enter a valid price";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function nextStep() {
    if (validateStep()) {
      setStep((s) => Math.min(s + 1, STEPS.length - 1));
    }
  }

  function prevStep() {
    setStep((s) => Math.max(s - 1, 0));
  }

  async function handleSubmit() {
    setSubmitting(true);
    try {
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

      if (form.latitude && form.longitude) {
        body.latitude = parseFloat(form.latitude);
        body.longitude = parseFloat(form.longitude);
      }

      const res = await fetch("/api/listings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "Failed to create listing");
        setSubmitting(false);
        return;
      }

      const listing = await res.json();
      const listingId = listing.id ?? listing.data?.id;

      // Upload images if any
      if (images.length > 0) {
        await uploadImages(listingId);
      }

      router.push(`/listings/${listingId}`);
    } catch {
      alert("Something went wrong. Please try again.");
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          Post a Listing
        </h1>

        {/* Stepper */}
        <div className="flex items-center gap-2 mb-8">
          {STEPS.map((label, i) => (
            <div key={label} className="flex items-center gap-2 flex-1">
              <div className="flex items-center gap-2 flex-1">
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0",
                    i < step && "bg-green-500 text-white",
                    i === step && "bg-blue-600 text-white",
                    i > step && "bg-gray-200 text-gray-500"
                  )}
                >
                  {i < step ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    i + 1
                  )}
                </div>
                <span
                  className={cn(
                    "text-sm font-medium hidden sm:block",
                    i === step ? "text-gray-900" : "text-gray-500"
                  )}
                >
                  {label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div
                  className={cn(
                    "h-0.5 flex-1",
                    i < step ? "bg-green-500" : "bg-gray-200"
                  )}
                />
              )}
            </div>
          ))}
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
            </div>
          ) : (
            <>
              {/* Step 0: Category */}
              {step === 0 && (
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    Select a category
                  </h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {categories.map((cat) => (
                      <button
                        key={cat.id}
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
                    <p className="text-red-500 text-sm mt-2">
                      {errors.categoryId}
                    </p>
                  )}

                  {/* Subcategories */}
                  {subcategories.length > 0 && (
                    <div className="mt-6">
                      <h3 className="text-sm font-semibold text-gray-700 mb-3">
                        Subcategory (optional)
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {subcategories.map((sub) => (
                          <button
                            key={sub.id}
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
              )}

              {/* Step 1: Details */}
              {step === 1 && (
                <div className="space-y-5">
                  <h2 className="text-lg font-semibold text-gray-900 mb-1">
                    Listing details
                  </h2>

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
                      onChange={(e) =>
                        updateField("description", e.target.value)
                      }
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
                  {(form.priceType === "FIXED" ||
                    form.priceType === "NEGOTIABLE") && (
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
                        <p className="text-red-500 text-sm mt-1">
                          {errors.price}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Price suggestion */}
                  {form.categoryId && (
                    <PriceSuggestion
                      categoryId={form.categoryId}
                      condition={form.condition}
                    />
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
                    <LocationPicker
                      latitude={form.latitude ? parseFloat(form.latitude) : undefined}
                      longitude={form.longitude ? parseFloat(form.longitude) : undefined}
                      locationText={form.location}
                      onChange={(lat, lng) => {
                        updateField("latitude", String(lat));
                        updateField("longitude", String(lng));
                      }}
                      onLocationTextChange={(text) => updateField("location", text)}
                    />
                  </div>

                  {/* Image upload */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Photos ({images.length}/{maxImages})
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
                      {images.map((img) => (
                        <div
                          key={img.id}
                          className="relative aspect-square rounded-xl overflow-hidden border border-gray-200 bg-gray-100"
                        >
                          <img
                            src={img.preview || img.url}
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
                            onClick={() => removeImage(img.id)}
                            className="absolute top-1 right-1 w-6 h-6 bg-black/60 rounded-full flex items-center justify-center hover:bg-black/80 transition"
                          >
                            <X className="w-3.5 h-3.5 text-white" />
                          </button>
                        </div>
                      ))}
                      {images.length < maxImages && (
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
                </div>
              )}

              {/* Step 2: Preview */}
              {step === 2 && (
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    Review your listing
                  </h2>

                  <div className="space-y-4">
                    {/* Preview images */}
                    {images.length > 0 ? (
                      <div className="grid grid-cols-3 gap-2">
                        {images.map((img, i) => (
                          <div
                            key={img.id}
                            className={cn(
                              "rounded-lg overflow-hidden bg-gray-100",
                              i === 0 ? "col-span-3 aspect-[16/10]" : "aspect-square"
                            )}
                          >
                            <img
                              src={img.preview || img.url}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="aspect-[16/10] bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
                        <div className="text-center">
                          <ImageIcon className="w-12 h-12 mx-auto mb-1 text-gray-300" />
                          <span className="text-sm">No images added</span>
                        </div>
                      </div>
                    )}

                    {/* Preview details */}
                    <div className="border border-gray-200 rounded-lg p-4 space-y-3">
                      <div>
                        <span className="text-xs font-medium text-gray-500 uppercase">
                          Title
                        </span>
                        <p className="text-lg font-semibold text-gray-900">
                          {form.title}
                        </p>
                      </div>

                      <div>
                        <span className="text-xs font-medium text-gray-500 uppercase">
                          Price
                        </span>
                        <p className="text-xl font-bold text-blue-600">
                          {form.priceType === "FREE"
                            ? "Free"
                            : form.priceType === "CONTACT"
                              ? "Contact for Price"
                              : form.priceType === "SWAP"
                                ? "Swap / Trade"
                                : formatPrice(
                                    form.price ? parseFloat(form.price) : null
                                  )}
                          {form.priceType === "NEGOTIABLE" && (
                            <span className="text-sm font-normal text-gray-500 ml-1">
                              (Negotiable)
                            </span>
                          )}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <span className="text-xs font-medium text-gray-500 uppercase">
                            Category
                          </span>
                          <p className="text-sm text-gray-900">
                            {selectedCategory?.name}
                            {form.subcategoryId &&
                              subcategories.find(
                                (s) => s.id === form.subcategoryId
                              ) &&
                              ` > ${subcategories.find((s) => s.id === form.subcategoryId)!.name}`}
                          </p>
                        </div>
                        <div>
                          <span className="text-xs font-medium text-gray-500 uppercase">
                            Condition
                          </span>
                          <p className="text-sm text-gray-900">
                            {CONDITION_LABELS[form.condition] || form.condition}
                          </p>
                        </div>
                      </div>

                      {form.location && (
                        <div>
                          <span className="text-xs font-medium text-gray-500 uppercase">
                            Location
                          </span>
                          <p className="text-sm text-gray-900">
                            {form.location}
                          </p>
                        </div>
                      )}

                      {form.description && (
                        <div>
                          <span className="text-xs font-medium text-gray-500 uppercase">
                            Description
                          </span>
                          <p className="text-sm text-gray-700 whitespace-pre-wrap">
                            {form.description}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation buttons */}
              <div className="flex items-center justify-between mt-8 pt-5 border-t border-gray-100">
                {step > 0 ? (
                  <button
                    onClick={prevStep}
                    className="flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Back
                  </button>
                ) : (
                  <div />
                )}

                {step < STEPS.length - 1 ? (
                  <button
                    onClick={nextStep}
                    className="flex items-center gap-1 bg-blue-600 text-white font-semibold py-2.5 px-6 rounded-xl hover:bg-blue-700 transition-colors"
                  >
                    Continue
                    <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="flex items-center gap-2 bg-green-500 text-white font-semibold py-2.5 px-8 rounded-xl hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting && (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    )}
                    {submitting ? "Posting..." : "Post Listing"}
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
