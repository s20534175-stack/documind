const express = require('express');
const router = express.Router({ mergeParams: true });
const multer = require('multer');
const { uploadDocument, getDocuments, deleteDocument } = require('../controllers/documentController');
const authMiddleware = require('../middleware/auth');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['application/pdf', 'text/plain'];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error('Only PDF and TXT files allowed'));
  },
});

router.use(authMiddleware);

router.get('/', getDocuments);
router.post('/upload', upload.single('file'), uploadDocument);
router.delete('/:documentId', deleteDocument);

module.exports = router;