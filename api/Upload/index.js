const path = require('path');
const crypto = require('crypto');
const s = require('../shared/storage');

const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);
const MAX_FILE_SIZE = 5 * 1024 * 1024;

module.exports = async function (context, req) {
  if (req.method === 'OPTIONS') {
    context.res = { status: 204, headers: s.corsHeaders() };
    return;
  }
  if (!s.checkAdmin(req)) {
    context.res = s.jsonResponse(401, { error: 'Invalid admin password' });
    return;
  }

  const contentType = (req.headers['content-type'] || '').split(';')[0].toLowerCase();
  const body = Buffer.isBuffer(req.body) ? req.body : Buffer.from(req.rawBody || '');
  if (!ALLOWED_TYPES.has(contentType) || !body.length || body.length > MAX_FILE_SIZE) {
    context.res = s.jsonResponse(400, { error: 'Upload a JPG, PNG, WebP, or GIF image up to 5 MB' });
    return;
  }

  const originalName = req.headers['x-file-name'] || '';
  const extension = path.extname(originalName).toLowerCase() || `.${contentType.split('/')[1]}`;
  const blobName = `images/${Date.now()}-${crypto.randomBytes(8).toString('hex')}${extension}`;

  try {
    const url = await s.writeBinaryBlob(blobName, body, contentType);
    context.res = s.jsonResponse(200, { url });
  } catch (err) {
    context.res = s.jsonResponse(500, { error: err.message });
  }
};
