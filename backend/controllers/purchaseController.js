const Purchase = require('../models/purchaseModel');

// Function to get all purchases
const getPurchases = async (req, res) => {
    console.log('getPurchases controller called');
    try {
        console.log('Attempting to fetch purchases');
        const purchases = await Purchase.find({ active: { $ne: false } });
        console.log('Fetched purchases:', purchases);
        res.status(200).json(purchases);
    } catch (error) {
        console.error('Error fetching purchases:', error);
        res.status(500).json({ message: 'Server error fetching purchases' });
    }
}

// Function to get all purchases (including inactive)
const getAllPurchases = async (req, res) => {
    console.log('getAllPurchases controller called');
    try {
        console.log('Attempting to fetch all purchases');
        const purchases = await Purchase.find();
        console.log('Fetched all purchases:', purchases);
        res.status(200).json(purchases);
    } catch (error) {
        console.error('Error fetching all purchases:', error);
        res.status(500).json({ message: 'Server error fetching all purchases' });
    }
}

// Function to create a add new purchase
const createPurchase = async (req, res) => {
    try {
        const { name, category, price, quantity } = req.body;
        
        // Create new purchase
        const newPurchase = new Purchase({
            name,
            category,
            price,
            quantity,
            active: true
        });
        
        // Save to database
        const savedPurchase = await newPurchase.save();
        console.log('New purchase added:', savedPurchase);
        
        // Send response
        res.status(201).json(savedPurchase);
    } catch (error) {
        console.error('Error adding data:', error);
        res.status(500).json({ message: 'Server error adding purchase' });
    }
}

// Function to update a purchase
const updatePurchase = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, category, price, quantity } = req.body;
        
        const updatedPurchase = await Purchase.findByIdAndUpdate(
            id,
            {
                name,
                category,
                price,
                quantity
            },
            { new: true }
        );
        
        if (!updatedPurchase) {
            return res.status(404).json({ message: 'Purchase not found' });
        }
        
        console.log('Updated purchase:', updatedPurchase);
        res.status(200).json(updatedPurchase);
    } catch (error) {
        console.error('Error updating data:', error);
        res.status(500).json({ message: 'Server error updating purchase' });
    }
}

// Function to deactivate a purchase (soft delete)
const deactivatePurchase = async (req, res) => {
    try {
        const { id } = req.params;
        
        const purchase = await Purchase.findByIdAndUpdate(
            id,
            { active: false },
            { new: true }
        );
        
        if (!purchase) {
            return res.status(404).json({ message: 'Purchase not found' });
        }
        
        console.log('Deactivated purchase:', purchase);
        res.status(200).json({ message: 'Purchase deactivated successfully', id });
    } catch (error) {
        console.error('Error deactivating purchase:', error);
        res.status(500).json({ message: 'Server error deactivating purchase' });
    }
}

module.exports = { 
    getPurchases, 
    getAllPurchases,
    createPurchase, 
    updatePurchase, 
    deactivatePurchase 
};