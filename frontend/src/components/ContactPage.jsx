import React from 'react';
import { 
  MapPin, 
  Phone, 
  Mail, 
  Clock,
  MessageCircle,
  ChevronRight,
  Send
} from 'lucide-react';
import Footer from "./Footer";

const ContactPage = () => {
  const shopLocation = {
    lat: 5.9440213344407145, 
    lng: 80.54919405343878,
    address: "SLIIT, 271/3 Malabe Road , Sri Lanka"
  };

  const openInMaps = () => {
    const url = `https://www.google.com/maps?q=${shopLocation.lat},${shopLocation.lng}`;
    window.open(url, '_blank');
  };

  const contactItems = [
    {
      icon: MapPin,
      title: "Pickup Point",
      details: shopLocation.address,
      action: openInMaps,
      actionText: "Navigate to Pickup"
    },
    {
      icon: Phone,
      title: "Order Hotline",
      details: "(+94) 77 029 0017\nFor immediate order issues",
      action: () => window.open('tel:+94770290017'),
      actionText: "Call Canteen"
    },
    {
      icon: Mail,
      title: "Bulk & Events",
      details: "catering@campusbites.com\nSpecial event pre-orders",
      action: () => window.open('mailto:catering@campusbites.com'),
      actionText: "Email Catering"
    },
    {
      icon: MessageCircle,
      title: "WhatsApp Support",
      details: "Quick chat for order status\nInstant response during lunch",
      action: () => window.open('https://wa.me/94770290017'),
      actionText: "Open WhatsApp"
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      
      <div className="h-48 bg-orange-600 w-full absolute top-0 left-0 z-0 shadow-inner"></div>

      <div className="max-w-7xl mx-auto px-4 py-12 relative z-10">
       
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-black text-white mb-3">
            NEED HELP WITH AN <span className="text-orange-200">ORDER?</span>
          </h1>
          <p className="text-orange-50 font-medium">
            Contact the Campus Bites Canteen team for order support and catering.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Left Column: Quick Contact Cards */}
          <div className="lg:col-span-2 space-y-6">
            <div className="grid sm:grid-cols-2 gap-4">
              {contactItems.map((item, index) => (
                <div 
                  key={index}
                  className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:border-orange-200 transition-all group"
                >
                  <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-orange-500 transition-colors">
                    <item.icon className="w-6 h-6 text-orange-600 group-hover:text-white" />
                  </div>
                  <h3 className="font-bold text-slate-900 mb-1">{item.title}</h3>
                  <p className="text-slate-500 text-sm mb-4 whitespace-pre-line leading-relaxed">
                    {item.details}
                  </p>
                  <button 
                    onClick={item.action}
                    className="flex items-center text-orange-600 font-bold text-xs uppercase tracking-wider hover:gap-2 transition-all"
                  >
                    {item.actionText} <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* Canteen Map / Visual Section */}
            <div className="bg-slate-900 rounded-3xl overflow-hidden relative h-64 shadow-xl border-4 border-white">
               <div className="absolute inset-0 bg-black/40 z-10 flex flex-col items-center justify-center text-center p-6">
                  <MapPin className="text-orange-500 w-10 h-10 mb-2 animate-bounce" />
                  <h2 className="text-white text-2xl font-bold">Find the Pickup Counter</h2>
                  <p className="text-slate-300 text-sm mb-4">Located at the Ground Floor, Block A</p>
                  <button 
                    onClick={openInMaps}
                    className="bg-orange-500 text-white px-6 py-2 rounded-full font-bold hover:bg-orange-600 transition-colors"
                  >
                    Open Live Map
                  </button>
               </div>
               <img 
                 src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&q=80&w=1000" 
                 alt="Canteen Location" 
                 className="w-full h-full object-cover opacity-60"
               />
            </div>
          </div>

          {/* Right Column: Service Hours & Socials */}
          <div className="space-y-6">
            {/* Meal Time Schedule */}
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
              <div className="flex items-center gap-3 mb-6">
                <Clock className="text-orange-500 w-6 h-6" />
                <h3 className="text-xl font-bold text-slate-900">Service Hours</h3>
              </div>
              
              <div className="space-y-4">
                {[
                  { label: "Breakfast", time: "07:30 AM - 10:00 AM", color: "bg-blue-50 text-blue-600" },
                  { label: "Lunch", time: "11:30 AM - 02:30 PM", color: "bg-orange-50 text-orange-600" },
                  { label: "Evening Snacks", time: "04:00 PM - 06:30 PM", color: "bg-amber-50 text-amber-600" },
                  { label: "Dinner", time: "07:30 PM - 09:30 PM", color: "bg-indigo-50 text-indigo-600" }
                ].map((slot, i) => (
                  <div key={i} className="flex flex-col border-b border-slate-50 pb-3 last:border-0">
                    <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full w-fit ${slot.color} mb-1`}>
                      {slot.label}
                    </span>
                    <span className="text-slate-700 font-medium">{slot.time}</span>
                  </div>
                ))}
              </div>

              <div className="mt-8 p-4 bg-slate-50 rounded-2xl flex items-center gap-4">
                <div className="bg-green-500 w-3 h-3 rounded-full animate-pulse"></div>
                <span className="text-slate-600 text-sm font-medium">Currently accepting orders</span>
              </div>
            </div>

            {/* Newsletter/Alerts */}
            <div className="bg-orange-500 rounded-3xl p-8 text-white">
              <h3 className="text-xl font-bold mb-2">Menu Alerts</h3>
              <p className="text-orange-100 text-sm mb-4">Get notified about Today's Specials via email.</p>
              <div className="relative">
                <input 
                  type="email" 
                  placeholder="Student Email"
                  className="w-full bg-white/20 border border-white/30 rounded-xl py-3 px-4 text-white placeholder:text-white/60 focus:outline-none focus:bg-white/30"
                />
                <button className="absolute right-2 top-2 bg-white text-orange-600 p-1.5 rounded-lg">
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ContactPage;