const crypto = require('crypto');
const defaultConfig = require('./defaultConfig.json');

const CONFIG_BLOB = 'site-config.json';
const ENQUIRIES_BLOB = 'enquiries.json';

function parseConn(connStr) {
  const parts = {};
  connStr.split(';').forEach((part) => {
    const i = part.indexOf('=');
    if (i > 0) parts[part.slice(0, i)] = part.slice(i + 1);
  });
  return parts;
}

function getConn() {
  const connStr = process.env.STORAGE_CONNECTION_STRING || process.env.AzureWebJobsStorage;
  if (!connStr || connStr === 'UseDevelopmentStorage=true') return null;
  return parseConn(connStr);
}

function sign(key, stringToSign) {
  return crypto.createHmac('sha256', Buffer.from(key, 'base64'))
    .update(stringToSign, 'utf8')
    .digest('base64');
}

function buildAuth(method, account, key, path, headers, contentLength) {
  const xmsHeaders = Object.entries(headers)
    .filter(([k]) => k.toLowerCase().startsWith('x-ms-'))
    .sort(([a], [b]) => a.toLowerCase().localeCompare(b.toLowerCase()));

  const canonicalHeaders = xmsHeaders.map(([k, v]) => `${k.toLowerCase()}:${v}`).join('\n');
  const stringToSign = [
    method, '', '', contentLength,
    headers['Content-Type'] || '', headers['Content-Encoding'] || '',
    '', '', '', '', '', '', '',
    canonicalHeaders,
    path,
  ].join('\n');

  return `SharedKey ${account}:${sign(key, stringToSign)}`;
}

async function readBlob(name, fallback) {
  const conn = getConn();
  if (!conn) return fallback;
  const container = process.env.STORAGE_CONTAINER || 'sweetheaven';
  const url = `https://${conn.AccountName}.blob.core.windows.net/${container}/${name}`;
  try {
    const res = await fetch(url);
    if (res.ok) return res.json();
  } catch { /* fallback */ }
  return fallback;
}

async function writeBlob(name, data, contentType = 'application/json') {
  const conn = getConn();
  if (!conn) throw new Error('Storage not configured');
  const container = process.env.STORAGE_CONTAINER || 'sweetheaven';
  const path = `/${conn.AccountName}/${container}/${name}`;
  const url = `https://${conn.AccountName}.blob.core.windows.net/${container}/${name}`;
  const content = typeof data === 'string' ? data : JSON.stringify(data, null, 2);
  const date = new Date().toUTCString();
  const len = Buffer.byteLength(content);
  const headers = {
    'x-ms-blob-type': 'BlockBlob',
    'x-ms-date': date,
    'x-ms-version': '2020-10-02',
    'Content-Type': contentType,
    'Content-Length': String(len),
  };
  headers.Authorization = buildAuth('PUT', conn.AccountName, conn.AccountKey, path, headers, len);
  const res = await fetch(url, { method: 'PUT', headers, body: content });
  if (!res.ok) throw new Error(`Blob write failed (${res.status}): ${await res.text()}`);
}

async function writeBinaryBlob(name, buffer, contentType) {
  const conn = getConn();
  if (!conn) throw new Error('Storage not configured');
  const container = process.env.STORAGE_CONTAINER || 'sweetheaven';
  const path = `/${conn.AccountName}/${container}/${name}`;
  const url = `https://${conn.AccountName}.blob.core.windows.net/${container}/${name}`;
  const date = new Date().toUTCString();
  const headers = {
    'x-ms-blob-type': 'BlockBlob',
    'x-ms-date': date,
    'x-ms-version': '2020-10-02',
    'Content-Type': contentType,
    'Content-Length': String(buffer.length),
  };
  headers.Authorization = buildAuth('PUT', conn.AccountName, conn.AccountKey, path, headers, buffer.length);
  const res = await fetch(url, { method: 'PUT', headers, body: buffer });
  if (!res.ok) throw new Error(`Blob upload failed (${res.status})`);
  return url;
}

function checkAdmin(req) {
  const h = req.headers || {};
  const provided = String(h['x-admin-password'] || h['X-Admin-Password'] || req.body?.password || '');
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return false;
  const providedBuffer = Buffer.from(provided);
  const expectedBuffer = Buffer.from(expected);
  return providedBuffer.length === expectedBuffer.length &&
    crypto.timingSafeEqual(providedBuffer, expectedBuffer);
}

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Password, X-File-Name',
  };
}

function jsonResponse(status, body) {
  return { status, headers: { 'Content-Type': 'application/json', ...corsHeaders() }, body: JSON.stringify(body) };
}

let memoryConfig = null;
let memoryEnquiries = [];

async function getConfig() {
  const conn = getConn();
  if (conn) return readBlob(CONFIG_BLOB, defaultConfig);
  if (!memoryConfig) memoryConfig = JSON.parse(JSON.stringify(defaultConfig));
  return memoryConfig;
}

async function saveConfigData(config) {
  const conn = getConn();
  if (conn) await writeBlob(CONFIG_BLOB, config);
  else memoryConfig = config;
}

async function getEnquiries() {
  const conn = getConn();
  if (conn) return readBlob(ENQUIRIES_BLOB, []);
  return memoryEnquiries;
}

async function saveEnquiries(enquiries) {
  const conn = getConn();
  if (conn) await writeBlob(ENQUIRIES_BLOB, enquiries);
  else memoryEnquiries = enquiries;
}

module.exports = {
  getConfig, saveConfigData, getEnquiries, saveEnquiries,
  checkAdmin, corsHeaders, jsonResponse, writeBinaryBlob,
};
