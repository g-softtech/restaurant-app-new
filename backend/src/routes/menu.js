// backend/routes/menu.js
const express = require('express');
const router = express.Router();
const MenuItem = require('../models/MenuItem'); // Your MongoDB model

// GET /api/menu - Get all menu items
router.get('/', async (req, res) => {
  try {
    const menuItems = await MenuItem.find({ isAvailable: true })
      .sort({ category: 1, name: 1 });
    
    res.json({
      success: true,
      data: menuItems,
      count: menuItems.length
    });
  } catch (error) {
    console.error('Error fetching menu items:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch menu items',
      error: error.message
    });
  }
});

// GET /api/menu/category/:category - Get items by category
router.get('/category/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const menuItems = await MenuItem.find({ 
      category: category,
      isAvailable: true 
    }).sort({ name: 1 });
    
    res.json({
      success: true,
      data: menuItems,
      count: menuItems.length
    });
  } catch (error) {
    console.error('Error fetching menu by category:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch menu items by category',
      error: error.message
    });
  }
});

// GET /api/menu/:id - Get single menu item
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const menuItem = await MenuItem.findById(id);
    
    if (!menuItem) {
      return res.status(404).json({
        success: false,
        message: 'Menu item not found'
      });
    }
    
    res.json({
      success: true,
      data: menuItem
    });
  } catch (error) {
    console.error('Error fetching menu item:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch menu item',
      error: error.message
    });
  }
});

// POST /api/menu - Add new menu item (Admin only - Phase 5)
router.post('/', async (req, res) => {
  try {
    const { 
      name, 
      description, 
      price, 
      originalPrice,
      category, 
      image, 
      ingredients = [],
      allergens = [],
      nutritionalInfo = {},
      preparationTime = 20,
      isAvailable = true,
      isVegetarian = false,
      isVegan = false,
      spiceLevel = 'mild',
      tags = []
    } = req.body;
    
    const newMenuItem = new MenuItem({
      name,
      description,
      price,
      originalPrice,
      category,
      image,
      ingredients,
      allergens,
      nutritionalInfo,
      preparationTime,
      isAvailable,
      isVegetarian,
      isVegan,
      spiceLevel,
      tags
    });
    
    const savedMenuItem = await newMenuItem.save();
    
    res.status(201).json({
      success: true,
      data: savedMenuItem,
      message: 'Menu item created successfully'
    });
  } catch (error) {
    console.error('Error creating menu item:', error);
    res.status(400).json({
      success: false,
      message: 'Failed to create menu item',
      error: error.message
    });
  }
});

// PUT /api/menu/:id - Update menu item (Admin only - Phase 5)
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const updatedMenuItem = await MenuItem.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!updatedMenuItem) {
      return res.status(404).json({
        success: false,
        message: 'Menu item not found'
      });
    }
    
    res.json({
      success: true,
      data: updatedMenuItem,
      message: 'Menu item updated successfully'
    });
  } catch (error) {
    console.error('Error updating menu item:', error);
    res.status(400).json({
      success: false,
      message: 'Failed to update menu item',
      error: error.message
    });
  }
});

// DELETE /api/menu/:id - Delete menu item (Admin only - Phase 5)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const deletedMenuItem = await MenuItem.findByIdAndDelete(id);
    
    if (!deletedMenuItem) {
      return res.status(404).json({
        success: false,
        message: 'Menu item not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Menu item deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting menu item:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete menu item',
      error: error.message
    });
  }
});

module.exports = router;