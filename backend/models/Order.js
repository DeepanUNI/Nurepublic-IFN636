const mongoose = require('mongoose');

// delivery details entered on the checkout page
const customerSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, required: true, trim: true },
    street: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
    postcode: { type: String, required: true, trim: true },
  },
  { _id: false } // stored inside the order, doesn't need its own id
);

const orderSchema = new mongoose.Schema(
    {
        user: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
        product: {type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true},
        pricePaid: {type: Number, required: true},
        purchasedAt: {type: Date, default: Date.now},
        // same value on every order created in one checkout, so admin can group them
        checkoutId: { type: mongoose.Schema.Types.ObjectId },
        // optional: "Buy now" orders don't have delivery details
        customer: { type: customerSchema },
    },
    {timestamps: true}

);
module.exports= mongoose.model('order', orderSchema);
