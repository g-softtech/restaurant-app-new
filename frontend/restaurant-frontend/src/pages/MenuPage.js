import React, { useState, useEffect } from 'react';

// MenuCard Component
const MenuCard = ({ item, onAddToCart }) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <img 
        src={item.image || 'https://via.placeholder.com/300x200?text=Food+Image'} 
        alt={item.name}
        className="w-full h-48 object-cover"
      />
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">{item.name}</h3>
        <p className="text-gray-600 text-sm mb-3">{item.description}</p>
        <div className="flex items-center justify-between">
          <span className="text-xl font-bold text-green-600">₦{item.price}</span>
          {item.available ? (
            <button
              onClick={() => onAddToCart && onAddToCart(item)}
              className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              Add to Cart
            </button>
          ) : (
            <span className="text-red-500 font-medium">Out of Stock</span>
          )}
        </div>
        <div className="mt-2">
          <span className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full">
            {item.category}
          </span>
        </div>
      </div>
    </div>
  );
};

// Sample menu data for demo (replace with API call)
const sampleMenuItems = [
  {
    _id: '1',
    name: "Margherita Pizza",
    description: "Classic pizza with fresh tomatoes, mozzarella, and basil",
    price: 2500,
    category: "Pizza",
    image: "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=300&h=200&fit=crop",
    available: true
  },
  {
    _id: '2',
    name: "Chicken Shawarma",
    description: "Tender chicken wrapped in pita with vegetables and garlic sauce",
    price: 1800,
    category: "Wraps",
    image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=300&h=200&fit=crop",
    available: true
  },
  {
    _id: '3',
    name: "Beef Burger",
    description: "Juicy beef patty with lettuce, tomato, and special sauce",
    price: 3200,
    category: "Burgers",
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=300&h=200&fit=crop",
    available: true
  },
  {
    _id: '4',
    name: "Jollof Rice",
    description: "Nigerian-style rice with chicken and plantain",
    price: 2200,
    category: "Local",
    image: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=300&h=200&fit=crop",
    available: true
  },
  {
    _id: '5',
    name: "Caesar Salad",
    description: "Fresh romaine lettuce with parmesan, croutons, and Caesar dressing",
    price: 1500,
    category: "Salads",
    image: "https://images.unsplash.com/photo-1546793665-c74683f339c1?w=300&h=200&fit=crop",
    available: true
  },
  {
    _id: '6',
    name: "Chocolate Cake",
    description: "Rich chocolate cake with creamy frosting",
    price: 1200,
    category: "Desserts",
    image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=300&h=200&fit=crop",
    available: true
  },
  {
    _id: '7',
    name: "Pepperoni Pizza",
    description: "Classic pepperoni pizza with mozzarella cheese",
    price: 2800,
    category: "Pizza",
    image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=300&h=200&fit=crop",
    available: true
  },
  {
    _id: '8',
    name: "Grilled Chicken",
    description: "Perfectly grilled chicken breast with herbs and spices",
    price: 2500,
    category: "Grilled",
    image: "https://images.unsplash.com/photo-1532550907401-a500c9a57435?w=300&h=200&fit=crop",
    available: true
  }
];

// Main Menu Page Component
const MenuPage = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchMenuItems();
  }, []);

  const fetchMenuItems = async () => {
    try {
      // Replace this with actual API call: const response = await axios.get('http://localhost:5000/api/menu');
      // For now using sample data
      setMenuItems(sampleMenuItems);
      
      // Extract unique categories
      const uniqueCategories = ['All', ...new Set(sampleMenuItems.map(item => item.category))];
      setCategories(uniqueCategories);
    } catch (error) {
      console.error('Error fetching menu items:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = menuItems.filter(item => {
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleAddToCart = (item) => {
    // For now, just show alert - we'll implement cart in Phase 2c
    alert(`Added ${item.name} to cart! (Cart functionality coming in Phase 2c)`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading menu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">Our Menu</h1>
        
        {/* Search Bar */}
        <div className="max-w-md mx-auto mb-8">
          <div className="relative">
            <input
              type="text"
              placeholder="Search dishes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 pl-10 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-6 py-2 rounded-full font-medium transition-colors ${
                selectedCategory === category
                  ? 'bg-orange-500 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-orange-100 shadow-sm'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Results Summary */}
        <div className="text-center mb-6">
          <p className="text-gray-600">
            Showing {filteredItems.length} item{filteredItems.length !== 1 ? 's' : ''}
            {selectedCategory !== 'All' && ` in ${selectedCategory}`}
            {searchTerm && ` matching "${searchTerm}"`}
          </p>
        </div>

        {/* Menu Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredItems.map(item => (
            <MenuCard key={item._id} item={item} onAddToCart={handleAddToCart} />
          ))}
        </div>

        {filteredItems.length === 0 && !loading && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🍽️</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No items found</h3>
            <p className="text-gray-600 text-lg">
              {searchTerm 
                ? `No items match "${searchTerm}". Try a different search term.`
                : `No items in ${selectedCategory} category.`
              }
            </p>
            {(searchTerm || selectedCategory !== 'All') && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('All');
                }}
                className="mt-4 bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
              >
                Show All Items
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MenuPage;