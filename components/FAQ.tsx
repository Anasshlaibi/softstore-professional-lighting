import React, { useState } from 'react';

interface FAQItem {
    id: number;
    question: string;
    answer: string;
}

const faqData: FAQItem[] = [
    {
        id: 1,
        question: "Quels sont les délais de livraison?",
        answer: "Livraison sous 24-48h à Casablanca. Pour les autres villes du Maroc, comptez 2-4 jours ouvrables. Livraison gratuite dès 500 DH d'achat."
    },
    {
        id: 2,
        question: "Proposez-vous de la location d'équipement?",
        answer: "Oui! Nous proposons la location pour certain produits. Les tarifs de location sont indiqués sur les fiches produits. Contactez-nous sur WhatsApp pour plus d'informations."
    },
    {
        id: 3,
        question: "Quelle est votre politique de retour?",
        answer: "Retour sous 14 jours si le produit est dans son emballage d'origine et en parfait état. Les frais de retour sont à la charge du client sauf en cas de produit défectueux."
    },
    {
        id: 4,
        question: "Les produits sont-ils garantis?",
        answer: "Tous nos produits bénéficient d'une garantie constructeur de 1 an. En cas de problème, nous assurons le service après-vente et les réparations."
    },
    {
        id: 5,
        question: "Quels modes de paiement acceptez-vous?",
        answer: "Nous acceptons: paiement à la livraison (Cash), virement bancaire, et paiement par carte bancaire. Pour les entreprises, nous proposons des facilités de paiement."
    },
    {
        id: 6,
        question: "Puis-je obtenir des conseils techniques?",
        answer: "Absolument! Notre équipe d'experts est disponible pour vous conseiller sur le choix de votre matériel. Contactez-nous via WhatsApp ou email."
    },
    {
        id: 7,
        question: "Effectuez-vous l'installation du matériel?",
        answer: "Oui, nous proposons un service d'installation et de configuration pour les studios professionnels. Tarifs sur devis."
    },
    {
        id: 8,
        question: "Les produits sont-ils neufs ou reconditionnés?",
        answer: "Tous nos produits sont 100% neufs avec garantie constructeur. Nous ne vendons pas de matériel reconditionné."
    }
];

const FAQ: React.FC = () => {
    const [openId, setOpenId] = useState<number | null>(null);

    const toggleFAQ = (id: number) => {
        setOpenId(openId === id ? null : id);
    };

    return (
        <section className="py-16 md:py-24 bg-white">
            <div className="container mx-auto px-4 md:px-6">
                <div className="text-center mb-10 md:mb-16">
                    <h2 className="text-2xl md:text-4xl font-bold text-black mb-2 md:mb-4">
                        Questions Fréquentes.
                    </h2>
                    <p className="text-gray-500 text-sm md:text-base">
                        Trouvez rapidement les réponses à vos questions.
                    </p>
                </div>

                <div className="max-w-3xl mx-auto">
                    <div className="space-y-4">
                        {faqData.map((faq) => (
                            <div
                                key={faq.id}
                                className="bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 hover:border-gray-200 transition-all"
                            >
                                <button
                                    onClick={() => toggleFAQ(faq.id)}
                                    className="w-full px-6 py-5 flex items-center justify-between text-left focus:outline-none group"
                                    aria-expanded={openId === faq.id}
                                >
                                    <span className="text-base md:text-lg font-medium text-black pr-4">
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
                                    className={`overflow-hidden transition-all duration-300 ${openId === faq.id ? 'max-h-96' : 'max-h-0'
                                        }`}
                                >
                                    <div className="px-6 pb-5 text-gray-600 leading-relaxed">
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
                            >
                                <i className="fa-brands fa-whatsapp"></i>
                                Contactez-nous sur WhatsApp
                            </a>
                            <a
                                href="mailto:professionalanass@gmail.com"
                                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-black text-white rounded-full hover:bg-gray-800 transition-colors font-medium"
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
