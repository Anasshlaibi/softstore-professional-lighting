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

    const resolvedImage = image.trim() || (gallery.length > 0 ? gallery[0] : '/images/products/default-gear.webp');

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
        image: resolvedImage,
        gallery: gallery.length > 0 ? gallery : [resolvedImage],
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-zinc-900 border border-zinc-800 text-white rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 bg-zinc-950 border-b border-zinc-800 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-600/20 text-red-500 border border-red-500/30 flex items-center justify-center font-bold text-lg">
              <i className="fa-solid fa-box-open"></i>
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-white">
                {isEdit ? `Éditer: ${product?.name}` : 'Nouveau Produit Équipement'}
              </h2>
              <p className="text-xs text-zinc-400">
                Mise à jour en temps réel sur la base de données Supabase GearShop
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center text-zinc-300 hover:text-white transition"
            aria-label="Fermer"
          >
            <i className="fa-solid fa-xmark text-lg"></i>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {error && (
            <div className="p-4 bg-red-950/60 border border-red-700 text-red-300 text-sm rounded-xl flex items-center gap-3">
              <i className="fa-solid fa-triangle-exclamation text-lg text-red-400"></i>
              <span>{error}</span>
            </div>
          )}

          {/* Classification & Group */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-zinc-950/70 p-4 rounded-2xl border border-zinc-800">
            <div>
              <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-2">
                État / Origine
              </label>
              <select
                value={productGroup}
                onChange={e => setProductGroup(e.target.value as any)}
                className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-xl p-2.5 text-sm font-semibold focus:border-red-500 outline-none"
              >
                <option value="new" className="bg-zinc-900 text-white">Matériel Neuf 🆕</option>
                <option value="used" className="bg-zinc-900 text-white">Matériel d'Occasion ♻️</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-2">
                Type d'Équipement
              </label>
              <select
                value={productType}
                onChange={e => setProductType(e.target.value as any)}
                className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-xl p-2.5 text-sm font-semibold focus:border-red-500 outline-none"
              >
                <option value="lens" className="bg-zinc-900 text-white">Objectif / Lentille 📷</option>
                <option value="camera" className="bg-zinc-900 text-white">Boîtier / Caméra 🎥</option>
                <option value="light" className="bg-zinc-900 text-white">Éclairage & Flash 💡</option>
                <option value="filter" className="bg-zinc-900 text-white">Filtre Optique 🔍</option>
                <option value="adapter" className="bg-zinc-900 text-white">Bague / Adaptateur ⚙️</option>
                <option value="accessory" className="bg-zinc-900 text-white">Accessoire Studio / Rig 🎒</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-2">
                Marque Constructeur
              </label>
              <input
                type="text"
                value={brand}
                onChange={e => setBrand(e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-xl p-2.5 text-sm font-medium focus:border-red-500 outline-none placeholder-zinc-500"
                placeholder="Ex: 7Artisans, Canon, Sony..."
              />
            </div>
          </div>

          {/* Basic Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-2">
                Titre du Produit
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-xl p-3 text-base font-bold focus:border-red-500 outline-none transition placeholder-zinc-500"
                placeholder="Ex: 35mm F1.4 Mark III Full Frame"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-2">
                Catégorie Boutique
              </label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-xl p-3 text-sm font-semibold focus:border-red-500 outline-none"
              >
                <option value="Objectifs Photo" className="bg-zinc-900 text-white">Objectifs Photo</option>
                <option value="Lentilles Cinéma" className="bg-zinc-900 text-white">Lentilles Cinéma</option>
                <option value="Matériel Studio" className="bg-zinc-900 text-white">Matériel Studio</option>
                <option value="Éclairage Portable" className="bg-zinc-900 text-white">Éclairage Portable</option>
                <option value="Accessoires" className="bg-zinc-900 text-white">Accessoires</option>
                <option value="Occasion" className="bg-zinc-900 text-white">Occasion / Seconde Main</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-2">
                Monture Compatible
              </label>
              <select
                value={mount}
                onChange={e => setMount(e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-xl p-3 text-sm font-semibold focus:border-red-500 outline-none"
              >
                <option value="Sony E" className="bg-zinc-900 text-white">Sony E Mount</option>
                <option value="Canon RF" className="bg-zinc-900 text-white">Canon EOS-R (RF)</option>
                <option value="Canon EF" className="bg-zinc-900 text-white">Canon EF / EF-S</option>
                <option value="Nikon Z" className="bg-zinc-900 text-white">Nikon Z Mount</option>
                <option value="Fuji FX" className="bg-zinc-900 text-white">Fujifilm X Mount</option>
                <option value="L Mount" className="bg-zinc-900 text-white">Panasonic / Leica L Mount</option>
                <option value="M43" className="bg-zinc-900 text-white">Panasonic / Olympus M43</option>
                <option value="PL Mount" className="bg-zinc-900 text-white">ARRI / Cinema PL Mount</option>
                <option value="Universal" className="bg-zinc-900 text-white">Universel / Multi-monture</option>
              </select>
            </div>
          </div>

          {/* Pricing & Stock */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 bg-zinc-950/70 p-4 rounded-2xl border border-zinc-800">
            <div>
              <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-2">
                Prix Vente (MAD)
              </label>
              <input
                type="number"
                required
                value={price}
                onChange={e => setPrice(e.target.value ? Number(e.target.value) : '')}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl p-3 font-black text-emerald-400 focus:border-emerald-500 outline-none"
                placeholder="Ex: 2490"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-2">
                Ancien Prix (Barré)
              </label>
              <input
                type="number"
                value={oldPrice}
                onChange={e => setOldPrice(e.target.value ? Number(e.target.value) : '')}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl p-3 font-semibold text-zinc-400 line-through focus:border-red-500 outline-none"
                placeholder="Ex: 2990"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-2">
                Prix Location / Jour
              </label>
              <input
                type="number"
                value={rentPrice}
                onChange={e => setRentPrice(e.target.value ? Number(e.target.value) : '')}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl p-3 font-bold text-cyan-400 focus:border-cyan-500 outline-none"
                placeholder="Ex: 200"
              />
            </div>

            <div className="flex flex-col justify-center gap-2">
              <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider">
                Disponibilité & Précommande
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => { setInStock(!inStock); if (!inStock) setIsPreorder(false); }}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                    inStock ? 'bg-emerald-600 text-white shadow-xs' : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                  }`}
                >
                  <i className={`fa-solid ${inStock ? 'fa-check-circle' : 'fa-circle-xmark'}`}></i>
                  {inStock ? 'En Stock' : 'Hors Stock'}
                </button>
                <button
                  type="button"
                  onClick={() => { setIsPreorder(!isPreorder); if (!isPreorder) setInStock(false); }}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                    isPreorder ? 'bg-blue-600 text-white shadow-xs' : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
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
            <div className="bg-zinc-950/70 border border-zinc-800 p-4 rounded-2xl space-y-4">
              <h4 className="text-xs font-bold text-blue-400 uppercase tracking-wider flex items-center gap-2">
                <i className="fa-solid fa-camera"></i> Spécifications Optiques (Objectif)
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">Focale</label>
                  <input
                    type="text"
                    value={focalLength}
                    onChange={e => setFocalLength(e.target.value)}
                    className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-xl p-2.5 text-sm focus:border-red-500 outline-none"
                    placeholder="Ex: 35mm, 10-18mm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">Ouverture Max</label>
                  <input
                    type="text"
                    value={aperture}
                    onChange={e => setAperture(e.target.value)}
                    className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-xl p-2.5 text-sm focus:border-red-500 outline-none"
                    placeholder="Ex: F1.4, T2.1"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">Mise au Point</label>
                  <select
                    value={focusType}
                    onChange={e => setFocusType(e.target.value)}
                    className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-xl p-2.5 text-sm focus:border-red-500 outline-none"
                  >
                    <option value="Manuel" className="bg-zinc-900 text-white">Manuel (MF)</option>
                    <option value="Autofocus" className="bg-zinc-900 text-white">Autofocus (AF)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Dynamic Used Equipment Specs */}
          {productGroup === 'used' && (
            <div className="bg-zinc-950/70 border border-amber-900/50 p-4 rounded-2xl space-y-4">
              <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
                <i className="fa-solid fa-recycle"></i> Détails Matériel d'Occasion
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">Note d'État Cosmétique</label>
                  <input
                    type="text"
                    value={conditionRating}
                    onChange={e => setConditionRating(e.target.value)}
                    className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-xl p-2.5 text-sm focus:border-red-500 outline-none"
                    placeholder="Ex: 9/10 (Traces d'usage minimes)"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">Nombre de Déclenchements (Si Caméra)</label>
                  <input
                    type="text"
                    value={shutterCount}
                    onChange={e => setShutterCount(e.target.value)}
                    className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-xl p-2.5 text-sm focus:border-red-500 outline-none"
                    placeholder="Ex: 14 200 déclenchements"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">Garantie Offerte</label>
                  <input
                    type="text"
                    value={warranty}
                    onChange={e => setWarranty(e.target.value)}
                    className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-xl p-2.5 text-sm focus:border-red-500 outline-none"
                    placeholder="Ex: 3 Mois Garantie GearShop"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">Accessoires Inclus</label>
                  <input
                    type="text"
                    value={accessories}
                    onChange={e => setAccessories(e.target.value)}
                    className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-xl p-2.5 text-sm focus:border-red-500 outline-none"
                    placeholder="Ex: Boîte, Chargeur, 2 Batteries"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Main Image & Gallery */}
          <div className="space-y-4 bg-zinc-950/70 p-4 rounded-2xl border border-zinc-800">
            <div>
              <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-2">
                Image Principale (URL Web ou chemin /images/...)
              </label>
              <div className="flex gap-3 items-center">
                {image && (
                  <div className="w-14 h-14 rounded-xl bg-white p-1 border border-zinc-700 overflow-hidden shrink-0 flex items-center justify-center">
                    <img src={image} alt="Aperçu" className="w-full h-full object-contain" onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }} />
                  </div>
                )}
                <input
                  type="text"
                  value={image}
                  onChange={e => {
                    setImage(e.target.value);
                    if (gallery.length === 0 && e.target.value) setGallery([e.target.value]);
                  }}
                  className="flex-1 bg-zinc-800 border border-zinc-700 text-white rounded-xl p-3 text-sm focus:border-red-500 outline-none placeholder-zinc-500 font-mono text-xs"
                  placeholder="https://... ou /images/products/..."
                />
              </div>
            </div>

            {/* Gallery Previews */}
            <div>
              <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-2">
                Galerie Photos Additionnelles ({gallery.length})
              </label>
              
              {gallery.length > 0 && (
                <div className="flex gap-3 mb-3 overflow-x-auto py-2 no-scrollbar">
                  {gallery.map((url, idx) => (
                    <div key={idx} className="relative w-16 h-16 rounded-xl bg-white border border-zinc-700 overflow-hidden shrink-0 group">
                      <img src={url} alt={`Vue ${idx + 1}`} className="w-full h-full object-contain p-1" />
                      <button
                        type="button"
                        onClick={() => handleRemoveGalleryImage(idx)}
                        className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center opacity-90 hover:opacity-100 shadow"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex gap-2">
                <input
                  type="text"
                  value={newGalleryInput}
                  onChange={e => setNewGalleryInput(e.target.value)}
                  className="flex-1 bg-zinc-800 border border-zinc-700 text-white rounded-xl p-2.5 text-xs focus:border-red-500 outline-none placeholder-zinc-500 font-mono"
                  placeholder="Coller l'URL d'une nouvelle photo / vue..."
                />
                <button
                  type="button"
                  onClick={handleAddGalleryImage}
                  className="px-4 py-2.5 bg-zinc-700 hover:bg-zinc-600 text-white rounded-xl text-xs font-bold transition shrink-0"
                >
                  + Ajouter Vue
                </button>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-2">
              Description Détaillée du Produit
            </label>
            <textarea
              rows={4}
              value={desc}
              onChange={e => setDesc(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-xl p-3 text-sm focus:border-red-500 outline-none placeholder-zinc-500"
              placeholder="Description commerciale et caractéristiques techniques du produit..."
            ></textarea>
          </div>

          {/* Admin SEO Overrides */}
          <div className="bg-zinc-950/70 border border-purple-900/40 p-5 rounded-2xl space-y-4">
            <h4 className="text-xs font-bold text-purple-400 uppercase tracking-wider flex items-center gap-2">
              <i className="fa-solid fa-magnifying-glass"></i> Surcharges SEO Manuelles (Priorité Administrateur)
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">Titre SEO Personnalisé</label>
                <input
                  type="text"
                  value={seoTitle}
                  onChange={e => setSeoTitle(e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-xl p-2.5 text-xs focus:border-purple-500 outline-none placeholder-zinc-500"
                  placeholder="Laisser vide pour générer automatiquement"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">Méta Description Personnalisée</label>
                <input
                  type="text"
                  value={metaDescription}
                  onChange={e => setMetaDescription(e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-xl p-2.5 text-xs focus:border-purple-500 outline-none placeholder-zinc-500"
                  placeholder="Laisser vide pour générer automatiquement"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-zinc-300 mb-1">Introduction SEO Personnalisée</label>
                <textarea
                  rows={2}
                  value={seoIntro}
                  onChange={e => setSeoIntro(e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-xl p-2.5 text-xs focus:border-purple-500 outline-none placeholder-zinc-500"
                  placeholder="Laisser vide pour générer automatiquement"
                ></textarea>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-zinc-300 mb-1">Alias de Recherche Séparés par des Virgules</label>
                <input
                  type="text"
                  value={searchAliasesInput}
                  onChange={e => setSearchAliasesInput(e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-xl p-2.5 text-xs focus:border-purple-500 outline-none placeholder-zinc-500"
                  placeholder="Ex: 50mm f1.2, sony 50mm, lens e-mount"
                />
              </div>
            </div>
          </div>

          {/* Footer Submit Buttons */}
          <div className="pt-4 border-t border-zinc-800 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 rounded-xl border border-zinc-700 text-sm font-bold text-zinc-300 hover:bg-zinc-800 hover:text-white transition"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-8 py-3 rounded-xl bg-red-600 text-white text-sm font-bold hover:bg-red-700 transition shadow-lg shadow-red-950/50 flex items-center gap-2 disabled:opacity-50"
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
