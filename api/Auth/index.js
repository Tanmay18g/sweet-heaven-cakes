const s = require('../shared/storage');

module.exports = async function (context, req) {
  if (req.method === 'OPTIONS') {
    context.res = { status: 204, headers: s.corsHeaders() };
    return;
  }

  context.res = s.checkAdmin(req)
    ? s.jsonResponse(200, { authenticated: true })
    : s.jsonResponse(401, { error: 'Invalid admin password' });
};
