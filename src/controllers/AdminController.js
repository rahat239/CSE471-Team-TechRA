// AdminController.js
// Unified admin handlers: brands, categories, products (visibility), sliders, features, metrics

const BrandModel = require('../models/BrandModel');
const CategoryModel = require('../models/CategoryModel');
const ProductModel = require('../models/ProductModel');
const ProductSliderModel = require('../models/ProductSliderModel');
const FeaturesModel = require('../models/FeaturesModel');
const InvoiceModel = require('../models/InvoiceModel');
const InvoiceProductModel = require('../models/InvoiceProductModel');

// ------------------------- Brands -------------------------
exports.listBrands = async (_req, res) => {
    try {
        const data = await BrandModel.find().sort({ brandName: 1 });
        res.json({ status: 'success', data });
    } catch (e) {
        res.status(500).json({ status: 'fail', message: 'Error fetching brands' });
    }
};

exports.createBrand = async (req, res) => {
    try {
        const doc = await BrandModel.create(req.body);
        res.status(201).json({ status: 'success', data: doc });
    } catch (e) {
        res.status(500).json({ status: 'fail', message: 'Error creating brand' });
    }
};

exports.updateBrand = async (req, res) => {
    try {
        const doc = await BrandModel.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!doc) return res.status(404).json({ status: 'fail', message: 'Brand not found' });
        res.json({ status: 'success', data: doc });
    } catch (e) {
        res.status(500).json({ status: 'fail', message: 'Error updating brand' });
    }
};

exports.deleteBrand = async (req, res) => {
    try {
        const r = await BrandModel.findByIdAndDelete(req.params.id);
        if (!r) return res.status(404).json({ status: 'fail', message: 'Brand not found' });
        res.json({ status: 'success' });
    } catch (e) {
        res.status(500).json({ status: 'fail', message: 'Error deleting brand' });
    }
};

// ----------------------- Categories -----------------------
exports.listCategories = async (_req, res) => {
    try {
        const data = await CategoryModel.find().sort({ categoryName: 1 });
        res.json({ status: 'success', data });
    } catch (e) {
        res.status(500).json({ status: 'fail', message: 'Error fetching categories' });
    }
};

exports.createCategory = async (req, res) => {
    try {
        const doc = await CategoryModel.create(req.body);
        res.status(201).json({ status: 'success', data: doc });
    } catch (e) {
        res.status(500).json({ status: 'fail', message: 'Error creating category' });
    }
};

exports.updateCategory = async (req, res) => {
    try {
        const doc = await CategoryModel.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!doc) return res.status(404).json({ status: 'fail', message: 'Category not found' });
        res.json({ status: 'success', data: doc });
    } catch (e) {
        res.status(500).json({ status: 'fail', message: 'Error updating category' });
    }
};

exports.deleteCategory = async (req, res) => {
    try {
        const r = await CategoryModel.findByIdAndDelete(req.params.id);
        if (!r) return res.status(404).json({ status: 'fail', message: 'Category not found' });
        res.json({ status: 'success' });
    } catch (e) {
        res.status(500).json({ status: 'fail', message: 'Error deleting category' });
    }
};

// ------------------------ Products ------------------------
// For admin product visibility page
exports.listProducts = async (_req, res) => {
    try {
        const data = await ProductModel.find({}, { title: 1, visible: 1 }).sort({ createdAt: -1 });
        res.json({ status: 'success', data });
    } catch (e) {
        res.status(500).json({ status: 'fail', message: 'Error fetching products' });
    }
};

exports.setProductVisibility = async (req, res) => {
    try {
        const id = req.params.id;
        const { visible } = req.body;
        const doc = await ProductModel.findByIdAndUpdate(id, { visible: !!visible }, { new: true, upsert: false });
        if (!doc) return res.status(404).json({ status: 'fail', message: 'Product not found' });
        res.json({ status: 'success', data: { _id: doc._id, visible: doc.visible } });
    } catch (e) {
        res.status(500).json({ status: 'fail', message: 'Error updating product visibility' });
    }
};

// ------------------------- Sliders ------------------------
exports.listSliders = async (_req, res) => {
    try {
        const data = await ProductSliderModel.find().sort({ createdAt: -1 });
        res.json({ status: 'success', data });
    } catch (e) {
        res.status(500).json({ status: 'fail', message: 'Error fetching sliders' });
    }
};

exports.createSlider = async (req, res) => {
    try {
        const doc = await ProductSliderModel.create(req.body);
        res.status(201).json({ status: 'success', data: doc });
    } catch (e) {
        res.status(500).json({ status: 'fail', message: 'Error creating slider' });
    }
};

exports.updateSlider = async (req, res) => {
    try {
        const doc = await ProductSliderModel.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!doc) return res.status(404).json({ status: 'fail', message: 'Slider not found' });
        res.json({ status: 'success', data: doc });
    } catch (e) {
        res.status(500).json({ status: 'fail', message: 'Error updating slider' });
    }
};

exports.deleteSlider = async (req, res) => {
    try {
        const r = await ProductSliderModel.findByIdAndDelete(req.params.id);
        if (!r) return res.status(404).json({ status: 'fail', message: 'Slider not found' });
        res.json({ status: 'success' });
    } catch (e) {
        res.status(500).json({ status: 'fail', message: 'Error deleting slider' });
    }
};

// ------------------------- Features -----------------------
exports.listFeatures = async (_req, res) => {
    try {
        const data = await FeaturesModel.find().sort({ createdAt: -1 });
        res.json({ status: 'success', data });
    } catch (err) {
        res.status(500).json({ status: 'fail', message: 'Error fetching features' });
    }
};

exports.createFeature = async (req, res) => {
    try {
        const doc = await FeaturesModel.create(req.body);
        res.status(201).json({ status: 'success', data: doc });
    } catch (err) {
        res.status(500).json({ status: 'fail', message: 'Error creating feature' });
    }
};

exports.updateFeature = async (req, res) => {
    try {
        const doc = await FeaturesModel.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!doc) return res.status(404).json({ status: 'fail', message: 'Feature not found' });
        res.json({ status: 'success', data: doc });
    } catch (err) {
        res.status(500).json({ status: 'fail', message: 'Error updating feature' });
    }
};

exports.deleteFeature = async (req, res) => {
    try {
        const r = await FeaturesModel.findByIdAndDelete(req.params.id);
        if (!r) return res.status(404).json({ status: 'fail', message: 'Feature not found' });
        res.json({ status: 'success' });
    } catch (err) {
        res.status(500).json({ status: 'fail', message: 'Error deleting feature' });
    }
};

// -------------------------- Metrics -----------------------
exports.metrics = async (req, res) => {
    try {
        const ranges = { '7d': 7, '30d': 30, '90d': 90, '365d': 365 };
        const days = ranges[req.query.range] || 30;
        const now = new Date();
        const from = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

        const matchPaid = { payment_status: 'success', createdAt: { $gte: from, $lte: now } };

        // Revenue & orders
        const aggTotals = await InvoiceModel.aggregate([
            { $match: matchPaid },
            {
                $addFields: {
                    _payable: {
                        $toDouble: {
                            $replaceAll: {
                                input: { $ifNull: ['$payable', '0'] },
                                find: ',',
                                replacement: ''
                            }
                        }
                    }
                }
            },
            { $group: { _id: null, revenue: { $sum: '$_payable' }, orders: { $sum: 1 } } }
        ]);
        const totals = aggTotals[0] || { revenue: 0, orders: 0 };

        // Popular products
        const pop = await InvoiceProductModel.aggregate([
            { $match: { createdAt: { $gte: from, $lte: now } } },
            {
                $addFields: {
                    _qty: { $toDouble: { $ifNull: ['$qty', '0'] } },
                    _price: { $toDouble: { $ifNull: ['$price', '0'] } }
                }
            },
            { $group: { _id: '$productID', qty: { $sum: '$_qty' }, sales: { $sum: { $multiply: ['$_qty', '$_price'] } } } },
            { $sort: { qty: -1, sales: -1 } },
            { $limit: 10 },
            { $lookup: { from: 'products', localField: '_id', foreignField: '_id', as: 'p' } },
            { $unwind: '$p' },
            { $project: { _id: 0, productId: '$_id', name: '$p.title', qty: 1, sales: 1, visible: '$p.visible' } }
        ]);

        res.json({
            status: 'success',
            data: {
                rangeDays: days,
                revenue: totals.revenue || 0,
                orders: totals.orders || 0,
                popularProducts: pop
            }
        });
    } catch (e) {
        console.error('[metrics] error', e);
        res.status(500).json({ status: 'fail', message: 'Metrics error' });
    }
};
// AdminController.js


exports.listSliders = async (req, res) => {
    try {
        const sliders = await ProductSliderModel.find().sort({ createdAt: -1 });  // Get all sliders, sorted by creation date
        res.json({ status: 'success', data: sliders });
    } catch (e) {
        res.status(500).json({ status: 'fail', message: 'Error fetching sliders' });
    }
};

