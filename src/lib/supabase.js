/**
 * lib/supabase.js
 * Supabase (DB) + Backblaze (Storage)
 */

import { createClient } from "@supabase/supabase-js";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

// ==============================
// 🔹 SUPABASE (BASE DE DATOS)
// ==============================

const SUPABASE_URL  = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON = import.meta.env.VITE_SUPABASE_ANON;

export const supabaseConfigured =
  !!SUPABASE_URL &&
  !!SUPABASE_ANON &&
  !SUPABASE_URL.includes("TU_PROYECTO");

export const supabase = supabaseConfigured
  ? createClient(SUPABASE_URL, SUPABASE_ANON)
  : null;


// ==============================
// 🔹 BACKBLAZE (STORAGE)
// ==============================

const s3 = new S3Client({
  region: "us-east-005",
  endpoint: "https://s3.us-east-005.backblazeb2.com",
  forcePathStyle: true, // importante
  credentials: {
    accessKeyId: import.meta.env.VITE_B2_KEY_ID,
    secretAccessKey: import.meta.env.VITE_B2_APP_KEY,
  },
});


// ==============================
// 🚀 UPLOAD
// ==============================

export async function uploadToStorage(file, folder = "") {
  if (!file) throw new Error("No se proporcionó ningún archivo");

  const ext = file.name.split(".").pop();
  const filename = `${folder}${Date.now()}_${Math.random()
    .toString(36)
    .slice(2, 8)}.${ext}`;

  const fileBuffer = await file.arrayBuffer();

  const command = new PutObjectCommand({
    Bucket: import.meta.env.VITE_B2_BUCKET,
    Key: filename,
    Body: fileBuffer,
    ContentType: file.type,
  });

  try {
    await s3.send(command);

    // ✅ URL S3 compatible (la correcta para lectura y escritura)
    return `https://${import.meta.env.VITE_B2_BUCKET}.s3.us-east-005.backblazeb2.com/${filename}`;
  } catch (err) {
    console.error("Error subiendo a Backblaze:", err);
    throw new Error("No se pudo subir el archivo");
  }
}