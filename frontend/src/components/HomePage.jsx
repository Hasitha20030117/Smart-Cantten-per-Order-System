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
    <div className={`min-h-screen ${
      darkMode 
        ? 'dark bg-gradient-to-b from-slate-900 via-orange-950/20 to-emerald-950/20' 
        : 'bg-gradient-to-b from-orange-50 via-green-50 to-emerald-50'
    } font-sans transition-all duration-500`}>
      
      {/* Hero Section with Single Video Background */}
      <section className="relative h-[85vh] flex items-center justify-center overflow-hidden">
        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-black/80 z-10"></div>
        
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

        {/* Theme Toggle Button - Orange-Green Theme */}
        <button
          onClick={toggleTheme}
          className={`fixed top-6 right-6 z-30 backdrop-blur-md p-3 rounded-2xl shadow-2xl border hover:scale-105 transition-all duration-300 flex items-center gap-1 text-lg font-bold ${
            darkMode 
              ? 'bg-emerald-500/90 text-white border-emerald-300/50 shadow-emerald-500/25 hover:bg-emerald-600' 
              : 'bg-gradient-to-r from-orange-500 to-green-500 text-white border-orange-300/50 shadow-orange-500/25 hover:from-orange-600 hover:to-green-600'
          }`}
          title="Toggle Theme"
          aria-label="Toggle dark mode"
        >
          {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
        
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center px-4">
          <h1 className="text-5xl md:text-7xl font-black text-white mb-4 drop-shadow-2xl">SKIP THE <span className="bg-gradient-to-r from-orange-400 to-green-400 bg-clip-text text-transparent drop-shadow-lg">QUEUE.</span></h1>
          <p className="text-xl text-white/90 mb-8 font-medium max-w-xl">
            Pre-order your favorite campus meals and pick them up when they're ready.
          </p>
          <div className="flex gap-4 flex-wrap justify-center">
            <button
              onClick={scrollToMenu}
              className="bg-gradient-to-r from-orange-500 to-emerald-500 text-white px-10 py-4 rounded-xl font-bold text-lg hover:from-orange-600 hover:to-emerald-600 transition-all shadow-xl flex items-center gap-2 hover:shadow-2xl hover:scale-[1.02]"
            >
              <Utensils className="w-5 h-5" /> Order Now
            </button>

            <Link to="/bulk-order">
              <button className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-md text-slate-900 dark:text-slate-100 px-10 py-4 rounded-xl font-bold text-lg hover:bg-white dark:hover:bg-slate-700 transition-all shadow-xl flex items-center gap-2 border-2 border-white/50 dark:border-slate-600/50">
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
            <h2 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-slate-900 dark:from-orange-400 dark:to-emerald-400 bg-clip-text text-transparent dark:text-white">Browse Menu</h2>
            <p className="text-slate-500 dark:text-slate-400 mt-2 text-lg">Selection of fresh meals available today</p>
          </div>
          <div className="hidden md:block h-1 w-1/3 bg-gradient-to-r from-orange-200 to-emerald-200 dark:from-orange-500 dark:to-emerald-500 rounded-full mb-4"></div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((category, index) => (
            <Link
              key={index}
              to={category.path}
              className="group relative h-80 rounded-3xl overflow-hidden shadow-2xl cursor-pointer transition-all duration-500 hover:-translate-y-4 block border border-slate-200/50 dark:border-slate-700/50 hover:border-orange-300/50"
            >
              <div 
                className="absolute inset-0 transition-transform duration-700 group-hover:scale-110"
                style={{
                  backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.9)), url(${category.backgroundImage})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}
              />
              <div className="relative h-full p-8 flex flex-col justify-end z-10">
                <div className={`${category.color} mb-4 bg-white/95 dark:bg-slate-900/95 w-14 h-14 flex items-center justify-center rounded-2xl group-hover:bg-gradient-to-r group-hover:from-orange-400 group-hover:to-emerald-400 group-hover:scale-110 transition-all duration-300 shadow-lg`}>
                  {category.icon}
                </div>
                <h3 className="text-2xl font-black text-white mb-2 drop-shadow-2xl group-hover:text-orange-400 transition-colors">
                  {category.name}
                </h3>
                <p className="text-slate-200 text-lg mb-4 font-medium">
                  {category.items}
                </p>
                <div className="flex items-center text-orange-400 dark:text-emerald-400 font-bold text-sm tracking-wider uppercase">
                  View Menu <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Promo Section - Orange-Green Gradient */}
      <section className="py-20 px-8 bg-gradient-to-r from-orange-500 via-orange-600 to-emerald-600 dark:from-slate-800 dark:to-slate-900">
        <div className="max-w-6xl mx-auto rounded-3xl bg-white/20 dark:bg-slate-900/40 p-12 flex flex-col lg:flex-row items-center gap-12 text-white shadow-2xl backdrop-blur-xl border border-white/30 dark:border-slate-700/50">
          <div className="lg:w-1/2">
            <span className="bg-gradient-to-r from-orange-400 to-emerald-400 dark:bg-gradient-to-r dark:from-orange-500 dark:to-emerald-500 text-white px-5 py-2 rounded-full text-sm font-bold tracking-widest uppercase backdrop-blur-sm shadow-lg">
              How it works
            </span>
            <h2 className="text-4xl md:text-5xl font-black mt-6 mb-8 bg-gradient-to-r from-white to-slate-200 dark:from-orange-100 dark:to-emerald-100 bg-clip-text">
              Order in 3 Simple Steps
            </h2>
            <div className="space-y-6">
              {[
                { step: "01", title: "Select your meal", desc: "Choose from our daily rotating menu." },
                { step: "02", title: "Pay Online", desc: "Secure payment via your student portal or card." },
                { step: "03", title: "Quick Pickup", desc: "Scan your QR code at the counter and enjoy!" }
              ].map((item, i) => (
                <div key={i} className="flex gap-6 items-start">
                  <span className="text-orange-400 dark:text-emerald-400 font-black text-3xl min-w-[3rem]">{item.step}</span>
                  <div>
                    <h4 className="font-bold text-xl text-white">{item.title}</h4>
                    <p className="text-slate-200 dark:text-slate-300">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="lg:w-1/2 bg-white/30 dark:bg-slate-800/50 p-8 rounded-3xl border border-white/40 dark:border-slate-600/60 w-full backdrop-blur-lg shadow-2xl">
            <h3 className="text-3xl font-bold mb-6 bg-gradient-to-r from-orange-400 to-emerald-400 bg-clip-text text-transparent">Today's Special</h3>
            <div className="aspect-video bg-gradient-to-br from-slate-800/50 to-emerald-900/20 rounded-2xl mb-6 overflow-hidden shadow-2xl border border-white/20">
              <img src="images/6.jpg" alt="Special" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500 hover:brightness-110" />
            </div>
            <p className="text-xl mb-6 font-semibold text-white">Chef's Signature Spicy Ramen Bowl</p>
            
            <button 
              onClick={scrollToMenu}
              className="w-full bg-gradient-to-r from-orange-400 to-emerald-500 hover:from-orange-500 hover:to-emerald-600 text-white py-5 rounded-2xl font-black text-lg shadow-xl hover:shadow-2xl transition-all duration-300 active:scale-95"
            >
              Add to Order - ₹199
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
