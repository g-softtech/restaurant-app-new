// backend/seed-menu.js - Run this once to add sample data
const mongoose = require('mongoose');
const MenuItem = require('./src/models/MenuItem');
require('dotenv').config();

const sampleMenuItems = [
  {
    name: "Margherita Pizza",
    description: "Classic pizza with fresh tomatoes, mozzarella cheese, and basil",
    price: 18.99,
    category: "main-course",
    image: "https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?w=400",
    ingredients: ["tomato sauce", "mozzarella", "fresh basil", "olive oil"],
    allergens: ["dairy"],
    preparationTime: 15,
    isVegetarian: true,
    spiceLevel: "mild",
    tags: ["pizza", "italian", "popular"]
  },
  {
    name: "Chicken Caesar Salad",
    description: "Grilled chicken breast with romaine lettuce, parmesan, and caesar dressing",
    price: 14.99,
    category: "appetizer",
    image: "https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400",
    ingredients: ["grilled chicken", "romaine lettuce", "parmesan cheese", "croutons", "caesar dressing"],
    allergens: ["dairy", "eggs"],
    preparationTime: 10,
    isVegetarian: false,
    spiceLevel: "mild",
    tags: ["salad", "healthy", "protein"]
  },
  {
    name: "Chocolate Lava Cake",
    description: "Warm chocolate cake with molten center, served with vanilla ice cream",
    price: 8.99,
    category: "dessert",
    image: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=400",
    ingredients: ["dark chocolate", "butter", "eggs", "flour", "vanilla ice cream"],
    allergens: ["dairy", "eggs"],
    preparationTime: 20,
    isVegetarian: true,
    spiceLevel: "mild",
    tags: ["dessert", "chocolate", "warm"]
  },
  {
    name: "Fresh Orange Juice",
    description: "Freshly squeezed orange juice",
    price: 4.99,
    category: "beverages",
    image: "https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=400",
    ingredients: ["fresh oranges"],
    allergens: [],
    preparationTime: 5,
    isVegetarian: true,
    isVegan: true,
    spiceLevel: "mild",
    tags: ["juice", "fresh", "vitamin-c"]
  },
  {
    name: "Spicy Buffalo Wings",
    description: "Crispy chicken wings tossed in spicy buffalo sauce",
    price: 12.99,
    category: "appetizer",
    image: "https://images.unsplash.com/photo-1527477396000-e27163b481c2?w=400",
    ingredients: ["chicken wings", "buffalo sauce", "celery", "blue cheese dip"],
    allergens: ["dairy"],
    preparationTime: 25,
    isVegetarian: false,
    spiceLevel: "hot",
    tags: ["wings", "spicy", "popular"]
  },
  {
    name: "Garlic Bread",
    description: "Toasted bread with garlic butter and herbs",
    price: 6.99,
    category: "sides",
    image: "https://images.unsplash.com/photo-1541745537411-b8046dc6d66c?w=400",
    ingredients: ["bread", "garlic", "butter", "parsley"],
    allergens: ["dairy", "gluten"],
    preparationTime: 8,
    isVegetarian: true,
    spiceLevel: "mild",
    tags: ["bread", "garlic", "side"]
  }
];

const seedMenu = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');

    // Clear existing menu items
    await MenuItem.deleteMany({});
    console.log('🗑️ Cleared existing menu items');

    // Insert sample data
    const insertedItems = await MenuItem.insertMany(sampleMenuItems);
    console.log(`✅ Added ${insertedItems.length} menu items:`);
    
    insertedItems.forEach(item => {
      console.log(`   - ${item.name} (${item.category}) - $${item.price}`);
    });

    console.log('\n🎉 Sample menu data added successfully!');
    console.log('🔗 Test your API at: http://localhost:5000/api/menu');
    
  } catch (error) {
    console.error('❌ Error seeding menu data:', error);
  } finally {
    mongoose.connection.close();
    console.log('📴 Database connection closed');
  }
};

// Run the seed function
seedMenu();