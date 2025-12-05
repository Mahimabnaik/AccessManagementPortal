const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const ctrl = require('../controllers/request.controller');


router.post('/', auth, ctrl.createRequest);
router.get('/mine', auth, ctrl.getMyRequests);
router.get('/:id', auth, ctrl.getRequestById);
router.get('/:id/audit', auth, ctrl.getAuditLogs);


router.get('/admin/all', auth, ctrl.adminListRequests);
router.post('/admin/:id/approve', auth, ctrl.adminApprove);
router.post('/admin/:id/reject', auth, ctrl.adminReject);

module.exports = router;