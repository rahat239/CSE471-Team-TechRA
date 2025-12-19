// controllers/ProductController.js

const {
    ListByFilterService,
    CreateReviewService,
    BrandListService,
    CategoryListService,
    SliderListService,
    ListByCategoryService,
    ListByBrandService,
    ListByRemarkService,
    ListBySimilarService,
    ListByKeywordService,
    DetailsService,
    ReviewListService,
} = require('../services/ProductServices');
const ProductModel = require('../models/ProductModel');

// ---------- Public: Lists ----------
exports.ProductBrandList = async (_req, res) => {
    try {
        const result = await BrandListService();
        return res.status(200).json(result);
    } catch (error) {
        return res.status(500).json({ status: 'fail', message: 'Error fetching brand list', error });
    }
};

exports.ProductCategoryList = async (_req, res) => {
    try {
        const result = await CategoryListService();
        return res.status(200).json(result);
    } catch (error) {
        return res.status(500).json({ status: 'fail', message: 'Error fetching category list', error });
    }
};

exports.ProductSliderList = async (_req, res) => {
    try {
        const result = await SliderListService();
        return res.status(200).json(result);
    } catch (error) {
        return res.status(500).json({ status: 'fail', message: 'Error fetching sliders', error });
    }
};

exports.ProductListByBrand = async (req, res) => {
    try {
        const result = await ListByBrandService(req);
        return res.status(200).json(result);
    } catch (error) {
        return res.status(500).json({ status: 'fail', message: 'Error fetching products by brand', error });
    }
};

exports.ProductListByCategory = async (req, res) => {
    try {
        const result = await ListByCategoryService(req);
        return res.status(200).json(result);
    } catch (error) {
        return res.status(500).json({ status: 'fail', message: 'Error fetching products by category', error });
    }
};

exports.ProductListBySimilar = async (req, res) => {
    try {
        const result = await ListBySimilarService(req);
        return res.status(200).json(result);
    } catch (error) {
        return res.status(500).json({ status: 'fail', message: 'Error fetching similar products', error });
    }
};

exports.ProductListByKeyword = async (req, res) => {
    try {
        const result = await ListByKeywordService(req);
        return res.status(200).json(result);
    } catch (error) {
        return res.status(500).json({ status: 'fail', message: 'Error fetching products by keyword', error });
    }
};

exports.ProductListByRemark = async (req, res) => {
    try {
        const result = await ListByRemarkService(req);
        return res.status(200).json(result);
    } catch (error) {
        return res.status(500).json({ status: 'fail', message: 'Error fetching products by remark', error });
    }
};

exports.ProductListByFilter = async (req, res) => {
    try {
        const result = await ListByFilterService(req);
        return res.status(200).json(result);
    } catch (error) {
        return res.status(500).json({ status: 'fail', message: 'Error fetching filtered products', error });
    }
};

// ---------- Public: Details & Reviews ----------
exports.ProductDetails = async (req, res) => {
    try {
        const result = await DetailsService(req);
        return res.status(200).json(result);
    } catch (error) {
        return res.status(500).json({ status: 'fail', message: 'Error fetching product details', error });
    }
};

exports.ProductReviewList = async (req, res) => {
    try {
        const result = await ReviewListService(req);
        return res.status(200).json(result);
    } catch (error) {
        return res.status(500).json({ status: 'fail', message: 'Error fetching product reviews', error });
    }
};

exports.CreateReview = async (req, res) => {
    try {
        const result = await CreateReviewService(req);
        return res.status(200).json(result);
    } catch (error) {
        return res.status(500).json({ status: 'fail', message: 'Error creating product review', error });
    }
};

// ---------- Admin helpers (no visible filter) ----------
exports.listProducts = async (_req, res) => {
    try {
        const products = await ProductModel.find(
            {},
            { title: 1, visible: 1, brandID: 1, categoryID: 1, createdAt: 1 }
        ).sort({ createdAt: -1 });
        return res.status(200).json({ status: 'success', data: products });
    } catch (error) {
        return res.status(500).json({ status: 'fail', message: 'Error fetching products', error });
    }
};

exports.setProductVisibility = async (req, res) => {
    try {
        const { id } = req.params;
        const { visible } = req.body;
        const product = await ProductModel.findByIdAndUpdate(
            id,
            { visible: !!visible },
            { new: true }
        );
        if (!product) return res.status(404).json({ status: 'fail', message: 'Product not found' });
        return res.status(200).json({ status: 'success', data: { _id: product._id, visible: product.visible } });
    } catch (error) {
        return res.status(500).json({ status: 'fail', message: 'Error updating product visibility', error });
    }
};

// (Optional) raw all-products
exports.getAllProducts = async (_req, res) => {
    try {
        const products = await ProductModel.find();
        return res.status(200).json({ status: 'success', data: products });
    } catch (error) {
        return res.status(500).json({ status: 'fail', message: 'Error fetching products', error });
    }
};
