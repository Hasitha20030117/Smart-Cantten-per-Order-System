import React, { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Utensils, Clock, Pizza, Coffee, Leaf, ChevronRight, Sun, Moon } from 'lucide-react';
import Footer from "./Footer";
import ChatBot from "./AI/chatbot";

const CanteenHomepage = () => {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    // Load theme from localStorage on mount
    const savedTheme = localStorage.getItem('theme') === 'dark';
    setDarkMode(savedTheme);
  }, []);

  useEffect(() => {
    // Save to localStorage and toggle class on html
    localStorage.setItem('theme', darkMode ? 'dark' : 'light');
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const toggleTheme = () => {
    setDarkMode(!darkMode);
  };
  const videoRef = useRef(null);
  
  // Single video source
  const videoSource = 'images/3.mp4';

  const scrollToMenu = () => {
    const menuSection = document.getElementById("menu");
    if (menuSection) {
      menuSection.scrollIntoView({ behavior: "smooth" });
    }
  };

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
<div className={`min-h-screen ${darkMode ? 'dark bg-slate-900' : 'bg-slate-50'} font-sans`}>
      
      {/* Hero Section with Single Video Background */}
      <section className="relative h-[85vh] flex items-center justify-center overflow-hidden">
        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 bg-black/50 z-10"></div>
        
        <div className="absolute inset-0 w-full h-full">
          <video
            ref={videoRef}
            autoPlay
            muted
            loop
            playsInline
            className="w-full h-full object-cover"
          >
            <source src={videoSource} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>

        {/* Hero Content */}
        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="fixed top-6 right-6 z-30 bg-white/90 dark:bg-slate-800/90 backdrop-blur-md p-3 rounded-2xl shadow-2xl border border-white/50 dark:border-slate-700/50 hover:scale-105 transition-all duration-300 flex items-center gap-1 text-slate-900 dark:text-slate-100"
          title="Toggle Theme"
          aria-label="Toggle dark mode"
        >
          {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
        
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center px-4">
          <h1 className="text-5xl md:text-7xl font-black text-white mb-4 drop-shadow-2xl">Theme Cloure
            SKIP THE <span className="text-orange-500">QUEUE.</span>
          </h1>
          <p className="text-xl text-white/90 mb-8 font-medium max-w-xl">
            Pre-order your favorite campus meals and pick them up when they're ready.
          </p>
          <div className="flex gap-4 flex-wrap justify-center">
            <Link to="/orders/create">
              <button
                className="bg-orange-500 text-white px-10 py-4 rounded-xl font-bold text-lg hover:bg-orange-600 transition-all shadow-xl flex items-center gap-2"
              >
                <Utensils className="w-5 h-5" /> Order Now
              </button>
            </Link>

            <Link to="/bulk-order">
              <button className="bg-white text-black px-10 py-4 rounded-xl font-bold text-lg hover:bg-gray-100 transition-all shadow-xl flex items-center gap-2">
                <Clock className="w-5 h-5" /> Bulk Order
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section id="menu" className="py-20 px-8 max-w-7xl mx-auto">
        <div className="flex items-end justify-between mb-12">
          <div>
            <h2 className="text-4xl font-bold text-slate-900 dark:text-slate-100">Browse Menu</h2>
            <p className="text-slate-500 dark:text-slate-400 mt-2">Selection of fresh meals available today</p>
          </div>
          <div className="hidden md:block h-1 w-1/3 bg-orange-100 rounded-full mb-4"></div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((category, index) => (
            <Link
              key={index}
              to={category.path}
              className="group relative h-80 rounded-2xl overflow-hidden shadow-lg cursor-pointer transition-transform duration-300 hover:-translate-y-2 block"
            >
              <div 
                className="absolute inset-0 transition-transform duration-700 group-hover:scale-110"
                style={{
                  backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.2), rgba(0,0,0,0.85)), url(${category.backgroundImage})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}
              />
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
            <span className="bg-orange-400/90 dark:bg-orange-500 text-white px-4 py-1 rounded-full text-sm font-bold tracking-widest uppercase backdrop-blur-sm">
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
          
            <div className="lg:w-1/2 bg-white/10 dark:bg-slate-800/30 p-8 rounded-2xl border border-white/20 dark:border-slate-600/50 w-full backdrop-blur-sm">
            <h3 className="text-2xl font-bold mb-4 text-orange-400">Today's Special</h3>
            <div className="aspect-video bg-slate-800 rounded-xl mb-4 overflow-hidden shadow-inner">
                <img src="images/6.jpg" alt="Special" className="w-full h-full object-cover opacity-90 hover:scale-105 transition-transform duration-500" />
            </div>
            <p className="text-lg mb-4 font-semibold text-white">Chef's Signature Spicy Ramen Bowl</p>
            
            <button 
              onClick={scrollToMenu}
              className="w-full bg-orange-500 py-4 rounded-xl font-bold hover:bg-orange-600 transition-all hover:shadow-lg active:scale-95"
            >
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
