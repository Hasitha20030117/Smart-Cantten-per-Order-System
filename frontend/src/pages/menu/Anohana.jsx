import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Minus, Plus, ArrowLeft } from 'lucide-react';

const Anohana = () => {
  const [cart, setCart] = useState([]);

  const menuItems = [
    { id: 1, name: 'Veg Caesar Salad', price: 70, image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80" },
    { id: 2, name: 'Quinoa Bowl', price: 95, image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&q=80" },
    { id: 3, name: 'Grilled Paneer', price: 85, image: "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=400&q=80" },
    { id: 4, name: 'Fresh Green Salad', price: 55, image: "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&q=80" },
    { id: 5, name: 'Veggie Wrap', price: 65, image: "https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=400&q=80" },
    { id: 6, name: 'Fruit Platter', price: 75, image: "https://images.unsplash.com/photo-1490474418585-ba9bad8fd0ea?w=400&q=80" },
  ];

  const addToCart = (item) => {
    const existing = cart.find(c => c.id === item.id);
    if (existing) {
      setCart(cart.map(c => c.id === item.id ? {...c, quantity: c.quantity + 1} : c));
    } else {
      setCart([...cart, {...item, quantity: 1}]);
    }
  };

  const updateQuantity = (id, delta) => {
    setCart(cart.map(c => c.id === id ? {...c, quantity: Math.max(1, c.quantity + delta)} : c));
  };

  const getTotal = () => cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const placeOrder = async () => {
    const orderData = {
      customerName: 'Customer',
      canteen: 'Anohana Canteen',
      items: cart.map(item => ({ name: item.name, quantity: item.quantity, price: item.price })),
      totalAmount: getTotal(),
      timeSlot: 'Lunch',
      userId: 'USER_ID_FROM_AUTH'
    };

    try {
      const response = await fetch('http://localhost:5000/api/orders', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(orderData)
      });
      
      const result = await response.json();
      if (result.tokenNumber) {
        alert(`Order placed! Token #${result.tokenNumber}`);
        setCart([]);
      }
    } catch (error) {
      alert('Order failed');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-emerald-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <Link to="/" className="flex items-center gap-2 text-green-600 font-bold mb-8 hover:text-green-700 transition-colors">
          <ArrowLeft className="w-5 h-5" />
          Back to Home
        </Link>

        <div className="text-center mb-12">
          <h1 className="text-5xl font-black text-green-600 mb-4">🥗 Anohana Canteen</h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">Healthy salads, veggie bowls & fresh choices</p>
        </div>

        {/* Menu Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {menuItems.map(item => (
            <div key={item.id} className="bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all hover:-translate-y-2 border">
              <div className="aspect-square bg-gradient-to-br from-green-100 to-emerald-100 rounded-2xl mb-4 overflow-hidden">
                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-2">{item.name}</h3>
              <p className="text-green-600 font-bold text-2xl mb-4">₹{item.price}</p>
              <button
                onClick={() => addToCart(item)}
                className="w-full bg-green-500 text-white py-3 px-6 rounded-xl font-bold hover:bg-green-600 transition-all flex items-center justify-center gap-2"
              >
                <ShoppingCart className="w-5 h-5" />
                Add to Cart
              </button>
            </div>
          ))}
        </div>

        {/* Cart Summary */}
        {cart.length > 0 && (
          <div className="bg-white rounded-3xl shadow-2xl p-8 sticky top-24">
            <h2 className="text-3xl font-bold text-slate-900 mb-6">Your Cart ({cart.reduce((sum, c) => sum + c.quantity, 0)} items)</h2>
            
            <div className="space-y-4 mb-8">
              {cart.map(item => (
                <div key={item.id} className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl">
                  <img src={item.image} alt={item.name} className="w-16 h-16 rounded-xl object-cover" />
                  <div className="flex-1">
                    <h4 className="font-bold text-lg">{item.name}</h4>
                    <p className="text-green-600 font-bold text-xl">₹{item.price}</p>
                  </div>
                  <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-xl">
                    <button onClick={() => updateQuantity(item.id, -1)} className="w-10 h-10 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center">
                      <Minus className="w-5 h-5" />
                    </button>
                    <span className="font-bold text-xl min-w-[2rem] text-center">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, 1)} className="w-10 h-10 rounded-lg bg-green-500 text-white hover:bg-green-600 flex items-center justify-center">
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                  <p className="font-bold text-xl min-w-[5rem] text-right">₹{(item.price * item.quantity).toFixed(0)}</p>
                </div>
              ))}
            </div>

            <div className="border-t pt-6">
              <div className="flex justify-between text-2xl font-bold mb-6">
                <span>Total:</span>
                <span className="text-green-600">₹{getTotal().toFixed(0)}</span>
              </div>
              <button
                onClick={placeOrder}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-4 px-8 rounded-2xl font-black text-xl hover:shadow-2xl transition-all hover:scale-[1.02] shadow-lg"
              >
                Place Order Now
              </button>
            </div>
          </div>
        )}

        <div className="text-center mt-20 text-slate-500">
          <p className="text-lg mb-4">Ready in 8-15 mins • Made with fresh ingredients</p>
        </div>
      </div>
    </div>
  );
};

export default Anohana;
