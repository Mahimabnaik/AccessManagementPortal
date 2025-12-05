const { pool } = require('../db');

async function createRequest(req, res) {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const { application, environment, group_role, project, notes } = req.body;
    const insertQ = `
      INSERT INTO requests (requester_id, application, environment, group_role, project, notes)
      VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`;
    const { rows } = await pool.query(insertQ, [userId, application, environment, group_role, project, notes]);
    const request = rows[0];

    await pool.query(
      `INSERT INTO audit_logs (request_id, action, performed_by, details) VALUES ($1,$2,$3,$4)`,
      [request.id, 'CREATE', userId, JSON.stringify({ request })]
    );

    return res.status(201).json(request);
  } catch (err) {
    console.error('createRequest error', err);
    return res.status(500).json({ error: 'Server error' });
  }
}

async function getMyRequests(req, res) {
  try {
    const userId = req.user?.id;
    const { rows } = await pool.query(`SELECT * FROM requests WHERE requester_id=$1 ORDER BY created_at DESC`, [userId]);
    return res.json(rows);
  } catch (err) {
    console.error('getMyRequests', err);
    return res.status(500).json({ error: 'Server error' });
  }
}

async function getRequestById(req, res) {
  try {
    const { id } = req.params;
    const { rows } = await pool.query(
      `SELECT r.*, u.email as requester_email FROM requests r LEFT JOIN users u ON u.id=r.requester_id WHERE r.id=$1`,
      [id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Not found' });
    const request = rows[0];
    if (req.user.role !== 'admin' && request.requester_id !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    return res.json(request);
  } catch (err) {
    console.error('getRequestById', err);
    return res.status(500).json({ error: 'Server error' });
  }
}

async function getAuditLogs(req, res) {
  try {
    const { id } = req.params;
    const { rows: reqRows } = await pool.query('SELECT * FROM requests WHERE id=$1', [id]);
    if (!reqRows.length) return res.status(404).json({ error: 'Not found' });
    const request = reqRows[0];
    if (req.user.role !== 'admin' && request.requester_id !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    const { rows } = await pool.query(`SELECT * FROM audit_logs WHERE request_id=$1 ORDER BY created_at DESC`, [id]);
    return res.json(rows);
  } catch (err) {
    console.error('getAuditLogs', err);
    return res.status(500).json({ error: 'Server error' });
  }
}

async function adminListRequests(req, res) {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
    const { rows } = await pool.query(`SELECT r.*, u.email as requester_email FROM requests r LEFT JOIN users u ON u.id=r.requester_id ORDER BY r.created_at DESC`);
    return res.json(rows);
  } catch (err) {
    console.error('adminListRequests', err);
    return res.status(500).json({ error: 'Server error' });
  }
}

async function adminApprove(req, res) {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
    const { id } = req.params;
    const { notes } = req.body || '';
    const { rows } = await pool.query(`UPDATE requests SET status='APPROVED', notes = COALESCE(notes || '\\n','') || $1, updated_at=now() WHERE id=$2 RETURNING *`, [notes, id]);
    if (!rows.length) return res.status(404).json({ error: 'Not found' });
    await pool.query('INSERT INTO audit_logs (request_id, action, performed_by, details) VALUES ($1,$2,$3,$4)', [id, 'APPROVE', req.user.id, JSON.stringify({ notes })]);
    return res.json(rows[0]);
  } catch (err) {
    console.error('adminApprove', err);
    return res.status(500).json({ error: 'Server error' });
  }
}

async function adminReject(req, res) {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
    const { id } = req.params;
    const { notes } = req.body || '';
    const { rows } = await pool.query(`UPDATE requests SET status='REJECTED', notes = COALESCE(notes || '\\n','') || $1, updated_at=now() WHERE id=$2 RETURNING *`, [notes, id]);
    if (!rows.length) return res.status(404).json({ error: 'Not found' });
    await pool.query('INSERT INTO audit_logs (request_id, action, performed_by, details) VALUES ($1,$2,$3,$4)', [id, 'REJECT', req.user.id, JSON.stringify({ notes })]);
    return res.json(rows[0]);
  } catch (err) {
    console.error('adminReject', err);
    return res.status(500).json({ error: 'Server error' });
  }
}

module.exports = {
  createRequest,
  getMyRequests,
  getRequestById,
  getAuditLogs,
  adminListRequests,
  adminApprove,
  adminReject,
};