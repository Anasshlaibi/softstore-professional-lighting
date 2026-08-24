import React, { useState, useEffect } from 'react';
import { Product } from '../../../App';
import { ProductFormData } from '../../services/productService';

interface ProductEditorModalProps {
  isOpen: boolean;
  product?: Product | null;
  onClose: () => void;
  onSave: (data: ProductFormData) => Promise<void>;
}

export const ProductEditorModal: React.FC<ProductEditorModalProps> = ({
  isOpen,
  product,
  onClose,
  onSave,
}) => {
  const isEdit = !!product;

  const [name, setName] = useState('');
  const [price, setPrice] = useState<number | ''>('');
  const [oldPrice, setOldPrice] = useState<number | ''>('');
  const [rentPrice, setRentPrice] = useState<number | ''>('');
  const [category, setCategory] = useState('Lentilles Cinéma');
  const [brand, setBrand] = useState('7Artisans');
  const [productGroup, setProductGroup] = useState<'new' | 'used'>('new');
  const [productType, setProductType] = useState<'lens' | 'camera' | 'light' | 'filter' | 'adapter' | 'accessory'>('lens');
  const [mount, setMount] = useState('Sony E');
  const [image, setImage] = useState('');
  const [gallery, setGallery] = useState<string[]>([]);
  const [newGalleryInput, setNewGalleryInput] = useState('');
  const [inStock, setInStock] = useState(true);
  const [desc, setDesc] = useState('');

  // Specs state
  const [focalLength, setFocalLength] = useState('35mm');
  const [aperture, setAperture] = useState('F1.4');
  const [focusType, setFocusType] = useState('Manuel');
  const [filterSize, setFilterSize] = useState('55mm');
  const [conditionRating, setConditionRating] = useState('9/10 (Excellent)');
  const [shutterCount, setShutterCount] = useState('');
  const [warranty, setWarranty] = useState('3 Mois Garantie GearShop');
  const [accessories, setAccessories] = useState('Boîte d\'origine, Bouchons avant/arrière');

  // SEO Overrides State
  const [isPreorder, setIsPreorder] = useState(false);
  const [seoTitle, setSeoTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [seoIntro, setSeoIntro] = useState('');
  const [searchAliasesInput, setSearchAliasesInput] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (product) {
      setName(product.name || '');
      setPrice(product.price || 0);
      setOldPrice(product.oldPrice || '');
      setRentPrice(product.rentPrice || '');
      setCategory(product.category || 'Lentilles Cinéma');
      setBrand((product as any).brand || '7Artisans');
      setProductGroup((product as any).product_group || 'new');
      setProductType((product as any).product_type || 'lens');
      setMount(product.mount || 'Sony E');
      setImage(product.image || '');
      setGallery(Array.isArray(product.gallery) && product.gallery.length > 0 ? product.gallery : [product.image || '']);
      setInStock(product.inStock !== false);
      setIsPreorder(product.isPreorder === true || (product as any).status === 'Précommande');
      setDesc(product.desc || '');

      setSeoTitle(product.seo_title || '');
      setMetaDescription(product.meta_description || '');
      setSeoIntro(product.seo_intro || '');
      setSearchAliasesInput(Array.isArray(product.search_aliases) ? product.search_aliases.join(', ') : '');

      const specs = (product as any).technical_specs || {};
      const used = (product as any).used_attributes || {};

      setFocalLength(specs.focal_length || '35mm');
      setAperture(specs.aperture || 'F1.4');
      setFocusType(specs.focus_type || 'Manuel');
      setFilterSize(specs.filter_size || '55mm');

      setConditionRating((product as any).condition_rating || used.condition_rating || '9/10 (Excellent)');
      setShutterCount(used.shutter_count || '');
      setWarranty(used.warranty || '3 Mois Garantie GearShop');
      setAccessories(used.accessories || 'Boîte d\'origine, Bouchons avant/arrière');
    } else {
      setName('');
      setPrice('');
      setOldPrice('');
      setRentPrice('');
      setCategory('Lentilles Cinéma');
      setBrand('7Artisans');
      setProductGroup('new');
      setProductType('lens');
      setMount('Sony E');
      setImage('');
      setGallery([]);
      setNewGalleryInput('');
      setInStock(true);
      setIsPreorder(false);
      setDesc('');

      setSeoTitle('');
      setMetaDescription('');
      setSeoIntro('');
      setSearchAliasesInput('');

      setFocalLength('35mm');
      setAperture('F1.4');
      setFocusType('Manuel');
      setFilterSize('55mm');
      setConditionRating('9/10 (Excellent)');
      setShutterCount('');
      setWarranty('3 Mois Garantie GearShop');
      setAccessories('Boîte d\'origine, Bouchons avant/arrière');
    }
  }, [product, isOpen]);

  if (!isOpen) return null;

  const handleAddGalleryImage = () => {
    if (newGalleryInput.trim() && !gallery.includes(newGalleryInput.trim())) {
      setGallery(prev => [...prev, newGalleryInput.trim()]);
      setNewGalleryInput('');
    }
  };

  const handleRemoveGalleryImage = (idx: number) => {
    setGallery(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Veuillez saisir un nom de produit.');
      return;
    }

    if (price === '' || isNaN(Number(price))) {
      setError('Veuillez saisir un prix valide.');
      return;
    }

    if (!image.trim()) {
      setError('Veuillez fournir l\'URL de l\'image principale.');
      return;
    }

    setIsSubmitting(true);

    try {
      const technical_specs: Record<string, any> = {
        focal_length: focalLength,
        aperture: aperture,
        focus_type: focusType,
        filter_size: filterSize,
      };

      const used_attributes: Record<string, any> = {
        condition_rating: conditionRating,
        shutter_count: shutterCount,
        warranty: warranty,
        accessories: accessories,
      };

      const formData: ProductFormData = {
        id: product?.id,
        name: name.trim(),
        price: Number(price),
        oldPrice: oldPrice !== '' ? Number(oldPrice) : undefined,
        rentPrice: rentPrice !== '' ? Number(rentPrice) : undefined,
        category,
        brand,
        product_group: productGroup,
        product_type: productType,
        mount,
        image: image.trim(),
        gallery: gallery.length > 0 ? gallery : [image.trim()],
        inStock,
        isPreorder,
        desc: desc.trim(),
        condition_rating: productGroup === 'used' ? conditionRating : undefined,
        technical_specs,
        used_attributes: productGroup === 'used' ? used_attributes : {},
        seo_title: seoTitle.trim() || undefined,
        meta_description: metaDescription.trim() || undefined,
        seo_intro: seoIntro.trim() || undefined,
        search_aliases: searchAliasesInput ? searchAliasesInput.split(',').map(s => s.trim()).filter(Boolean) : undefined,
        active: true,
      };

      await onSave(formData);
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Erreur lors de l\'enregistrement du produit');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 bg-gray-900 text-white flex justify-between items-center border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-600 flex items-center justify-center font-bold">
              <i className="fa-solid fa-box-open text-lg"></i>
            </div>
            <div>
              <h2 className="text-xl font-bold">
                {isEdit ? `Éditer: ${product?.name}` : 'Nouveau Produit Équipement'}
              </h2>
              <p className="text-xs text-gray-400">
                Mise à jour en temps réel sur la base de données Supabase GearShop
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-gray-800 hover:bg-gray-700 flex items-center justify-center text-gray-300 hover:text-white transition"
            aria-label="Fermer"
          >
            <i className="fa-solid fa-xmark text-lg"></i>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {error && (
            <div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm rounded-lg flex items-center gap-3">
              <i className="fa-solid fa-triangle-exclamation text-lg"></i>
              <span>{error}</span>
            </div>
          )}

          {/* Classification & Group */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50 p-4 rounded-2xl border border-gray-100">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                État / Origine
              </label>
              <select
                value={productGroup}
                onChange={e => setProductGroup(e.target.value as any)}
                className="w-full bg-white border border-gray-200 rounded-xl p-2.5 text-sm font-bold focus:border-black outline-none"
              >
                <option value="new">Matériel Neuf 🆕</option>
                <option value="used">Matériel d'Occasion ♻️</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                Type d'Équipement
              </label>
              <select
                value={productType}
                onChange={e => setProductType(e.target.value as any)}
                className="w-full bg-white border border-gray-200 rounded-xl p-2.5 text-sm font-bold focus:border-black outline-none"
              >
                <option value="lens">Objectif / Lentille 📷</option>
                <option value="camera">Boîtier / Caméra 🎥</option>
                <option value="light">Éclairage & Flash 💡</option>
                <option value="filter">Filtre Optique 🔍</option>
                <option value="adapter">Bague / Adaptateur ⚙️</option>
                <option value="accessory">Accessoire Studio / Rig 🎒</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                Marque Constructeur
              </label>
              <input
                type="text"
                value={brand}
                onChange={e => setBrand(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-xl p-2.5 text-sm font-medium focus:border-black outline-none"
                placeholder="Ex: 7Artisans, Canon, Sony..."
              />
            </div>
          </div>

          {/* Basic Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                Titre du Produit
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-base font-bold text-black focus:bg-white focus:border-black outline-none transition"
                placeholder="Ex: 35mm F1.4 Mark III Full Frame"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                Catégorie Boutique
              </label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="w-full bg-white border border-gray-300 rounded-xl p-3 text-sm font-bold text-gray-900 focus:border-black outline-none"
              >
                <option value="Objectifs Photo" className="text-gray-900 bg-white font-medium">Objectifs Photo</option>
                <option value="Lentilles Cinéma" className="text-gray-900 bg-white font-medium">Lentilles Cinéma</option>
                <option value="Matériel Studio" className="text-gray-900 bg-white font-medium">Matériel Studio</option>
                <option value="Éclairage Portable" className="text-gray-900 bg-white font-medium">Éclairage Portable</option>
                <option value="Accessoires" className="text-gray-900 bg-white font-medium">Accessoires</option>
                <option value="Occasion" className="text-gray-900 bg-white font-medium">Occasion / Seconde Main</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                Monture Compatible
              </label>
              <select
                value={mount}
                onChange={e => setMount(e.target.value)}
                className="w-full bg-white border border-gray-300 rounded-xl p-3 text-sm font-bold text-gray-900 focus:border-black outline-none"
              >
                <option value="Sony E" className="text-gray-900 bg-white font-medium">Sony E Mount</option>
                <option value="Canon RF" className="text-gray-900 bg-white font-medium">Canon EOS-R (RF)</option>
                <option value="Canon EF" className="text-gray-900 bg-white font-medium">Canon EF / EF-S</option>
                <option value="Nikon Z" className="text-gray-900 bg-white font-medium">Nikon Z Mount</option>
                <option value="Fuji FX" className="text-gray-900 bg-white font-medium">Fujifilm X Mount</option>
                <option value="L Mount" className="text-gray-900 bg-white font-medium">Panasonic / Leica L Mount</option>
                <option value="M43" className="text-gray-900 bg-white font-medium">Panasonic / Olympus M43</option>
                <option value="PL Mount" className="text-gray-900 bg-white font-medium">ARRI / Cinema PL Mount</option>
                <option value="Universal" className="text-gray-900 bg-white font-medium">Universel / Multi-monture</option>
              </select>
            </div>
          </div>

          {/* Pricing & Stock */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 bg-gray-50 p-4 rounded-2xl border border-gray-100">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                Prix Vente (MAD)
              </label>
              <input
                type="number"
                required
                value={price}
                onChange={e => setPrice(e.target.value ? Number(e.target.value) : '')}
                className="w-full bg-white border border-gray-200 rounded-xl p-3 font-black text-green-600 focus:border-black outline-none"
                placeholder="Ex: 2490"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                Ancien Prix (Barre)
              </label>
              <input
                type="number"
                value={oldPrice}
                onChange={e => setOldPrice(e.target.value ? Number(e.target.value) : '')}
                className="w-full bg-white border border-gray-200 rounded-xl p-3 font-bold text-gray-400 focus:border-black outline-none"
                placeholder="Ex: 2990"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                Prix Location / Jour
              </label>
              <input
                type="number"
                value={rentPrice}
                onChange={e => setRentPrice(e.target.value ? Number(e.target.value) : '')}
                className="w-full bg-white border border-gray-200 rounded-xl p-3 font-bold text-blue-600 focus:border-black outline-none"
                placeholder="Ex: 200"
              />
            </div>

            <div className="flex flex-col justify-center gap-2">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">
                Disponibilité & Précommande
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => { setInStock(!inStock); if (!inStock) setIsPreorder(false); }}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                    inStock ? 'bg-green-600 text-white shadow-xs' : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  <i className={`fa-solid ${inStock ? 'fa-check-circle' : 'fa-circle-xmark'}`}></i>
                  {inStock ? 'En Stock' : 'Hors Stock'}
                </button>
                <button
                  type="button"
                  onClick={() => { setIsPreorder(!isPreorder); if (!isPreorder) setInStock(false); }}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                    isPreorder ? 'bg-blue-600 text-white shadow-xs' : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  <i className="fa-solid fa-clock"></i>
                  {isPreorder ? 'Précommande' : 'Précom: Non'}
                </button>
              </div>
            </div>
          </div>

          {/* Dynamic Technical Specs */}
          {productType === 'lens' && (
            <div className="bg-blue-50/60 border border-blue-100 p-4 rounded-2xl space-y-4">
              <h4 className="text-xs font-bold text-blue-800 uppercase tracking-wider flex items-center gap-2">
                <i className="fa-solid fa-camera"></i> Spécifications Optiques (Objectif)
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Focale</label>
                  <input
                    type="text"
                    value={focalLength}
                    onChange={e => setFocalLength(e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-xl p-2.5 text-sm"
                    placeholder="Ex: 35mm, 10-18mm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Ouverture Max</label>
                  <input
                    type="text"
                    value={aperture}
                    onChange={e => setAperture(e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-xl p-2.5 text-sm"
                    placeholder="Ex: F1.4, T2.1"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Mise au Point</label>
                  <select
                    value={focusType}
                    onChange={e => setFocusType(e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-xl p-2.5 text-sm"
                  >
                    <option value="Manuel">Manuel (MF)</option>
                    <option value="Autofocus">Autofocus (AF)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Dynamic Used Equipment Specs */}
          {productGroup === 'used' && (
            <div className="bg-amber-50/70 border border-amber-200 p-4 rounded-2xl space-y-4">
              <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wider flex items-center gap-2">
                <i className="fa-solid fa-recycle"></i> Détails Matériel d'Occasion
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Note d'État Cosmétique</label>
                  <input
                    type="text"
                    value={conditionRating}
                    onChange={e => setConditionRating(e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-xl p-2.5 text-sm"
                    placeholder="Ex: 9/10 (Traces d'usage minimes)"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Nombre de Déclenchements (Si Caméra)</label>
                  <input
                    type="text"
                    value={shutterCount}
                    onChange={e => setShutterCount(e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-xl p-2.5 text-sm"
                    placeholder="Ex: 14 200 déclenchements"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Garantie Offerte</label>
                  <input
                    type="text"
                    value={warranty}
                    onChange={e => setWarranty(e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-xl p-2.5 text-sm"
                    placeholder="Ex: 3 Mois Garantie GearShop"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Accessoires Inclus</label>
                  <input
                    type="text"
                    value={accessories}
                    onChange={e => setAccessories(e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-xl p-2.5 text-sm"
                    placeholder="Ex: Boîte, Chargeur, 2 Batteries"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Main Image & Gallery */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                URL Image Principale (Couverture)
              </label>
              <input
                type="url"
                required
                value={image}
                onChange={e => {
                  setImage(e.target.value);
                  if (gallery.length === 0) setGallery([e.target.value]);
                }}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:bg-white focus:border-black outline-none"
                placeholder="https://cdn.shopify.com/s/files/...jpg"
              />
            </div>

            {/* Gallery Previews */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                Galerie Photos Additionnelles ({gallery.length})
              </label>
              
              <div className="flex gap-3 mb-3 overflow-x-auto py-2 no-scrollbar">
                {gallery.map((url, idx) => (
                  <div key={idx} className="relative w-20 h-20 rounded-xl border border-gray-200 overflow-hidden shrink-0 group">
                    <img src={url} alt={`Vue ${idx + 1}`} className="w-full h-full object-contain p-1" />
                    <button
                      type="button"
                      onClick={() => handleRemoveGalleryImage(idx)}
                      className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center opacity-80 hover:opacity-100"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <input
                  type="url"
                  value={newGalleryInput}
                  onChange={e => setNewGalleryInput(e.target.value)}
                  className="flex-1 bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-sm focus:bg-white focus:border-black outline-none"
                  placeholder="Coller l'URL d'une nouvelle vue..."
                />
                <button
                  type="button"
                  onClick={handleAddGalleryImage}
                  className="px-4 py-2.5 bg-black text-white rounded-xl text-xs font-bold hover:bg-gray-800 transition shrink-0"
                >
                  + Ajouter Vue
                </button>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
              Description Détaillée du Produit
            </label>
            <textarea
              rows={4}
              value={desc}
              onChange={e => setDesc(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:bg-white focus:border-black outline-none"
              placeholder="Description commerciale et caractéristiques techniques du produit..."
            ></textarea>
          </div>

          {/* Admin SEO Overrides (Priority: Admin override > Generated > Fallback) */}
          <div className="bg-purple-50/60 border border-purple-100 p-5 rounded-2xl space-y-4">
            <h4 className="text-xs font-bold text-purple-900 uppercase tracking-wider flex items-center gap-2">
              <i className="fa-solid fa-magnifying-glass font-bold"></i> Surcharges SEO Manuelles (Priorité Administrateur)
            </h4>
            <p className="text-xs text-purple-700">
              Ces champs remplacent les valeurs générées automatiquement. Laissez vide pour utiliser la génération automatique à partir des caractéristiques produit.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Titre SEO Personnalisé (Balise Title)</label>
                <input
                  type="text"
                  value={seoTitle}
                  onChange={e => setSeoTitle(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-xl p-2.5 text-xs focus:border-purple-600 outline-none"
                  placeholder="Laisser vide pour générer automatiquement"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Méta Description Personnalisée</label>
                <input
                  type="text"
                  value={metaDescription}
                  onChange={e => setMetaDescription(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-xl p-2.5 text-xs focus:border-purple-600 outline-none"
                  placeholder="Laisser vide pour générer automatiquement"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-gray-700 mb-1">Introduction SEO Personnalisée (Présentation)</label>
                <textarea
                  rows={2}
                  value={seoIntro}
                  onChange={e => setSeoIntro(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-xl p-2.5 text-xs focus:border-purple-600 outline-none"
                  placeholder="Laisser vide pour générer automatiquement"
                ></textarea>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-gray-700 mb-1">Alias de Recherche Séparés par des Virgules</label>
                <input
                  type="text"
                  value={searchAliasesInput}
                  onChange={e => setSearchAliasesInput(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-xl p-2.5 text-xs focus:border-purple-600 outline-none"
                  placeholder="Ex: dji pocket 4, osmo pocket 4, pocket 4 pro"
                />
              </div>
            </div>
          </div>

          {/* Footer Submit Buttons */}
          <div className="pt-4 border-t border-gray-200 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 rounded-xl border border-gray-300 text-sm font-bold text-gray-700 hover:bg-gray-100 transition"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-8 py-3 rounded-xl bg-red-600 text-white text-sm font-bold hover:bg-red-700 transition shadow-lg flex items-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <i className="fa-solid fa-spinner fa-spin"></i> Enregistrement...
                </>
              ) : (
                <>
                  <i className="fa-solid fa-cloud-arrow-up"></i>
                  {isEdit ? 'Mettre à Jour' : 'Publier sur la Boutique'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
