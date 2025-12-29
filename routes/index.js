// routes/index.js
const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    // Render file 'dashboard.ejs' yang ada di folder views
    res.render('dashboard', { title: 'Sistem pendeteksi slot parkir' });
});

module.exports = router;

// halo ges