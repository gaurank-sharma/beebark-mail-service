// GET /api/health — simple liveness probe
module.exports = (req, res) => {
  res.status(200).json({ status: 'ok', service: 'beebark-mail' });
};
