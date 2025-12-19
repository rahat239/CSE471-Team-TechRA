// backend/src/routes/admin.js
const express = require('express');
const router = express.Router();

const AuthVerification = require('../middlewares/AuthVerification');
const isAdmin = require('../middlewares/isAdmin');
const Admin = require('../controllers/AdminController');

// auth first -> admin check
router.use(AuthVerification, isAdmin);

// brands
router.get('/brands', Admin.listBrands);
router.post('/brands', Admin.createBrand);
router.patch('/brands/:id', Admin.updateBrand);
router.delete('/brands/:id', Admin.deleteBrand);

// categories
router.get('/categories', Admin.listCategories);
router.post('/categories', Admin.createCategory);
router.patch('/categories/:id', Admin.updateCategory);
router.delete('/categories/:id', Admin.deleteCategory);

// products (list & visibility)
router.get('/products', Admin.listProducts);
router.patch('/products/:id/visibility', Admin.setProductVisibility);

// sliders
router.get('/sliders', Admin.listSliders);
router.post('/sliders', Admin.createSlider);
router.patch('/sliders/:id', Admin.updateSlider);
router.delete('/sliders/:id', Admin.deleteSlider);

// homepage Features
router.get('/features', Admin.listFeatures);
router.post('/features', Admin.createFeature);
router.patch('/features/:id', Admin.updateFeature);
router.delete('/features/:id', Admin.deleteFeature);

module.exports = router; // <-- FIXED
