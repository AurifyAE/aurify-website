import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { signedUrlTtl } from "./rules";

let client: S3Client | undefined;

function r2(): S3Client {
  client ??= new S3Client({
    region: "auto",
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID ?? "",
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY ?? "",
    },
    // R2 does not support the SDK's default flexible checksums.
    requestChecksumCalculation: "WHEN_REQUIRED",
    responseChecksumValidation: "WHEN_REQUIRED",
  });
  return client;
}

/** Signed link to the private MP4, valid for the video length + 30 min, never past access end. */
export async function signVideoUrl(accessEnd: Date): Promise<string> {
  const videoSeconds = Number(process.env.VIDEO_SECONDS);
  if (!Number.isFinite(videoSeconds)) throw new Error("VIDEO_SECONDS is not set");
  const ttl = signedUrlTtl(new Date(), accessEnd, videoSeconds);
  return getSignedUrl(
    r2(),
    new GetObjectCommand({ Bucket: process.env.R2_BUCKET, Key: process.env.R2_OBJECT_KEY }),
    { expiresIn: Math.max(1, ttl) }
  );
}
