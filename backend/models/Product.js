const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
    {
        title: { type: String, required: true, trim: true, maxlength: 100 },
        description: { type: String, required: true, trim: true, maxlength: 1000 },
        price: { type: Number, required: true, min: 0 }, 
        category: {type:String, required:true, trim:true},
        createdBy: {type: mongoose.Schema.Types.ObjectId, ref:'User', required: true},

    },
    {timestamps:true}
);

module.exports = mongoose.model('Product', productSchema);