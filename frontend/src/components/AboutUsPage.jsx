import React, { useState } from 'react';
import { 
  Heart, 
  Users, 
  Award, 
  ChefHat, 
  Palette, 
  Globe, 
  Leaf, 
  Target, 
  Star,
  ArrowRight
} from 'lucide-react';
import Footer from "./Footer";

const AboutUsPage = () => {
  const [activeTab, setActiveTab] = useState('story');

  const stats = [
    { number: '50K+', label: 'Happy Customers', icon: Users },
    { number: '10K+', label: 'Custom Pieces', icon: ChefHat },
    { number: '5+', label: 'Years Experience', icon: Award },
    { number: '98%', label: 'Satisfaction', icon: Star }
  ];

  return (
    <div className="min-h-screen bg-[#FCFBFA] text-slate-900 font-sans">
      {/* --- Orange-Accented Hero Section --- */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="lg:w-1/2 space-y-8">
              <span className="inline-block px-4 py-1.5 rounded-full bg-orange-100 text-orange-600 text-sm font-bold tracking-widest uppercase">
                Established 2019
              </span>
              <h1 className="text-6xl md:text-8xl font-serif font-light leading-tight">
                Crafting <br />
                <span className="italic font-normal text-orange-500">Identity.</span>
              </h1>
              <p className="text-xl text-slate-600 leading-relaxed max-w-lg">
                We don't just make clothes; we engineer confidence. From sustainable fabrics to 
                bespoke tailoring, our mission is to make the "perfect fit" a global standard.
              </p>
              <div className="flex items-center gap-10 pt-4 border-t border-slate-100">
                {stats.slice(0, 2).map((s, i) => (
                  <div key={i}>
                    <p className="text-3xl font-bold text-slate-900">{s.number}</p>
                    <p className="text-sm text-slate-500 uppercase tracking-tighter font-semibold">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Visual Element: Floating Image Montage */}
            <div className="lg:w-1/2 relative">
              <div className="relative w-full aspect-square bg-orange-50 rounded-[3rem] flex items-center justify-center border border-orange-100 shadow-inner">
                
                {/* Floating "Polaroids" */}
                {/* Dining Area - Top Right */}
<div className="absolute top-0 right-0 w-48 h-64 bg-slate-200 rounded-2xl shadow-2xl -rotate-12 overflow-hidden border-4 border-white transition-transform hover:rotate-0 duration-500">
    <div 
        className="w-full h-full bg-cover bg-center flex items-center justify-center"
        style={{ backgroundImage: "url('images/10.jpeg')" }} // Change to your actual file name
    >
        <div className="w-full h-full flex items-center justify-center bg-black/30 text-white italic font-serif">
            Dining Area
        </div>
    </div>
</div>

{/* Food Court - Bottom Left */}
<div className="absolute bottom-0 left-0 w-56 h-72 bg-slate-100 rounded-2xl shadow-2xl rotate-6 overflow-hidden border-4 border-white transition-transform hover:rotate-0 duration-500">
    <div 
        className="w-full h-full bg-cover bg-center flex items-center justify-center"
        style={{ backgroundImage: "url('images/9.jpg')" }}
    >
        <div className="w-full h-full flex items-center justify-center bg-black/30 text-white italic font-serif">
            Food Court
        </div>
    </div>
</div>
                <Heart size={120} className="text-orange-200 opacity-40 animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- Sticky Navigation --- */}
      <section className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-y border-slate-100">
        <div className="max-w-4xl mx-auto px-6">
          <div className="flex justify-between items-center">
            {['story', 'vision', 'journey'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`relative py-6 text-xs font-bold uppercase tracking-[0.3em] transition-all ${
                  activeTab === tab ? 'text-orange-600' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                {tab}
                {activeTab === tab && (
                  <span className="absolute bottom-0 left-0 w-full h-1 bg-orange-500 transition-all duration-500" />
                )}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* --- Dynamic Content Area --- */}
      <main className="max-w-7xl mx-auto px-6 py-24 min-h-[600px]">
        {activeTab === 'story' && (
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <div className="space-y-6">
              <h2 className="text-4xl font-serif leading-snug">Quality is a habit, <br/><span className="text-orange-600 italic">not an act.</span></h2>
              <p className="text-slate-600 text-lg leading-relaxed">
                "Our journey began in 2019 in a small campus corner with one basic stove and a massive dream. We noticed that the lunch rush was moving too fast—low-quality ingredients, generic menus, and zero convenience for students on the go."
              </p>
              <div className="p-8 bg-slate-900 text-white rounded-[2rem] space-y-4 shadow-xl">
                <blockquote className="italic text-xl font-serif text-orange-200 leading-relaxed">
                  "A meal should be an investment in your day, not just a convenient afterthought."
                </blockquote>
                <div className="flex items-center gap-3">
                    <div className="w-10 h-px bg-orange-500"></div>
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Hasitha Nethsara, Main Chef/Founder </p>
                </div>
              </div>
            </div>
           <div className="grid grid-cols-2 gap-6">
  {/* Card 1 - Uses images/6.jpg */}
  <div className="group relative h-64 bg-slate-200 rounded-3xl overflow-hidden border border-slate-100 shadow-xl transition-all duration-500">
    <div 
      className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
      style={{ backgroundImage: "url('images/11.jpg')" }}
    />
    
    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
  </div>

  
  <div className="group relative h-64 bg-slate-200 rounded-3xl mt-12 overflow-hidden border border-slate-100 shadow-xl transition-all duration-500">
    <div 
      className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
      style={{ backgroundImage: "url('images/12.jpg')" }}
    />
   
    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
  </div>
</div>
          </div>
        )}

        {activeTab === 'vision' && (
            <div className="grid md:grid-cols-3 gap-12">
                {[
                    { title: "Eco-Tailoring", icon: Leaf, desc: "Zero-waste packaging and sustainable ingredient sourcing by 2027." },
                    { title: " Nutri-Custom Fit", icon: Target, desc: "Personalized meal plans designed to meet every dietary or allergic requirement." },
                    { title: "Smart-Kitchen Tech", icon: Globe, desc: "Blending real-time digital tracking with traditional, fresh culinary craftsmanship." }
                ].map((v, i) => (
                    <div key={i} className="group p-10 border border-slate-100 rounded-[2.5rem] hover:bg-white hover:shadow-2xl hover:border-orange-100 transition-all duration-500">
                        <div className="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-orange-500 transition-colors">
                            <v.icon className="text-orange-600 group-hover:text-white transition-colors" size={32} />
                        </div>
                        <h3 className="text-2xl font-serif mb-4">{v.title}</h3>
                        <p className="text-slate-500 leading-relaxed">{v.desc}</p>
                    </div>
                ))}
            </div>
        )}

        {activeTab === 'journey' && (
            <div className="relative space-y-16">
                <div className="absolute left-1/2 top-0 bottom-0 w-px bg-slate-200 hidden md:block" />
                {[
                    { year: '2019', label: 'The Kitchen Roots', desc: 'Started as a small campus kiosk with manual paper-based ordering.' },
                    { year: '2024', label: 'Digital Shift', desc: 'Launched our QR-code pre-order app, reducing wait times by 60%.' },
                    { year: '2026', label: '50K Meals Served', desc: 'Scaling to 42 corporate branches with AI-driven inventory tracking.' }
                ].map((m, i) => (
                    <div key={i} className={`flex flex-col md:flex-row items-center gap-12 ${i % 2 !== 0 ? 'md:flex-row-reverse' : ''}`}>
                        <div className={`flex-1 text-center ${i % 2 === 0 ? 'md:text-right' : 'md:text-left'}`}>
                            <span className="text-6xl font-serif text-orange-100 font-bold">{m.year}</span>
                        </div>
                        <div className="z-10 w-4 h-4 rounded-full bg-orange-500 ring-8 ring-orange-50" />
                        <div className={`flex-1 text-center ${i % 2 !== 0 ? 'md:text-right' : 'md:text-left'}`}>
                            <h3 className="text-2xl font-serif font-bold mb-2">{m.label}</h3>
                            <p className="text-slate-500">{m.desc}</p>
                        </div>
                    </div>
                ))}
            </div>
        )}
      </main>

      {/* --- Call to Action --- */}
      <section className="bg-slate-900 py-24 relative overflow-hidden mx-6 mb-12 rounded-[3rem]">
         <div className="absolute top-0 right-0 p-20 opacity-5 rotate-12">
            <ChefHat size={400} className="text-white" />
         </div>
         <div className="max-w-4xl mx-auto text-center px-6 relative z-10">
            <h2 className="text-4xl md:text-5xl font-serif text-white mb-8">Ready for a <br/><span className="text-orange-500 italic">New Perspective?</span></h2>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
                <button className="px-10 py-5 bg-orange-600 text-white font-bold rounded-2xl hover:bg-orange-700 hover:scale-105 transition-all flex items-center justify-center gap-2 shadow-lg shadow-orange-900/20">
                    Explore Collections <ArrowRight size={20} />
                </button>
                <button className="px-10 py-5 bg-transparent border border-slate-700 text-white font-bold rounded-2xl hover:bg-white hover:text-slate-900 transition-all">
                    Custom Canteen
                </button>
            </div>
         </div>
      </section>

      <Footer />
    </div>
  );
};

export default AboutUsPage;