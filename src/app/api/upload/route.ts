import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import { getUserFromRequest } from '@/lib/auth';
import fs from 'fs';
import path from 'path';

// Configure Cloudinary if credentials are provided in env
const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

const isCloudinaryConfigured = Boolean(cloudName && apiKey && apiSecret);

if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  });
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export async function POST(req: NextRequest) {
  try {
    const user = getUserFromRequest(req);
    if (!user || (user.role !== 'SUPER_ADMIN' && user.role !== 'ADMIN')) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Admin access required to upload images' },
        { status: 403 }
      );
    }

    const formData = await req.formData();
    const files = formData.getAll('files') as File[];
    const singleFile = formData.get('file') as File | null;

    // Optional folder parameter for organizing uploads
    const folder = (formData.get('folder') as string) || 'vasantham/products';

    const filesToUpload: File[] = [];
    if (singleFile) filesToUpload.push(singleFile);
    if (files && files.length > 0) {
      for (const f of files) {
        if (f && typeof f === 'object' && f.name) {
          filesToUpload.push(f);
        }
      }
    }

    if (filesToUpload.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No files provided for upload' },
        { status: 400 }
      );
    }

    // Validate file sizes
    for (const file of filesToUpload) {
      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          {
            success: false,
            error: `File "${file.name}" exceeds maximum size of 10MB`,
          },
          { status: 400 }
        );
      }

      // Check file type
      if (file.type && !file.type.startsWith('image/')) {
        return NextResponse.json(
          {
            success: false,
            error: `File "${file.name}" is not a supported image format`,
          },
          { status: 400 }
        );
      }
    }

    const uploadedUrls: string[] = [];

    for (const file of filesToUpload) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      if (isCloudinaryConfigured) {
        // Upload to Cloudinary with premium compression transformations
        const base64Data = buffer.toString('base64');
        const dataUri = `data:${file.type || 'image/webp'};base64,${base64Data}`;

        const uploadResult = await cloudinary.uploader.upload(dataUri, {
          folder,
          format: 'webp',
          resource_type: 'image',
          transformation: [
            {
              width: 2048,
              crop: 'limit',
              quality: 'auto:best',
              fetch_format: 'webp',
            },
          ],
        });

        uploadedUrls.push(uploadResult.secure_url);
      } else {
        // Fallback: Store locally in public/uploads folder
        const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
        if (!fs.existsSync(uploadsDir)) {
          fs.mkdirSync(uploadsDir, { recursive: true });
        }

        const safeFilename = `${Date.now()}-${Math.random().toString(36).substring(2, 7)}.webp`;
        const filePath = path.join(uploadsDir, safeFilename);
        fs.writeFileSync(filePath, buffer);

        uploadedUrls.push(`/uploads/${safeFilename}`);
      }
    }

    return NextResponse.json({
      success: true,
      url: uploadedUrls[0],
      urls: uploadedUrls,
      storage: isCloudinaryConfigured ? 'cloudinary' : 'local_fallback',
    });
  } catch (error: any) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Image upload failed' },
      { status: 500 }
    );
  }
}
