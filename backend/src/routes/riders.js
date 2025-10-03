// routes/riders.js
const express = require('express');
const router = express.Router();
const Rider = require('../models/Rider');
const { adminAuth } = require('../middleware/auth');

// @route   GET /api/riders
// @desc    Get all riders
// @access  Private/Admin
router.get('/', adminAuth, async (req, res) => {
  try {
    const { status } = req.query;
    
    let query = { isActive: true };
    if (status) {
      query.status = status;
    }

    const riders = await Rider.find(query)
      .populate('user', 'name email')
      .populate('currentOrder', 'orderNumber status')
      .sort({ name: 1 });

    res.json({
      success: true,
      riders
    });
  } catch (error) {
    console.error('Get riders error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch riders',
      error: error.message
    });
  }
});

// @route   POST /api/riders
// @desc    Create new rider
// @access  Private/Admin
router.post('/', adminAuth, async (req, res) => {
  try {
    const { user, name, phone, vehicleType, vehicleNumber } = req.body;

    const rider = new Rider({
      user,
      name,
      phone,
      vehicleType,
      vehicleNumber
    });

    await rider.save();

    res.status(201).json({
      success: true,
      message: 'Rider created successfully',
      data: rider
    });
  } catch (error) {
    console.error('Create rider error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create rider',
      error: error.message
    });
  }
});

// @route   GET /api/riders/available
// @desc    Get available riders for assignment
// @access  Private/Admin
router.get('/available', adminAuth, async (req, res) => {
  try {
    const riders = await Rider.find({ 
      status: 'available',
      isActive: true 
    })
      .populate('user', 'name email')
      .sort({ totalDeliveries: -1 }); // Prioritize experienced riders

    res.json({
      success: true,
      riders
    });
  } catch (error) {
    console.error('Get available riders error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch available riders',
      error: error.message
    });
  }
});

// @route   PATCH /api/riders/:id/status
// @desc    Update rider status
// @access  Private/Admin
router.patch('/:id/status', adminAuth, async (req, res) => {
  try {
    const { status } = req.body;
    
    const rider = await Rider.findById(req.params.id);
    
    if (!rider) {
      return res.status(404).json({
        success: false,
        message: 'Rider not found'
      });
    }

    rider.status = status;
    await rider.save();

    res.json({
      success: true,
      message: 'Rider status updated successfully',
      data: rider
    });
  } catch (error) {
    console.error('Update rider status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update rider status',
      error: error.message
    });
  }
});

// @route   PATCH /api/riders/:id/location
// @desc    Update rider location (can be used by rider app)
// @access  Private
router.patch('/:id/location', async (req, res) => {
  try {
    const { longitude, latitude } = req.body;
    
    const rider = await Rider.findById(req.params.id);
    
    if (!rider) {
      return res.status(404).json({
        success: false,
        message: 'Rider not found'
      });
    }

    await rider.updateLocation(longitude, latitude);

    res.json({
      success: true,
      message: 'Location updated successfully',
      data: rider
    });
  } catch (error) {
    console.error('Update location error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update location',
      error: error.message
    });
  }
});

// @route   DELETE /api/riders/:id
// @desc    Deactivate rider
// @access  Private/Admin
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const rider = await Rider.findById(req.params.id);
    
    if (!rider) {
      return res.status(404).json({
        success: false,
        message: 'Rider not found'
      });
    }

    rider.isActive = false;
    rider.status = 'offline';
    await rider.save();

    res.json({
      success: true,
      message: 'Rider deactivated successfully'
    });
  } catch (error) {
    console.error('Delete rider error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to deactivate rider',
      error: error.message
    });
  }
});

module.exports = router;