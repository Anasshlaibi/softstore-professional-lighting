import React from 'react';

const InformationHub: React.FC = () => {
  const folders = [
    {
      title: 'Product Specs & Manuals',
      icon: 'fa-solid fa-file-lines',
      desc: 'Download technical specifications, user manuals, and wiring diagrams.'
    },
    {
      title: 'Behind-The-Lens Guides',
      icon: 'fa-solid fa-camera-retro',
      desc: 'Expert tutorials on lighting setups and lens character.'
    },
    {
      title: 'Creator Community Forum',
      icon: 'fa-solid fa-comments',
      desc: 'Connect with other professionals, share rigs, and get advice.'
    },
    {
      title: 'Software & Firmware',
      icon: 'fa-solid fa-microchip',
      desc: 'Latest updates for your lighting controllers and smart accessories.'
    }
  ];

  return (
    <section className="py-20 bg-black text-white border-b border-gray-900 relative overflow-hidden">
      {/* Glow Effects */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-red-900/10 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-900/10 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="container mx-auto px-6 relative z-10">
        <header className="flex flex-col md:flex-row items-end justify-between mb-12 border-b border-gray-800 pb-6 gap-6">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-2 flex items-center gap-3">
              <i className="fa-solid fa-folder-open text-gray-500"></i> Information & Resources Hub
            </h2>
            <p className="text-gray-400">Everything you need to master your craft.</p>
          </div>
          <button className="text-sm font-bold tracking-wider uppercase text-gray-400 hover:text-white transition-colors">
            View All Resources <i className="fa-solid fa-arrow-right ml-2"></i>
          </button>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {folders.map((folder, index) => (
            <article 
              key={index}
              className="group cursor-pointer relative bg-gradient-to-b from-[#1a1a1a] to-black rounded-xl p-8 border border-gray-800 hover:border-gray-500 transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_10px_30px_rgba(255,255,255,0.05)]"
            >
              {/* Folder Top Tab Visual */}
              <div className="absolute -top-[1px] left-8 w-16 h-1 bg-gray-600 rounded-b-lg opacity-50 group-hover:bg-red-500 transition-colors"></div>
              
              <div className="w-14 h-14 rounded-full bg-gray-900 border border-gray-700 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-gray-800 transition-all duration-300">
                <i className={`${folder.icon} text-2xl text-gray-400 group-hover:text-white`}></i>
              </div>
              
              <h3 className="text-xl font-bold mb-3 text-gray-200 group-hover:text-white transition-colors">{folder.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{folder.desc}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default InformationHub;
