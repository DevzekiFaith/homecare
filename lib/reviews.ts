import { createClient } from "@/lib/supabase/client";

export interface Review {
  id: string;
  request_id: string;
  customer_id?: string | null;
  worker_id: string;
  rating: number; // 1 to 5
  comment: string;
  created_at: string;
  // Dynamic display fields
  customer_name?: string;
  worker_name?: string;
  service_type?: string;
}

const LOCAL_STORAGE_KEY = "homecare_mock_reviews";

// Helper to check if reviews table is missing
function isTableMissingError(error: any): boolean {
  if (!error) return false;
  return (
    error.code === "PGRST205" ||
    error.status === 404 ||
    (error.message && error.message.includes("Could not find the table"))
  );
}

// Get reviews from localStorage
function getLocalReviews(): Review[] {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (!stored) return [];
  try {
    return JSON.parse(stored);
  } catch (e) {
    return [];
  }
}

// Save reviews to localStorage
function saveLocalReviews(reviews: Review[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(reviews));
}

/**
 * Fetch all reviews
 */
export async function fetchAllReviews(): Promise<{ data: Review[]; isFallback: boolean; error: any }> {
  const supabase = createClient();
  try {
    const { data, error } = await supabase
      .from("reviews")
      .select(`
        *,
        worker:profiles!worker_id(full_name),
        customer:profiles!customer_id(full_name),
        service_requests(service_type)
      `)
      .order("created_at", { ascending: false });

    if (error) {
      if (isTableMissingError(error)) {
        console.warn("[Reviews] Supabase reviews table missing. Falling back to localStorage mock.");
        return { data: getLocalReviews(), isFallback: true, error: null };
      }
      throw error;
    }

    // Format the response fields
    const formatted: Review[] = (data || []).map((item: any) => ({
      id: item.id,
      request_id: item.request_id,
      customer_id: item.customer_id,
      worker_id: item.worker_id,
      rating: item.rating,
      comment: item.comment,
      created_at: item.created_at,
      worker_name: item.worker?.full_name || "Unknown Worker",
      customer_name: item.customer?.full_name || "Anonymous Customer",
      service_type: item.service_requests?.service_type || "General Service",
    }));

    return { data: formatted, isFallback: false, error: null };
  } catch (err: any) {
    console.error("[Reviews] Fetch error:", err);
    return { data: getLocalReviews(), isFallback: true, error: err };
  }
}

/**
 * Submit a review
 */
export async function submitReview(reviewData: Omit<Review, "id" | "created_at"> & {
  worker_name?: string;
  customer_name?: string;
  service_type?: string;
}): Promise<{ data: Review | null; isFallback: boolean; error: any }> {
  const supabase = createClient();
  const id = crypto.randomUUID();
  const created_at = new Date().toISOString();

  const newReview: Review = {
    id,
    created_at,
    request_id: reviewData.request_id,
    customer_id: reviewData.customer_id,
    worker_id: reviewData.worker_id,
    rating: reviewData.rating,
    comment: reviewData.comment,
    worker_name: reviewData.worker_name || "Verified Pro",
    customer_name: reviewData.customer_name || "Valued Customer",
    service_type: reviewData.service_type || "Homecare Service",
  };

  try {
    // Attempt database insert
    const { data, error } = await supabase
      .from("reviews")
      .insert({
        id,
        request_id: reviewData.request_id,
        customer_id: reviewData.customer_id || null,
        worker_id: reviewData.worker_id,
        rating: reviewData.rating,
        comment: reviewData.comment,
        created_at,
      })
      .select()
      .single();

    if (error) {
      if (isTableMissingError(error)) {
        console.warn("[Reviews] Supabase reviews table missing on insert. Saving to localStorage.");
        const current = getLocalReviews();
        // Prevent duplicate reviews for the same request
        const exists = current.some((r) => r.request_id === reviewData.request_id);
        if (exists) {
          return { data: null, isFallback: true, error: new Error("You have already reviewed this service.") };
        }
        current.unshift(newReview);
        saveLocalReviews(current);
        return { data: newReview, isFallback: true, error: null };
      }
      throw error;
    }

    return { data: newReview, isFallback: false, error: null };
  } catch (err: any) {
    console.error("[Reviews] Submit error:", err);
    // Fall back to localStorage on exception
    const current = getLocalReviews();
    const exists = current.some((r) => r.request_id === reviewData.request_id);
    if (exists) {
      return { data: null, isFallback: true, error: new Error("You have already reviewed this service.") };
    }
    current.unshift(newReview);
    saveLocalReviews(current);
    return { data: newReview, isFallback: true, error: null };
  }
}

/**
 * Check if a request has already been reviewed
 */
export async function hasRequestBeenReviewed(requestId: string): Promise<boolean> {
  const supabase = createClient();
  try {
    const { data, error } = await supabase
      .from("reviews")
      .select("id")
      .eq("request_id", requestId)
      .maybeSingle();

    if (error) {
      if (isTableMissingError(error)) {
        return getLocalReviews().some((r) => r.request_id === requestId);
      }
      throw error;
    }

    return !!data;
  } catch (err) {
    return getLocalReviews().some((r) => r.request_id === requestId);
  }
}
