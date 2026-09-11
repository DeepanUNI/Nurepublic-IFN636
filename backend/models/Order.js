const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
    {
        user: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
        product: {type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true},
        pricePaid: {type: Number, required: true},
        purchasedAt: {type: Date, default: Date.now},


    },
    {timestamps: true}

);
module.exports= mongoose.model('order', orderSchema);
