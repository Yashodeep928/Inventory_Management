
const Sale = require('../models/saleModel');
const Purchase = require('../models/purchaseModel');

// Create a new sale and update inventory
const createSale = async (req, res) => {
    console.log('createSale controller called');
    try {
        const { customerName, products, totalAmount } = req.body;
        
        console.log('Sale data received:', { customerName, products, totalAmount });
        
        // Validate that the products exist and have sufficient quantity
        for (const item of products) {
            const product = await Purchase.findById(item.productId);
            
            if (!product) {
                return res.status(404).json({ 
                    success: false,
                    message: `Product with ID ${item.productId} not found` 
                });
            }
            
            if (product.quantity < item.quantity) {
                return res.status(400).json({ 
                    success: false,
                    message: `Insufficient quantity for ${product.name}. Available: ${product.quantity}, Requested: ${item.quantity}` 
                });
            }
        }
        
        // Create new sale record
        const newSale = new Sale({
            customerName,
            products,
            totalAmount,
            saleDate: new Date()
        });
        
        // Save sale record
        const savedSale = await newSale.save();
        console.log('Sale record created:', savedSale);
        
        // Update inventory quantities
        for (const item of products) {
            await Purchase.findByIdAndUpdate(
                item.productId,
                { $inc: { quantity: -item.quantity } } // Decrement quantity
            );
            console.log(`Updated inventory for product ${item.productId}, reduced by ${item.quantity}`);
        }
        
        res.status(200).json({ 
            success: true, 
            sale: savedSale 
        });
    } catch (error) {
        console.error('Error creating sale:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error creating sale' 
        });
    }
};

// Get all sales
const getAllSales = async (req, res) => {
    console.log('getAllSales controller called');
    try {
        const sales = await Sale.find().sort({ saleDate: -1 }); // Sort by date, newest first
        console.log(`Found ${sales.length} sales records`);
        
        res.status(200).json(sales);
    } catch (error) {
        console.error('Error fetching sales:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error fetching sales' 
        });
    }
};

// Get sale by ID
const getSaleById = async (req, res) => {
    console.log('getSaleById controller called');
    try {
        const sale = await Sale.findById(req.params.id);
        
        if (!sale) {
            return res.status(404).json({ 
                success: false, 
                message: 'Sale not found' 
            });
        }
        
        res.status(200).json(sale);
    } catch (error) {
        console.error('Error fetching sale:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error fetching sale' 
        });
    }
};

module.exports = {
    createSale,
    getAllSales,
    getSaleById
};
