const mongoose = require('mongoose');


const generatePurchaseId = () =>{
    // Generate a random purchase ID 5
    const random = Math.floor(Math.random() * 1000000);   
    return `PUR-${random}`;     
} 

const purchaseSchema = new mongoose.Schema({

    purchase_id: {
        type: String,
        unique: true,
        default: generatePurchaseId
      },
      name: {
        type: String,
        required: true,
        trim: true
      },
      category: {
        type: String,
        required: true,
        trim: true
      },
      price: {
        type: Number,
        required: true,
        min: 0
      },
      quantity: {
        type: Number,
        required: true,
        min: 0
      },
      active: {
        type: Boolean,
        default: true
      }
},
{
    timestamps: true,
  });


const Purchase = mongoose.model('Purchase', purchaseSchema);

module.exports = Purchase;