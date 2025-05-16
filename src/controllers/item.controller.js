const Item = require('../models/itemModel');

// GET: ดึงข้อมูลสินค้าทั้งหมด
exports.getAllItems = async (req, res, next) => {
    try {
        const items = await Item.find({});
        res.status(200).json(items);
    } catch (error) {
        next(error);
    }
};

// POST: เพิ่มสินค้าใหม่
exports.createItem = async (req, res, next) => {
    try {
        const newItem = new Item(req.body);
        const savedItem = await newItem.save();
        res.status(201).json(savedItem);
    } catch (error) {
        next(error);
    }
};
