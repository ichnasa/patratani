import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { HANDOVER_EVIDENCE_BUCKET } from "@/contracts/patra-tani.contract";
import { AppError } from "@/lib/action-handler";

const MAX_EVIDENCE_BYTES = 5 * 1024 * 1024;
const SIGNED_URL_TTL_SECONDS = 60 * 60;

const ALLOWED_MIME_TYPES = {
  "image/jpeg": "jpg",
  "image/webp": "webp",
} as const;
type AllowedMimeType = keyof typeof ALLOWED_MIME_TYPES;

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const SAFE_ID_RE = /^[A-Za-z0-9_-]{1,64}$/;

let adminClient: SupabaseClient | null = null;

/**
 * Service-role client: bypasses RLS. Server-only — never import from client code.
 * Lazily created so builds without storage env vars still succeed.
 */
function getStorageAdmin(): SupabaseClient {
  if (adminClient) return adminClient;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set.");
  }
  adminClient = createClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return adminClient;
}

/** Checks magic bytes, since the Blob's `type` is client-controlled. */
function matchesSignature(bytes: Uint8Array, mime: AllowedMimeType): boolean {
  if (mime === "image/jpeg") {
    return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  }
  const ascii = (from: number, to: number) => String.fromCharCode(...bytes.subarray(from, to));
  return ascii(0, 4) === "RIFF" && ascii(8, 12) === "WEBP";
}

export type UploadedHandoverEvidence = {
  /** Object path inside the bucket; persist as `handoverEvidences.storagePath`. */
  storagePath: string;
  /** Short-lived signed URL (bucket is private). */
  signedUrl: string;
};

/**
 * Uploads a webcam handover photo (timestamp + GPS already burned in by the
 * client canvas) to the private `handover-evidence` bucket.
 * Throws `AppError` on invalid input or storage failure.
 */
export async function uploadHandoverEvidencePhoto(params: {
  orderId: string;
  userId: string;
  fileBlob: File | Blob;
}): Promise<UploadedHandoverEvidence> {
  const { orderId, userId, fileBlob } = params;

  // IDs become path segments: reject anything that could escape the folder.
  if (!UUID_RE.test(orderId) || !SAFE_ID_RE.test(userId)) {
    throw new AppError("VALIDATION_ERROR", "ID pesanan atau pengguna tidak valid.");
  }

  const mime = fileBlob.type as AllowedMimeType;
  if (!(mime in ALLOWED_MIME_TYPES)) {
    throw new AppError("VALIDATION_ERROR", "Foto harus berformat JPEG atau WebP.", {
      photo: ["Format tidak didukung."],
    });
  }
  if (fileBlob.size === 0 || fileBlob.size > MAX_EVIDENCE_BYTES) {
    throw new AppError("VALIDATION_ERROR", "Ukuran foto maksimal 5 MB.", {
      photo: ["Ukuran tidak valid."],
    });
  }

  const bytes = new Uint8Array(await fileBlob.arrayBuffer());
  if (!matchesSignature(bytes, mime)) {
    throw new AppError("VALIDATION_ERROR", "Isi file tidak sesuai format gambar.", {
      photo: ["File rusak atau bukan gambar."],
    });
  }

  const storagePath = `${orderId}/${userId}/${Date.now()}-${crypto.randomUUID()}.${ALLOWED_MIME_TYPES[mime]}`;
  const bucket = getStorageAdmin().storage.from(HANDOVER_EVIDENCE_BUCKET);

  const { error: uploadError } = await bucket.upload(storagePath, bytes, {
    contentType: mime,
    cacheControl: "3600",
    upsert: false,
  });
  if (uploadError) {
    console.error("[storage] handover upload failed", uploadError);
    throw new AppError("STORAGE_ERROR", "Gagal mengunggah foto serah terima. Coba lagi.");
  }

  return { storagePath, signedUrl: await createHandoverEvidenceSignedUrl(storagePath) };
}

/** Fresh signed URL for an existing evidence object (e.g. when building OrderDetailDTO). */
export async function createHandoverEvidenceSignedUrl(
  storagePath: string,
  expiresInSeconds = SIGNED_URL_TTL_SECONDS,
): Promise<string> {
  const { data, error } = await getStorageAdmin()
    .storage.from(HANDOVER_EVIDENCE_BUCKET)
    .createSignedUrl(storagePath, expiresInSeconds);
  if (error || !data) {
    console.error("[storage] signed URL failed", error);
    throw new AppError("STORAGE_ERROR", "Gagal memuat foto serah terima.");
  }
  return data.signedUrl;
}

/** Best-effort cleanup when the DB write after an upload fails. */
export async function removeHandoverEvidencePhoto(storagePath: string): Promise<void> {
  const { error } = await getStorageAdmin()
    .storage.from(HANDOVER_EVIDENCE_BUCKET)
    .remove([storagePath]);
  if (error) console.error("[storage] cleanup failed", storagePath, error);
}
