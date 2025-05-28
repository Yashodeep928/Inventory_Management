const mongoose = require('mongoose');

const saleSchema = new mongoose.Schema({
  customerName: {
    type: String
  },
  products: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
      },
      name: String,
      quantity: Number,
      price: Number // price at time of sale
    }
  ],
  totalAmount: {
    type: Number,
    required: true
  },
  saleDate: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Sale', saleSchema);
