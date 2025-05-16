const mongoose = require('mongoose');

const itemSchema = mongoose.Schema({
    name: { type: String, required: true },
    internalID: { type: String },
    orderedQty: { type: Number, default: 0 },
    onHandQty: { type: Number, default: 0 },
    committedQty: { type: Number, default: 0 },
    inventoryUOMID: { type: String },
    itemCategory: { type: String },
    itemType: { type: String },
    isActive: { type: Boolean, default: true },
}, {
    timestamps: true,
});

module.exports = mongoose.model('Item', itemSchema);
