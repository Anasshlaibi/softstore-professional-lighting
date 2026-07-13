import React, { useState } from 'react';
import { faqSchemaData } from './StructuredData';

// Use the same FAQ data as the schema (single source of truth)
const faqData = faqSchemaData.map((item, index) => ({
  id: index + 1,
  question: item.question,
  answer: item.answer
}));

const FAQ: React.FC = () => {
    const [openId, setOpenId] = useState<number | null>(null);

    const toggleFAQ = (id: number) => {
        setOpenId(openId === id ? null : id);
    };

    return (
        <section
          id="faq"
          className="py-16 md:py-24 bg-white"
          aria-label="Questions fréquentes sur les objectifs 7Artisans et la livraison au Maroc"
          itemScope
          itemType="https://schema.org/FAQPage"
        >
            <div className="container mx-auto px-4 md:px-6">
                <div className="text-center mb-10 md:mb-16">
                    <h2 className="text-2xl md:text-4xl font-bold text-black mb-2 md:mb-4">
                        Questions Fréquentes.
                    </h2>
                    <p className="text-gray-500 text-sm md:text-base">
                        Tout ce que vous devez savoir sur nos objectifs 7Artisans et notre service au Maroc.
                    </p>
                </div>

                <div className="max-w-3xl mx-auto">
                    <div className="space-y-4" role="list">
                        {faqData.map((faq) => (
                            <div
                                key={faq.id}
                                className="bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 hover:border-gray-200 transition-all"
                                role="listitem"
                                itemScope
                                itemProp="mainEntity"
                                itemType="https://schema.org/Question"
                            >
                                <button
                                    onClick={() => toggleFAQ(faq.id)}
                                    className="w-full px-6 py-5 flex items-center justify-between text-left focus:outline-none group"
                                    aria-expanded={openId === faq.id}
                                    aria-controls={`faq-answer-${faq.id}`}
                                    id={`faq-question-${faq.id}`}
                                >
                                    <span
                                      className="text-base md:text-lg font-medium text-black pr-4"
                                      itemProp="name"
                                    >
                                        {faq.question}
                                    </span>
                                    <div
                                        className={`flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full bg-black text-white transition-transform duration-300 ${openId === faq.id ? 'rotate-180' : ''
                                            }`}
                                    >
                                        <i className="fa-solid fa-chevron-down text-xs"></i>
                                    </div>
                                </button>

                                <div
                                    id={`faq-answer-${faq.id}`}
                                    role="region"
                                    aria-labelledby={`faq-question-${faq.id}`}
                                    className={`overflow-hidden transition-all duration-300 ${openId === faq.id ? 'max-h-96' : 'max-h-0'
                                        }`}
                                    itemScope
                                    itemProp="acceptedAnswer"
                                    itemType="https://schema.org/Answer"
                                >
                                    <div
                                      className="px-6 pb-5 text-gray-600 leading-relaxed"
                                      itemProp="text"
                                    >
                                        {faq.answer}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Contact CTA */}
                    <div className="mt-12 text-center bg-gray-50 rounded-2xl p-8 border border-gray-100">
                        <p className="text-gray-600 mb-4">
                            Vous ne trouvez pas la réponse à votre question?
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            <a
                                href="https://wa.me/212673011873"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors font-medium"
                                aria-label="Contacter GearShop Maroc sur WhatsApp"
                            >
                                <i className="fa-brands fa-whatsapp"></i>
                                Contactez-nous sur WhatsApp
                            </a>
                            <a
                                href="mailto:professionalanass@gmail.com"
                                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-black text-white rounded-full hover:bg-gray-800 transition-colors font-medium"
                                aria-label="Envoyer un email à GearShop Maroc"
                            >
                                <i className="fa-solid fa-envelope"></i>
                                Envoyer un email
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default FAQ;

