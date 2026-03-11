import React, { useState, useEffect } from 'react';
import { Star } from 'lucide-react';

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
        name: "Omar binfo",
        role: "Content Creator / Tech",
        rating: 5,
        text: "Le matériel de GearShop a totalement transformé ma qualité de production. Les Softboxes ZSYB sont un must pour tout créateur sérieux.",
        image: null
    },
    {
        id: 2,
        name: "Akbali",
        role: "Professional Filmmaker",
        rating: 5,
        text: "Une fiabilité irréprochable sur le terrain. L'éclairage est puissant, précis et facile à transporter pour mes tournages.",
        image: null
    },
    {
        id: 3,
        name: "Influencers Network",
        role: "Digital Creators",
        rating: 5,
        text: "Nous recommandons GearShop à tous nos partenaires. Le service client à Casablanca est exceptionnel et le matériel est au top.",
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
            <Star
                key={i}
                className={`w-4 h-4 ${i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'
                    }`}
            />
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
                                &ldquo;{testimonials[activeIndex].text}&rdquo;
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
