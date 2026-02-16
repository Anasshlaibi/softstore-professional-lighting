import React, { useState, useEffect } from 'react';

interface Testimonial {
    id: number;
    name: string;
    role: string;
    rating: number;
    text: string;
    image: string | null;
}

const testimonials: Testimonial[] = [
    {
        id: 1,
        name: "Mohamed A.",
        role: "Photographe Professionnel",
        rating: 5,
        text: "Qualité exceptionnelle! Mon studio n'a jamais été aussi bien éclairé. Le rendu des couleurs est parfait.",
        image: null
    },
    {
        id: 2,
        name: "Fatima Z.",
        role: "Réalisatrice Vidéo",
        rating: 5,
        text: "Matériel professionnel, livraison rapide et excellent service client. Je recommande vivement!",
        image: null
    },
    {
        id: 3,
        name: "Youssef K.",
        role: "YouTuber",
        rating: 5,
        text: "Les LED portables sont parfaites pour mes tournages en extérieur. Légères et puissantes!",
        image: null
    },
    {
        id: 4,
        name: "Sanaa M.",
        role: "Photographe de Mariage",
        rating: 5,
        text: " Service impeccable et conseils d'experts. Mes photos de mariages n'ont jamais été aussi belles.",
        image: null
    }
];

const Testimonials: React.FC = () => {
    const [activeIndex, setActiveIndex] = useState(0);

    // Auto-rotate testimonials every 5 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            setActiveIndex((prev) => (prev + 1) % testimonials.length);
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    const renderStars = (rating: number) => {
        return Array.from({ length: 5 }, (_, i) => (
            <i
                key={i}
                className={`fa-solid fa-star text-sm ${i < rating ? 'text-yellow-400' : 'text-gray-200'
                    }`}
            ></i>
        ));
    };

    return (
        <section className="py-16 md:py-24 bg-gray-50">
            <div className="container mx-auto px-4 md:px-6">
                <div className="text-center mb-10 md:mb-16">
                    <h2 className="text-2xl md:text-4xl font-bold text-black mb-2 md:mb-4">
                        Ce que disent nos clients.
                    </h2>
                    <p className="text-gray-500 text-sm md:text-base">
                        Rejoignez des centaines de professionnels satisfaits.
                    </p>
                </div>

                {/* Testimonial Card */}
                <div className="max-w-4xl mx-auto">
                    <div className="bg-white rounded-3xl p-8 md:p-12 shadow-lg border border-gray-100">
                        <div className="text-center">
                            {/* Stars */}
                            <div className="flex justify-center gap-1 mb-6">
                                {renderStars(testimonials[activeIndex].rating)}
                            </div>

                            {/* Quote */}
                            <blockquote className="text-xl md:text-2xl font-light text-gray-800 leading-relaxed mb-8">
                                "{testimonials[activeIndex].text}"
                            </blockquote>

                            {/* Author */}
                            <div>
                                <p className="text-lg font-bold text-black">
                                    {testimonials[activeIndex].name}
                                </p>
                                <p className="text-sm text-gray-500">
                                    {testimonials[activeIndex].role}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Dots Navigation */}
                    <div className="flex justify-center gap-2 mt-8">
                        {testimonials.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => setActiveIndex(index)}
                                className={`w-2 h-2 rounded-full transition-all duration-300 ${index === activeIndex
                                        ? 'bg-black w-8'
                                        : 'bg-gray-300 hover:bg-gray-400'
                                    }`}
                                aria-label={`Témoignage ${index + 1}`}
                            ></button>
                        ))}
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-6 mt-16 text-center">
                        <div>
                            <div className="text-3xl md:text-4xl font-bold text-black mb-2">
                                500+
                            </div>
                            <div className="text-sm text-gray-500">
                                Clients Satisfaits
                            </div>
                        </div>
                        <div>
                            <div className="text-3xl md:text-4xl font-bold text-black mb-2">
                                4.9
                            </div>
                            <div className="text-sm text-gray-500">
                                Note Moyenne
                            </div>
                        </div>
                        <div>
                            <div className="text-3xl md:text-4xl font-bold text-black mb-2">
                                98%
                            </div>
                            <div className="text-sm text-gray-500">
                                Taux de Satisfaction
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Testimonials;
