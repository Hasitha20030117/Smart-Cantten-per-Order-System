// Frontend Integration Example - Menu System

// ============ 1. API Service (apiService.js or similar) ============

// Get menu for a canteen
export const getMenuByCanteen = async (canteenName) => {
  try {
    const response = await axios.get(`/api/menu/canteen/${canteenName}`);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching menu:', error);
    throw error;
  }
};

// Get item by reference number
export const getMenuItemByRef = async (refNumber) => {
  try {
    const response = await axios.get(`/api/menu/ref/${refNumber}`);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching menu item:', error);
    throw error;
  }
};

// Add new menu item (Admin)
export const addMenuItem = async (itemData, token) => {
  try {
    const response = await axios.post('/api/menu', itemData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data.data;
  } catch (error) {
    console.error('Error adding menu item:', error);
    throw error;
  }
};

// Get all menu items (Admin)
export const getAllMenuItems = async (token, filters = {}) => {
  try {
    const params = new URLSearchParams(filters).toString();
    const response = await axios.get(`/api/menu?${params}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data.data;
  } catch (error) {
    console.error('Error fetching all menu items:', error);
    throw error;
  }
};

// Update menu item (Admin)
export const updateMenuItem = async (itemId, updates, token) => {
  try {
    const response = await axios.put(`/api/menu/${itemId}`, updates, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data.data;
  } catch (error) {
    console.error('Error updating menu item:', error);
    throw error;
  }
};

// Delete menu item (Admin)
export const deleteMenuItem = async (itemId, token) => {
  try {
    await axios.delete(`/api/menu/${itemId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
  } catch (error) {
    console.error('Error deleting menu item:', error);
    throw error;
  }
};

// Toggle availability (Admin)
export const toggleMenuItemAvailability = async (itemId, token) => {
  try {
    const response = await axios.patch(`/api/menu/${itemId}/toggle-availability`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data.data;
  } catch (error) {
    console.error('Error toggling availability:', error);
    throw error;
  }
};

// Get stats (Admin)
export const getMenuStatistics = async (token, canteen = null) => {
  try {
    const params = canteen ? `?canteen=${canteen}` : '';
    const response = await axios.get(`/api/menu/stats/overview${params}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data.data;
  } catch (error) {
    console.error('Error fetching stats:', error);
    throw error;
  }
};

// ============ 2. React Component - Display Menu ============

import React, { useState, useEffect } from 'react';
import { getMenuByCanteen } from './api/menuService';

export const CanteenMenuDisplay = ({ canteenName }) => {
  const [menu, setMenu] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, main, vegetarian, etc.

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const items = await getMenuByCanteen(canteenName);
        setMenu(items);
      } catch (error) {
        console.error('Failed to load menu');
      } finally {
        setLoading(false);
      }
    };

    fetchMenu();
  }, [canteenName]);

  const filteredMenu = filter === 'all' 
    ? menu 
    : menu.filter(item => item.category === filter);

  if (loading) return <div>Loading menu...</div>;

  return (
    <div className="menu-container">
      <h2>{canteenName} Menu</h2>

      {/* Category Filter */}
      <div className="category-filter">
        {['all', 'main', 'vegetarian', 'vegan', 'beverage', 'snack', 'dessert'].map(cat => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={filter === cat ? 'active' : ''}
          >
            {cat.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Menu Items Grid */}
      <div className="menu-grid">
        {filteredMenu.map(item => (
          <div key={item._id} className="menu-card">
            {item.image && <img src={item.image} alt={item.name} />}
            
            <div className="card-content">
              <h3>{item.name}</h3>
              <p className="ref-number">Ref: {item.refNumber}</p>
              <p className="description">{item.description}</p>
              
              <div className="item-details">
                <span className="price">₹{item.price}</span>
                <span className="prep-time">{item.preparationTime} min</span>
              </div>

              {item.dietary.length > 0 && (
                <div className="dietary-tags">
                  {item.dietary.map(tag => (
                    <span key={tag} className="tag">{tag}</span>
                  ))}
                </div>
              )}

              <div className="footer">
                <span className="spicy">{item.spicyLevel}</span>
                {!item.isAvailable && <span className="unavailable">OUT OF STOCK</span>}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ============ 3. React Component - Admin Menu Manager ============

import React, { useState, useEffect } from 'react';
import { getAllMenuItems, addMenuItem, updateMenuItem, deleteMenuItem, toggleMenuItemAvailability } from './api/menuService';

export const AdminMenuManager = ({ token }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    canteen: 'Main Canteen',
    name: '',
    description: '',
    category: 'main',
    price: '',
    preparationTime: 15,
    spicyLevel: 'none',
    dietary: [],
    quantity: 0
  });

  // Load all items
  useEffect(() => {
    const fetchItems = async () => {
      try {
        const data = await getAllMenuItems(token);
        setItems(data);
      } catch (error) {
        console.error('Failed to load items');
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, [token]);

  // Add new item
  const handleAddItem = async (e) => {
    e.preventDefault();
    try {
      const newItem = await addMenuItem(formData, token);
      setItems([...items, newItem]);
      setFormData({
        canteen: 'Main Canteen',
        name: '',
        description: '',
        category: 'main',
        price: '',
        preparationTime: 15,
        spicyLevel: 'none',
        dietary: [],
        quantity: 0
      });
      setShowForm(false);
    } catch (error) {
      console.error('Failed to add item');
    }
  };

  // Toggle availability
  const handleToggleAvailability = async (itemId) => {
    try {
      const updated = await toggleMenuItemAvailability(itemId, token);
      setItems(items.map(item => 
        item._id === itemId ? { ...item, isAvailable: updated.isAvailable } : item
      ));
    } catch (error) {
      console.error('Failed to toggle availability');
    }
  };

  // Delete item
  const handleDeleteItem = async (itemId) => {
    if (window.confirm('Are you sure?')) {
      try {
        await deleteMenuItem(itemId, token);
        setItems(items.filter(item => item._id !== itemId));
      } catch (error) {
        console.error('Failed to delete item');
      }
    }
  };

  return (
    <div className="admin-menu-manager">
      <h2>Menu Management</h2>

      <button onClick={() => setShowForm(!showForm)} className="btn-add">
        {showForm ? 'Cancel' : 'Add New Item'}
      </button>

      {/* Add Item Form */}
      {showForm && (
        <form onSubmit={handleAddItem} className="menu-form">
          <div className="form-group">
            <label>Canteen</label>
            <select
              value={formData.canteen}
              onChange={(e) => setFormData({...formData, canteen: e.target.value})}
            >
              <option>Main Canteen</option>
              <option>Juice Bar</option>
              <option>New canteen</option>
              <option>Anohana canteen</option>
            </select>
          </div>

          <div className="form-group">
            <label>Item Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              required
            />
          </div>

          <div className="form-group">
            <label>Category</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({...formData, category: e.target.value})}
            >
              <option>main</option>
              <option>vegetarian</option>
              <option>vegan</option>
              <option>beverage</option>
              <option>snack</option>
              <option>dessert</option>
            </select>
          </div>

          <div className="form-group">
            <label>Price</label>
            <input
              type="number"
              value={formData.price}
              onChange={(e) => setFormData({...formData, price: e.target.value})}
              required
            />
          </div>

          <div className="form-group">
            <label>Prep Time (minutes)</label>
            <input
              type="number"
              value={formData.preparationTime}
              onChange={(e) => setFormData({...formData, preparationTime: parseInt(e.target.value)})}
            />
          </div>

          <button type="submit" className="btn-submit">Add Item</button>
        </form>
      )}

      {/* Items List */}
      <div className="items-table">
        <table>
          <thead>
            <tr>
              <th>Ref #</th>
              <th>Name</th>
              <th>Canteen</th>
              <th>Category</th>
              <th>Price</th>
              <th>Available</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map(item => (
              <tr key={item._id}>
                <td>{item.refNumber}</td>
                <td>{item.name}</td>
                <td>{item.canteen}</td>
                <td>{item.category}</td>
                <td>₹{item.price}</td>
                <td>
                  <button
                    className={`toggle-btn ${item.isAvailable ? 'available' : 'unavailable'}`}
                    onClick={() => handleToggleAvailability(item._id)}
                  >
                    {item.isAvailable ? 'Available' : 'Out of Stock'}
                  </button>
                </td>
                <td>
                  <button onClick={() => handleDeleteItem(item._id)} className="btn-delete">
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
