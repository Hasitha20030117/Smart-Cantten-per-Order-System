import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom'; // Added for navigation
import { ChevronLeft, ChevronRight, Utensils, Clock, Pizza, Coffee, Leaf } from 'lucide-react';
import Footer from "./Footer";
import ChatBot from "./AI/chatbot";

const CanteenHomepage = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  const images = ['images/Canteen 1.jpg', 'images/Canteen 2.jpg', 'images/Canteen 3.jpg'];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [images.length]);

  const nextImage = () => setCurrentImageIndex((prev) => (prev + 1) % images.length);
  const prevImage = () => setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);

  // Updated with 'path' properties for routing
  const categories = [
    { 
      name: "Juice Bar", 
      items: 'Freshly Prepared', 
      icon: <Utensils className="w-6 h-6" />, 
      color: "text-orange-500",
      backgroundImage: "images/juse.jpg",
      path: "/menu/juice-bar" 
    },
    { 
      name: "Basement Canteen", 
      items: 'Grab & Go', 
      icon: <Pizza className="w-6 h-6" />, 
      color: "text-yellow-600",
      backgroundImage: "images/2.jpg",
      path: "/menu/basement"
    },
    { 
      name: 'New Canteen', 
      items: 'Cold & Hot', 
      icon: <Coffee className="w-6 h-6" />, 
      color: "text-amber-700",
      backgroundImage: "images/3.jpg",
      path: "/menu/new-canteen"
    },
    { 
      name: 'Anohana Canteen', 
      items: 'Salads & Veggie', 
      icon: <Leaf className="w-6 h-6" />, 
      color: "text-green-500",
      backgroundImage: "images/4.jpg",
      path: "/menu/anohana"
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      
      {/* Hero Section */}
      <section className="relative h-[85vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-black/40 z-10"></div>
        <div className="relative w-full h-full">
          {images.map((image, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                index === currentImageIndex ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <img src={image} alt="Canteen Food" className="w-full h-full object-cover" />
            </div>
          ))}

          {/* Slider Controls */}
          <button onClick={prevImage} className="absolute left-6 top-1/2 -translate-y-1/2 z-20 bg-white/20 hover:bg-white/40 backdrop-blur-md text-white p-3 rounded-full transition-all">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button onClick={nextImage} className="absolute right-6 top-1/2 -translate-y-1/2 z-20 bg-white/20 hover:bg-white/40 backdrop-blur-md text-white p-3 rounded-full transition-all">
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Hero Content */}
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center px-4">
            <h1 className="text-5xl md:text-7xl font-black text-white mb-4 drop-shadow-lg">
              SKIP THE <span className="text-orange-500">QUEUE.</span>
            </h1>
            <p className="text-xl text-white/90 mb-8 font-medium max-w-xl">
              Pre-order your favorite campus meals and pick them up when they're ready.
            </p>
            <div className="flex gap-4">
              <button className="bg-orange-500 text-white px-10 py-4 rounded-xl font-bold text-lg hover:bg-orange-600 transition-all shadow-xl flex items-center gap-2">
                <Utensils className="w-5 h-5" /> Order Now
              </button>
              <button className="bg-white text-black px-10 py-4 rounded-xl font-bold text-lg hover:bg-gray-100 transition-all shadow-xl flex items-center gap-2">
                <Clock className="w-5 h-5" /> Track Order
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-20 px-8 max-w-7xl mx-auto">
        <div className="flex items-end justify-between mb-12">
          <div>
            <h2 className="text-4xl font-bold text-slate-900">Browse Menu</h2>
            <p className="text-slate-500 mt-2">Selection of fresh meals available today</p>
          </div>
          <div className="hidden md:block h-1 w-1/3 bg-orange-100 rounded-full mb-4"></div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((category, index) => (
            /* Using Link instead of div to enable navigation */
            <Link
              key={index}
              to={category.path}
              className="group relative h-80 rounded-2xl overflow-hidden shadow-lg cursor-pointer transition-transform duration-300 hover:-translate-y-2 block"
            >
              {/* Background Image Container with Zoom effect */}
              <div 
                className="absolute inset-0 transition-transform duration-700 group-hover:scale-110"
                style={{
                  backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.2), rgba(0,0,0,0.85)), url(${category.backgroundImage})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}
              />

              {/* Card content aligned to bottom */}
              <div className="relative h-full p-8 flex flex-col justify-end z-10">
                <div className={`${category.color} mb-4 bg-white/95 w-12 h-12 flex items-center justify-center rounded-xl group-hover:bg-white transition-colors`}>
                  {category.icon}
                </div>
                <h3 className="text-xl font-bold text-white mb-1 drop-shadow-md">
                  {category.name}
                </h3>
                <p className="text-slate-200 text-sm mb-4">
                  {category.items}
                </p>
                <div className="flex items-center text-orange-400 font-bold text-xs tracking-wider uppercase">
                  View Menu <ChevronRight className="w-4 h-4 ml-1" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Promo Section */}
      <section className="py-20 px-8 bg-orange-500">
        <div className="max-w-6xl mx-auto rounded-3xl bg-slate-900 p-12 flex flex-col lg:flex-row items-center gap-12 text-white shadow-2xl">
          <div className="lg:w-1/2">
            <span className="bg-orange-500 text-white px-4 py-1 rounded-full text-sm font-bold tracking-widest uppercase">
              How it works
            </span>
            <h2 className="text-4xl font-bold mt-6 mb-8">
              Order in 3 Simple Steps
            </h2>
            <div className="space-y-6">
              {[
                { step: "01", title: "Select your meal", desc: "Choose from our daily rotating menu." },
                { step: "02", title: "Pay Online", desc: "Secure payment via your student portal or card." },
                { step: "03", title: "Quick Pickup", desc: "Scan your QR code at the counter and enjoy!" }
              ].map((item, i) => (
                <div key={i} className="flex gap-4">
                  <span className="text-orange-500 font-black text-2xl">{item.step}</span>
                  <div>
                    <h4 className="font-bold text-lg">{item.title}</h4>
                    <p className="text-slate-400">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="lg:w-1/2 bg-white/5 p-8 rounded-2xl border border-white/10 w-full">
            <h3 className="text-2xl font-bold mb-4 text-orange-400">Today's Special</h3>
            <div className="aspect-video bg-slate-800 rounded-xl mb-4 overflow-hidden shadow-inner">
               <img src="images/6.jpg" alt="Special" className="w-full h-full object-cover opacity-90 hover:scale-105 transition-transform duration-500" />
            </div>
            <p className="text-lg mb-4 font-semibold text-white">Chef's Signature Spicy Ramen Bowl</p>
            <button className="w-full bg-orange-500 py-4 rounded-xl font-bold hover:bg-orange-600 transition-all hover:shadow-lg active:scale-95">
              Add to Order - $8.50
            </button>
          </div>
        </div>
      </section>

      <ChatBot />
      <Footer />
    </div>
  );
};

export default CanteenHomepage;