const cloudinary = require('../config/cloudinary');

/* ────────────────────────────────────────────────────────
 *  STORAGE CONTROLLER
 *  – GET  /api/storage/usage       → { usedBytes, usedGB, planLimitGB, percent, images: {bytes, count}, videos: {bytes, count} }
 *  – GET  /api/storage/resources   → paginated list with filter/sort
 *  – DELETE /api/storage/resources/:publicId → delete one resource
 * ──────────────────────────────────────────────────────── */

const PLAN_LIMIT_GB = 25; // Cloudinary free plan

/**
 * Format bytes to human-readable
 */
function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * GET /api/storage/usage
 * Returns storage usage statistics computed from ALL Cloudinary resources.
 * (Cloudinary's usage API updates daily, so we compute live for accuracy.)
 */
exports.getUsage = async (_req, res, next) => {
  try {
    // Fetch ALL resources (images + videos) with pagination
    let allResources = [];
    let nextCursor = null;
    const batchSize = 500; // Cloudinary max per request

    // Fetch all images
    do {
      const params = { resource_type: 'image', max_results: batchSize };
      if (nextCursor) params.next_cursor = nextCursor;
      const result = await cloudinary.api.resources(params);
      allResources.push(...(result.resources || []));
      nextCursor = result.next_cursor || null;
    } while (nextCursor);

    // Fetch all videos
    nextCursor = null;
    do {
      const params = { resource_type: 'video', max_results: batchSize };
      if (nextCursor) params.next_cursor = nextCursor;
      const result = await cloudinary.api.resources(params);
      allResources.push(...(result.resources || []));
      nextCursor = result.next_cursor || null;
    } while (nextCursor);

    // Compute stats
    const imageResources = allResources.filter((r) => r.resource_type === 'image');
    const videoResources = allResources.filter((r) => r.resource_type === 'video');

    const totalBytes = allResources.reduce((sum, r) => sum + (r.bytes || 0), 0);
    const imageBytes = imageResources.reduce((sum, r) => sum + (r.bytes || 0), 0);
    const videoBytes = videoResources.reduce((sum, r) => sum + (r.bytes || 0), 0);

    const usedGB = totalBytes / (1024 * 1024 * 1024);
    const imagePct = totalBytes > 0 ? (imageBytes / totalBytes) * 100 : 0;
    const videoPct = totalBytes > 0 ? (videoBytes / totalBytes) * 100 : 0;

    res.json({
      usedBytes: totalBytes,
      usedGB:    parseFloat(usedGB.toFixed(4)),
      usedHuman: formatBytes(totalBytes),
      planLimitGB: PLAN_LIMIT_GB,
      percent:   parseFloat(((usedGB / PLAN_LIMIT_GB) * 100).toFixed(2)),
      images: {
        count: imageResources.length,
        bytes: imageBytes,
        bytesHuman: formatBytes(imageBytes),
        percent: parseFloat(imagePct.toFixed(2))
      },
      videos: {
        count: videoResources.length,
        bytes: videoBytes,
        bytesHuman: formatBytes(videoBytes),
        percent: parseFloat(videoPct.toFixed(2))
      },
      totalResources: allResources.length,
      formatBytes
    });
  } catch (err) {
    console.error('Cloudinary usage error:', err.message);
    next(err);
  }
};

/**
 * GET /api/storage/resources?type=image|video&sort=size|date&order=desc&page=1&pageSize=24
 * Returns a paginated list of Cloudinary resources.
 */
exports.getResources = async (req, res, next) => {
  try {
    const { type = 'all', sort = 'date', order = 'desc', page = 1, pageSize: max_results = 24 } = req.query;

    const baseParams = {
      max_results: parseInt(max_results),
      next_cursor: req.query.cursor || undefined,
      direction: order === 'asc' ? 1 : -1
    };

    if (sort === 'size') {
      baseParams.sort_by = 'bytes';
    } else {
      baseParams.sort_by = 'created_at';
    }

    let resources = [];
    let nextCursor = null;

    if (type === 'image') {
      const result = await cloudinary.api.resources({ ...baseParams, resource_type: 'image' });
      resources = result.resources || [];
      nextCursor = result.next_cursor || null;
    } else if (type === 'video') {
      const result = await cloudinary.api.resources({ ...baseParams, resource_type: 'video' });
      resources = result.resources || [];
      nextCursor = result.next_cursor || null;
    } else {
      // 'all' — fetch both images and videos and merge
      const [imgResult, vidResult] = await Promise.all([
        cloudinary.api.resources({ ...baseParams, resource_type: 'image' }).catch(() => ({ resources: [] })),
        cloudinary.api.resources({ ...baseParams, resource_type: 'video' }).catch(() => ({ resources: [] }))
      ]);
      resources = [...(imgResult.resources || []), ...(vidResult.resources || [])];
      nextCursor = imgResult.next_cursor || vidResult.next_cursor || null;

      // When fetching 'all', sort the combined list
      if (sort === 'size') {
        resources.sort((a, b) => order === 'asc' ? (a.bytes || 0) - (b.bytes || 0) : (b.bytes || 0) - (a.bytes || 0));
      } else {
        resources.sort((a, b) => order === 'asc'
          ? new Date(a.created_at) - new Date(b.created_at)
          : new Date(b.created_at) - new Date(a.created_at)
        );
      }

      // Trim to pageSize
      resources = resources.slice(0, parseInt(max_results));
    }

    const mapped = resources.map((r) => ({
      publicId:     r.public_id,
      url:          r.secure_url,
      format:       r.format,
      resourceType: r.resource_type,
      bytes:        r.bytes,
      bytesHuman:   formatBytes(r.bytes || 0),
      createdAt:    r.created_at,
      width:        r.width  || null,
      height:       r.height || null,
      duration:     r.duration || null
    }));

    // Compute aggregates
    const totalBytes = mapped.reduce((sum, r) => sum + (r.bytes || 0), 0);
    const imageBytes = mapped.filter((r) => r.resourceType === 'image').reduce((sum, r) => sum + (r.bytes || 0), 0);
    const videoBytes = mapped.filter((r) => r.resourceType === 'video').reduce((sum, r) => sum + (r.bytes || 0), 0);

    res.json({
      resources: mapped,
      totalBytes,
      imageBytes,
      videoBytes,
      totalResources: mapped.length,
      nextCursor,
      page: parseInt(page)
    });
  } catch (err) {
    console.error('Cloudinary resources error:', err.message);
    next(err);
  }
};

/**
 * DELETE /api/storage/resources/:publicId?type=image|video
 * Delete a single resource from Cloudinary.
 * publicId may contain slashes — route uses a wildcard.
 */
exports.deleteResource = async (req, res, next) => {
  try {
    // publicId comes from params[0] due to wildcard route
    const publicId    = req.params[0] || req.params.publicId;
    const resourceType = req.query.type || 'image';

    if (!publicId) return res.status(400).json({ message: 'publicId is required.' });

    await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
    res.json({ message: 'Resource deleted.', publicId });
  } catch (err) {
    console.error('Cloudinary delete error:', err.message);
    next(err);
  }
};

/* ────────────────────────────────────────────────────────
 *  COMPRESSION CONTROLLER
 *  – POST /api/storage/compress  → upload a file, get back compressed version
 *    Form data: file (image/video), quality (optional, default 'auto')
 *  – The compressed file is returned as a download URL
 * ──────────────────────────────────────────────────────── */

/**
 * POST /api/storage/compress
 * Upload a file to Cloudinary with compression transformations applied.
 * Returns the compressed file's URL so the admin can download it.
 *
 * For images: applies quality reduction + format optimization (f_auto)
 * For videos: applies video codec + quality reduction
 */
exports.compressMedia = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded.' });

    const quality = req.body.quality || 'auto'; // 'auto', 'low', 'medium', 'high', or number 1-100
    const streamifier = require('streamifier');

    // Determine resource type
    const isVideo = req.file.mimetype && req.file.mimetype.startsWith('video');
    const resourceType = isVideo ? 'video' : 'image';

    // Build transformation
    let transformation = {};
    if (isVideo) {
      transformation = [
        { quality: quality === 'auto' ? 'auto' : (typeof quality === 'string' ? parseInt(quality) : quality) },
        { fetch_format: 'auto' }
      ];
    } else {
      transformation = [
        { quality: quality === 'auto' ? 'auto' : (typeof quality === 'string' && isNaN(parseInt(quality)) ? quality : parseInt(quality)) },
        { fetch_format: 'auto' }
      ];
    }

    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'portfolio/compressed',
          resource_type: resourceType,
          transformation,
          unique_filename: true,
          overwrite: false
        },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        }
      );
      streamifier.createReadStream(req.file.buffer).pipe(uploadStream);
    });

    // Calculate compression info
    const originalBytes = req.file.size;
    const compressedBytes = result.bytes;
    const savedBytes = originalBytes - compressedBytes;
    const savedPercent = originalBytes > 0 ? parseFloat(((savedBytes / originalBytes) * 100).toFixed(2)) : 0;

    res.json({
      message: 'Compression complete.',
      original: {
        bytes: originalBytes,
        bytesHuman: formatBytes(originalBytes)
      },
      compressed: {
        url:        result.secure_url,
        publicId:   result.public_id,
        bytes:      compressedBytes,
        bytesHuman: formatBytes(compressedBytes),
        format:     result.format,
        width:      result.width  || null,
        height:     result.height || null
      },
      savedBytes,
      savedBytesHuman: formatBytes(savedBytes > 0 ? savedBytes : 0),
      savedPercent: savedPercent > 0 ? savedPercent : 0
    });
  } catch (err) {
    console.error('Compress error:', err.message);
    next(err);
  }
};
