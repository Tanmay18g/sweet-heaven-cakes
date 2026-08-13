const s = require('../shared/storage');

module.exports = async function (context, req) {
  if (req.method === 'OPTIONS') {
    context.res = { status: 204, headers: s.corsHeaders() };
    return;
  }
  if (req.method === 'GET') {
    context.res = s.jsonResponse(200, await s.getConfig());
    return;
  }
  if (!s.checkAdmin(req)) {
    context.res = s.jsonResponse(401, { error: 'Invalid admin password' });
    return;
  }
  try {
    await s.saveConfigData(req.body);
    context.res = s.jsonResponse(200, req.body);
  } catch (err) {
    context.res = s.jsonResponse(500, { error: err.message });
  }
};
