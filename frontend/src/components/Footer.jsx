import React from "react";
import { Utensils, MapPin, Phone, Clock } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-10 text-left">
          
          {/* Brand & Mission */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="bg-orange-500 p-1.5 rounded-lg">
                <Utensils className="w-5 h-5 text-white" />
              </div>
              <span className="text-2xl font-black tracking-tight text-white">
                SMART<span className="text-orange-500">CANTEEN</span>
              </span>
            </div>
            <p className="text-sm leading-relaxed text-slate-400">
              Fresh meals, zero queues. Our digital pre-order system ensures 
              your campus dining experience is fast, healthy, and convenient.
            </p>
          </div>

          {/* Quick Links */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="text-white font-bold mb-4">Ordering</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="/menu" className="hover:text-orange-500 transition-colors">Daily Menu</a></li>
                <li><a href="/preorder" className="hover:text-orange-500 transition-colors">Bulk Orders</a></li>
                <li><a href="/allergens" className="hover:text-orange-500 transition-colors">Allergy Info</a></li>
                <li><a href="/feedback" className="hover:text-orange-500 transition-colors">Rate a Meal</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">Support</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="/AboutUsPage" className="hover:text-orange-500 transition-colors">About Canteen</a></li>
                <li><a href="/ContactPage" className="hover:text-orange-500 transition-colors">Help Center</a></li>
                <li><a href="/FaqPage" className="hover:text-orange-500 transition-colors">Refund Policy</a></li>
                <li><a href="/terms" className="hover:text-orange-500 transition-colors">Terms of Use</a></li>
              </ul>
            </div>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h4 className="text-white font-bold mb-4">Connect with Us</h4>
            <div className="flex items-center gap-3 text-sm">
              <Clock className="w-4 h-4 text-orange-500" />
              <span>Mon - Fri: 7:00 AM - 6:00 PM</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <MapPin className="w-4 h-4 text-orange-500" />
              <span>SLIIT ,Malabe</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Phone className="w-4 h-4 text-orange-500" />
              <span>1128956478</span>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-500">
          <p>© 2026 Smart Canteen Systems. All meals prepared fresh daily.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Accessibility</a>
            <a href="#" className="hover:text-white transition-colors">Sitemap</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;