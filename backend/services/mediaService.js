// backend/services/mediaService.js
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import dotenv from 'dotenv';
dotenv.config();

const r2Client = new S3Client({
  region:   'auto',
  endpoint: `https://${process.env.CF_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId:     process.env.CF_R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.CF_R2_SECRET_ACCESS_KEY,
  },
});

// Upload buffer to R2 and return its public URL
export async function uploadToR2({ key, body, contentType }) {
  await r2Client.send(new PutObjectCommand({
    Bucket:      process.env.CF_R2_BUCKET,
    Key:         key,
    Body:        body,
    ContentType: contentType,
  }));
  return `https://${process.env.CF_ACCOUNT_ID}.r2.cloudflarestorage.com/${process.env.CF_R2_BUCKET}/${key}`;
}

// Delete object from R2
export async function deleteFromR2({ key }) {
  await r2Client.send(new DeleteObjectCommand({
    Bucket: process.env.CF_R2_BUCKET,
    Key:    key,
  }));
}


