import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Product } from '../../App';
import {
  lookupClientOrdersInSupabase,
  saveErpDocumentToSupabase,
  subscribeNewsletter,
  createContactLead,
  QuoteRequestItem,
} from '../services/leadService';
import { openAndPrintDevisOrInvoice, ErpDocumentPayload } from '../utils/devisInvoiceGenerator';

const CLIENT_PROFILE_KEY = 'gearshop_client_profile_v1';

interface ClientProfile {
  fullName: string;
  email: string;
  phone: string;
  company?: string;
  ice?: string;
  rcOrIf?: string;
  billingAddress?: string;
  city?: string;
}

interface ClientOrderTrackingPageProps {
  products?: Product[];
}

const ORDER_STEPS = [
  {
    status: 'New',
    step: 1,
    title: '1. Devis / Commande à Confirmer',
    desc: 'Enregistré. Veuillez envoyer ce devis au responsable pour validation.',
    icon: 'fa-hourglass-half',
  },
  {
    status: 'Contacted',
    step: 2,
    title: '2. Confirmé & Validé par le Responsable',
    desc: 'Stock vérifié et Devis Officiel VERDANOVE cacheté débloqué.',
    icon: 'fa-circle-check',
  },
  {
    status: 'Negotiating',
    step: 3,
    title: '3. Paiement Confirmé & En Préparation',
    desc: 'Règlement validé, contrôle matériel et emballage à Casablanca.',
    icon: 'fa-credit-card',
  },
  {
    status: 'Waiting',
    step: 4,
    title: '4. En Cours de Livraison Express',
    desc: 'Expédié via transporteur express (24h-48h) vers votre adresse.',
    icon: 'fa-truck-fast',
  },
  {
    status: 'Won',
    step: 5,
    title: '5. Payé & Livré (Garantie 1 An Active)',
    desc: 'Matériel livré et payé. Garantie constructeur 1 an active.',
    icon: 'fa-award',
  },
];

function getStepNumber(status: string): number {
  switch (status) {
    case 'New':
      return 1;
    case 'Contacted':
      return 2;
    case 'Negotiating':
      return 3;
    case 'Waiting':
      return 4;
    case 'Won':
      return 5;
    case 'Lost':
      return -1;
    default:
      return 1;
  }
}

function loadSavedClientProfile(): ClientProfile | null {
  try {
    const raw = localStorage.getItem(CLIENT_PROFILE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function persistClientProfile(profile: ClientProfile): void {
  try {
    localStorage.setItem(CLIENT_PROFILE_KEY, JSON.stringify(profile));
  } catch {
    // ignore storage errors
  }
}

export const ClientOrderTrackingPage: React.FC<ClientOrderTrackingPageProps> = ({
  products = [],
}) => {
  const [searchParams] = useSearchParams();
  const initialRef = searchParams.get('ref') || '';
  const initialTel = searchParams.get('tel') || '';
  const initialTabParam = searchParams.get('tab');

  const [savedProfile, setSavedProfile] = useState<ClientProfile | null>(() =>
    loadSavedClientProfile()
  );

  const [activeTab, setActiveTab] = useState<'account' | 'devis' | 'orders'>(() => {
    if (initialRef || initialTel) return 'orders';
    if (initialTabParam === 'devis') return 'devis';
    if (initialTabParam === 'orders') return 'orders';
    if (loadSavedClientProfile()) return 'orders';
    return 'account';
  });

  // Lookup & Orders state
  const [phoneInput, setPhoneInput] = useState<string>(initialTel || savedProfile?.phone || '');
  const [refInput, setRefInput] = useState<string>(initialRef);
  const [orders, setOrders] = useState<QuoteRequestItem[]>([]);
  const [orderFilter, setOrderFilter] = useState<'all' | 'pending' | 'active' | 'won'>('all');
  const [loading, setLoading] = useState<boolean>(false);
  const [searchedOnce, setSearchedOnce] = useState<boolean>(false);

  // Client Account Login / Register / Forgot / Reset state
  const [authUserEmail, setAuthUserEmail] = useState<string | null>(
    () => savedProfile?.email || null
  );
  const [authMode, setAuthMode] = useState<'register' | 'login' | 'forgot' | 'reset_password'>('login');
  const [isEmailConfirmed, setIsEmailConfirmed] = useState<boolean>(false);
  const [needsEmailConfirmation, setNeedsEmailConfirmation] = useState<boolean>(false);
  const [authNameInput, setAuthNameInput] = useState<string>(savedProfile?.fullName || '');
  const [authPhoneInput, setAuthPhoneInput] = useState<string>(savedProfile?.phone || '');
  const [authCompanyInput, setAuthCompanyInput] = useState<string>(savedProfile?.company || '');
  const [authIceInput, setAuthIceInput] = useState<string>(savedProfile?.ice || '');
  const [authRcIfInput, setAuthRcIfInput] = useState<string>(savedProfile?.rcOrIf || '');
  const [authBillingAddressInput, setAuthBillingAddressInput] = useState<string>(savedProfile?.billingAddress || '');
  const [authCityInput, setAuthCityInput] = useState<string>(savedProfile?.city || 'Casablanca');
  const [emailInput, setEmailInput] = useState<string>(savedProfile?.email || '');
  const [passwordInput, setPasswordInput] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [newPasswordInput, setNewPasswordInput] = useState<string>('');
  const [confirmNewPasswordInput, setConfirmNewPasswordInput] = useState<string>('');
  const [showNewPassword, setShowNewPassword] = useState<boolean>(false);
  const [profileSaving, setProfileSaving] = useState<boolean>(false);
  const [authMessage, setAuthMessage] = useState<string | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);

  // Self-Service Devis Builder state (Tab 2)
  const [productQuery, setProductQuery] = useState<string>('');
  const [devisItems, setDevisItems] = useState<Array<{ product: Product; qty: number }>>([]);
  const [devisName, setDevisName] = useState<string>(savedProfile?.fullName || '');
  const [devisEmail, setDevisEmail] = useState<string>(savedProfile?.email || '');
  const [devisPhone, setDevisPhone] = useState<string>(savedProfile?.phone || '');
  const [devisCompany, setDevisCompany] = useState<string>(savedProfile?.company || '');
  const [devisIce, setDevisIce] = useState<string>(savedProfile?.ice || '');
  const [devisCity, setDevisCity] = useState<string>(savedProfile?.city || 'Casablanca');
  const [devisNotes, setDevisNotes] = useState<string>('');
  const [devisSaving, setDevisSaving] = useState<boolean>(false);
  const [createdDevisInfo, setCreatedDevisInfo] = useState<{
    docNumber: string;
    totalTtc: number;
    summary: string;
  } | null>(null);

  const runSearch = async (phone?: string, ref?: string, email?: string) => {
    const p = phone !== undefined ? phone : phoneInput;
    const r = ref !== undefined ? ref : refInput;
    const e = email !== undefined ? email : authUserEmail || savedProfile?.email || '';
    if (!p && !r && !e) return;

    setLoading(true);
    setSearchedOnce(true);
    try {
      const results = await lookupClientOrdersInSupabase({
        phone: p,
        ref: r,
        email: e,
      });
      setOrders(results);
    } catch {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  // Sync Devis & Account profile fields when profile updates
  const applyProfileToForms = (prof: ClientProfile) => {
    setSavedProfile(prof);
    setAuthUserEmail(prof.email);
    setAuthNameInput(prof.fullName);
    setAuthPhoneInput(prof.phone);
    setAuthCompanyInput(prof.company || '');
    setAuthIceInput(prof.ice || '');
    setAuthRcIfInput(prof.rcOrIf || '');
    setAuthBillingAddressInput(prof.billingAddress || '');
    setAuthCityInput(prof.city || 'Casablanca');
    setPhoneInput(prof.phone);
    setDevisName(prof.fullName);
    setDevisEmail(prof.email);
    setDevisPhone(prof.phone);
    setDevisCompany(prof.company || '');
    setDevisIce(prof.ice || '');
    setDevisCity(prof.city || 'Casablanca');
  };

  // Auto-run search on mount if URL params or saved profile exist
  useEffect(() => {
    if (initialRef || initialTel) {
      runSearch(initialTel, initialRef, '');
    } else if (savedProfile?.phone || savedProfile?.email) {
      runSearch(savedProfile.phone, '', savedProfile.email);
    }
  }, [initialRef, initialTel]);

  const syncSupabaseUserToProfile = async (user: any, saveToCrmIfNew = false) => {
    if (!user?.email) return;
    const meta = user.user_metadata || {};
    const confirmed = Boolean(user.email_confirmed_at || user.confirmed_at || user.app_metadata?.provider === 'google');
    setIsEmailConfirmed(confirmed);
    setNeedsEmailConfirmation(!confirmed);

    const prof: ClientProfile = {
      fullName: meta.full_name || meta.name || savedProfile?.fullName || user.email.split('@')[0],
      email: user.email,
      phone: meta.phone || savedProfile?.phone || '',
      company: meta.company || savedProfile?.company || '',
      ice: meta.ice || savedProfile?.ice || '',
      rcOrIf: meta.rc_if || savedProfile?.rcOrIf || '',
      billingAddress: meta.billing_address || savedProfile?.billingAddress || '',
      city: meta.city || savedProfile?.city || 'Casablanca',
    };
    persistClientProfile(prof);
    applyProfileToForms(prof);

    if (saveToCrmIfNew && !savedProfile?.email) {
      await Promise.allSettled([
        subscribeNewsletter(user.email),
        createContactLead({
          name: prof.fullName,
          email: user.email,
          phone: prof.phone || 'Google OAuth',
          message: `[CONNEXION GOOGLE / EMAIL CONFIRMÉ] Email: ${user.email}`,
        }),
      ]);
    }
    runSearch(prof.phone, initialRef, prof.email);
  };

  // Also check active Supabase Auth session & listen for OAuth / Email Confirmation / Password Recovery redirects
  useEffect(() => {
    const hashOrSearch = `${window.location.hash}${window.location.search}`;
    if (hashOrSearch.includes('type=recovery')) {
      setActiveTab('account');
      setAuthMode('reset_password');
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user?.email) {
        syncSupabaseUserToProfile(session.user, false);
      }
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        setActiveTab('account');
        setAuthMode('reset_password');
        setAuthError(null);
        setAuthMessage('🔐 Choisissez maintenant votre nouveau mot de passe ci-dessous.');
        return;
      }
      if ((event === 'SIGNED_IN' || event === 'USER_UPDATED') && session?.user) {
        syncSupabaseUserToProfile(session.user, event === 'SIGNED_IN');
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const handleGoogleSignIn = async () => {
    setAuthError(null);
    setAuthMessage(null);
    setLoading(true);
    try {
      const supabaseUrl =
        import.meta.env.VITE_SUPABASE_URL || import.meta.env.SUPABASE_URL || '';
      const supabaseKey =
        import.meta.env.VITE_SUPABASE_ANON_KEY ||
        import.meta.env.SUPABASE_PUBLISHABLE_KEY ||
        import.meta.env.SUPABASE_ANON_KEY ||
        '';

      // Pre-check whether Google OAuth provider is enabled in Supabase so we never redirect to a 400 JSON page
      if (supabaseUrl && supabaseKey) {
        try {
          const res = await fetch(`${supabaseUrl}/auth/v1/settings`, {
            headers: { apikey: supabaseKey },
          });
          if (res.ok) {
            const settings = await res.json();
            if (settings?.external?.google === false) {
              setAuthError(
                'La connexion directe par bouton Google n’est pas encore activée côté Supabase (Provider Google désactivé). Saisissez votre Gmail ci-dessous et utilisez "Recevoir un lien de connexion Gmail" ou créez un compte.'
              );
              setLoading(false);
              return;
            }
          }
        } catch {
          // If pre-check fails due to network, fall through to signInWithOAuth
        }
      }

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/mon-compte`,
        },
      });
      if (error) throw error;
    } catch (err: any) {
      const msg = err?.message || '';
      if (/not enabled|unsupported provider/i.test(msg)) {
        setAuthError(
          'La connexion directe Google/Gmail nécessite l’activation du fournisseur Google dans Supabase Auth (Authentication → Providers → Google).'
        );
      } else {
        setAuthError(msg || 'Impossible de lancer la connexion Google.');
      }
      setLoading(false);
    }
  };

  const handleMagicLinkSignIn = async () => {
    const cleanEmail = emailInput.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setAuthError('Saisissez d’abord votre adresse Gmail / Email ci-dessous pour recevoir votre lien de connexion instantanée.');
      return;
    }
    setAuthError(null);
    setAuthMessage(null);
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: cleanEmail,
        options: {
          emailRedirectTo: `${window.location.origin}/mon-compte`,
        },
      });
      if (error) throw error;
      setAuthMessage(
        `⚡ Lien de connexion directe envoyé à ${cleanEmail} ! Ouvrez votre boîte Gmail et cliquez sur le lien pour vous connecter sans mot de passe.`
      );
    } catch (err: any) {
      setAuthError(err?.message || 'Impossible d’envoyer le lien de connexion par email.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendConfirmation = async (targetEmail?: string) => {
    const cleanEmail = (targetEmail || emailInput || authUserEmail || savedProfile?.email || '')
      .trim()
      .toLowerCase();
    if (!cleanEmail) {
      setAuthError('Veuillez saisir votre adresse Gmail/Email pour renvoyer le lien.');
      return;
    }
    setAuthError(null);
    setAuthMessage(null);
    setLoading(true);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: cleanEmail,
        options: {
          emailRedirectTo: `${window.location.origin}/mon-compte`,
        },
      });
      if (error) throw error;
      setAuthMessage(
        `📧 Email de confirmation renvoyé à ${cleanEmail} ! Vérifiez votre boîte de réception (et le dossier Spam/Promotions).`
      );
    } catch (err: any) {
      setAuthError(err?.message || 'Erreur lors du renvoi de l’email de confirmation.');
    } finally {
      setLoading(false);
    }
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthMessage(null);
    setNeedsEmailConfirmation(false);
    setLoading(true);

    const cleanEmail = emailInput.trim().toLowerCase();

    try {
      if (authMode === 'forgot') {
        if (!cleanEmail) {
          throw new Error('Veuillez saisir votre adresse email.');
        }
        const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
          redirectTo: `${window.location.origin}/mon-compte`,
        });
        if (error) throw error;
        setAuthMessage(
          `📧 Un lien de réinitialisation de mot de passe vient d’être envoyé à ${cleanEmail}. Ouvrez votre boîte Gmail/Email et cliquez sur le lien pour définir un nouveau mot de passe.`
        );
      } else if (authMode === 'reset_password') {
        if (!newPasswordInput || newPasswordInput.length < 6) {
          throw new Error('Le nouveau mot de passe doit contenir au moins 6 caractères.');
        }
        if (newPasswordInput !== confirmNewPasswordInput) {
          throw new Error('Les deux mots de passe ne correspondent pas.');
        }
        const { error } = await supabase.auth.updateUser({
          password: newPasswordInput,
        });
        if (error) throw error;
        setNewPasswordInput('');
        setConfirmNewPasswordInput('');
        setAuthMode('login');
        setAuthMessage('✅ Votre mot de passe a été mis à jour avec succès !');
        setActiveTab('orders');
      } else if (authMode === 'register') {
        if (!authNameInput.trim() || !authPhoneInput.trim() || !cleanEmail || !passwordInput) {
          throw new Error('Veuillez remplir votre nom, téléphone, email et mot de passe.');
        }

        const { data, error } = await supabase.auth.signUp({
          email: cleanEmail,
          password: passwordInput,
          options: {
            emailRedirectTo: `${window.location.origin}/mon-compte`,
            data: {
              full_name: authNameInput.trim(),
              phone: authPhoneInput.trim(),
              company: authCompanyInput.trim(),
              ice: authIceInput.trim(),
              rc_if: authRcIfInput.trim(),
              billing_address: authBillingAddressInput.trim(),
              city: authCityInput,
            },
          },
        });

        if (error) {
          if (/already registered/i.test(error.message)) {
            throw new Error(
              'Un compte existe déjà avec cet email. Basculez sur "Connexion" ou cliquez sur "Mot de passe oublié".'
            );
          }
          throw error;
        }

        const profile: ClientProfile = {
          fullName: authNameInput.trim(),
          email: cleanEmail,
          phone: authPhoneInput.trim(),
          company: authCompanyInput.trim(),
          ice: authIceInput.trim(),
          rcOrIf: authRcIfInput.trim(),
          billingAddress: authBillingAddressInput.trim(),
          city: authCityInput,
        };
        persistClientProfile(profile);
        applyProfileToForms(profile);

        // Save customer in Supabase CRM & Subscriber database for email/WhatsApp follow-up
        await Promise.allSettled([
          subscribeNewsletter(cleanEmail),
          createContactLead({
            name: profile.fullName,
            email: cleanEmail,
            phone: profile.phone,
            message: `[NOUVEAU COMPTE CLIENT] Société: ${profile.company || '-'} | ICE: ${profile.ice || '-'} | Ville: ${profile.city || 'Casablanca'}`,
          }),
        ]);

        const confirmedNow = Boolean(data.user?.email_confirmed_at || data.session);
        setIsEmailConfirmed(confirmedNow);
        setNeedsEmailConfirmation(!confirmedNow);

        setAuthMessage(
          confirmedNow
            ? '✅ Compte créé et confirmé avec succès ! Vous pouvez maintenant demander des devis et suivre vos commandes.'
            : `📧 Compte créé ! Un email de confirmation vient d’être envoyé à ${cleanEmail}. Cliquez sur le lien dans votre boîte Gmail/Email pour confirmer votre compte.`
        );
        await runSearch(profile.phone, '', profile.email);
        if (confirmedNow) {
          setActiveTab('orders');
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password: passwordInput,
        });
        if (error) {
          if (/email not confirmed/i.test(error.message)) {
            setNeedsEmailConfirmation(true);
            throw new Error(
              'Votre adresse email n’est pas encore confirmée. Vérifiez votre boîte Gmail ou cliquez sur "Renvoyer l’email de confirmation" ci-dessous.'
            );
          }
          throw error;
        }
        if (data.user?.email) {
          await syncSupabaseUserToProfile(data.user, false);
          setAuthMessage('✅ Connexion réussie !');
          setActiveTab('orders');
        }
      }
    } catch (err: any) {
      setAuthError(err?.message || 'Erreur lors de la connexion.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCompanyProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthMessage(null);
    setProfileSaving(true);
    try {
      const cleanEmail = (savedProfile?.email || authUserEmail || emailInput).trim().toLowerCase();
      const updatedProfile: ClientProfile = {
        fullName: authNameInput.trim() || savedProfile?.fullName || cleanEmail.split('@')[0],
        email: cleanEmail,
        phone: authPhoneInput.trim(),
        company: authCompanyInput.trim(),
        ice: authIceInput.trim(),
        rcOrIf: authRcIfInput.trim(),
        billingAddress: authBillingAddressInput.trim(),
        city: authCityInput.trim() || 'Casablanca',
      };
      persistClientProfile(updatedProfile);
      applyProfileToForms(updatedProfile);

      // Update Supabase Auth metadata if session exists & log update in CRM
      await Promise.allSettled([
        supabase.auth.updateUser({
          data: {
            full_name: updatedProfile.fullName,
            phone: updatedProfile.phone,
            company: updatedProfile.company,
            ice: updatedProfile.ice,
            rc_if: updatedProfile.rcOrIf,
            billing_address: updatedProfile.billingAddress,
            city: updatedProfile.city,
          },
        }),
        createContactLead({
          name: updatedProfile.fullName,
          email: cleanEmail,
          phone: updatedProfile.phone || '-',
          message: `[MISE À JOUR FACTURATION PRO] Société: ${updatedProfile.company || '-'} | ICE: ${updatedProfile.ice || '-'} | IF/RC: ${updatedProfile.rcOrIf || '-'} | Adresse: ${updatedProfile.billingAddress || '-'} | Ville: ${updatedProfile.city}`,
        }),
      ]);

      setAuthMessage(
        '✅ Informations professionnelles et de facturation enregistrées ! Elles seront automatiquement utilisées pour vos prochains Devis et Factures.'
      );
      if (updatedProfile.phone || cleanEmail) {
        await runSearch(updatedProfile.phone, '', cleanEmail);
      }
    } catch (err: any) {
      setAuthError(err?.message || 'Erreur lors de la sauvegarde du profil.');
    } finally {
      setProfileSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch {
      // ignore
    }
    try {
      localStorage.removeItem(CLIENT_PROFILE_KEY);
    } catch {}
    setSavedProfile(null);
    setAuthUserEmail(null);
    setOrders([]);
    setSearchedOnce(false);
    setActiveTab('account');
  };

  // Tab 2 Catalog filtering
  const filteredCatalog = useMemo(() => {
    const priced = products.filter((p) => p.price && p.price > 0);
    const q = productQuery.trim().toLowerCase();
    if (!q) return priced.slice(0, 12);
    return priced
      .filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.category || '').toLowerCase().includes(q) ||
          (p.brand || '').toLowerCase().includes(q) ||
          String(p.id).includes(q)
      )
      .slice(0, 18);
  }, [products, productQuery]);

  const addDevisProduct = (prod: Product) => {
    setDevisItems((prev) => {
      const idx = prev.findIndex((x) => x.product.id === prod.id);
      if (idx > -1) {
        const updated = [...prev];
        updated[idx] = { ...updated[idx], qty: updated[idx].qty + 1 };
        return updated;
      }
      return [...prev, { product: prod, qty: 1 }];
    });
  };

  const devisSubtotalTtc = useMemo(
    () => devisItems.reduce((sum, x) => sum + x.product.price * x.qty, 0),
    [devisItems]
  );
  const devisSubtotalHt = devisSubtotalTtc / 1.2;
  const devisTva = devisSubtotalTtc - devisSubtotalHt;

  const handleCreateClientDevis = async (e: React.FormEvent) => {
    e.preventDefault();
    if (devisItems.length === 0) {
      alert('Veuillez sélectionner au moins un produit dans le catalogue ci-dessus.');
      return;
    }
    if (!devisName.trim() || !devisPhone.trim() || !devisEmail.trim()) {
      alert('Veuillez renseigner votre nom, email et numéro de téléphone.');
      return;
    }

    setDevisSaving(true);
    try {
      const todayStr = new Date().toISOString().split('T')[0];
      const [, mm, dd] = todayStr.split('-');
      const validUntilStr = new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0];
      const docNumber = `FA26${String(Math.floor(100 + Math.random() * 900)).padStart(5, '0')}`;

      const payload: ErpDocumentPayload = {
        docType: 'DEVIS',
        docNumber,
        issueDate: todayStr,
        referenceText: `DEMANDE CLIENT ${dd}/${mm}`,
        validUntilDate: validUntilStr,
        validityDays: 30,
        clientName: devisName.trim(),
        clientCompany: devisCompany.trim() || undefined,
        clientIce: devisIce.trim() || undefined,
        clientPhone: devisPhone.trim(),
        clientEmail: devisEmail.trim().toLowerCase(),
        clientCity: devisCity,
        items: devisItems.map((x) => ({
          id: x.product.id,
          sku: `GS-${x.product.id}`,
          name: x.product.name,
          quantity: x.qty,
          unitPriceTtc: x.product.price,
        })),
        taxMode: 'ttc_includes_20',
        shippingCostTtc: 0,
        notes: devisNotes.trim() || undefined,
        isConfirmedByOwner: false,
        showStamp: false,
      };

      const profile: ClientProfile = {
        fullName: devisName.trim(),
        email: devisEmail.trim().toLowerCase(),
        phone: devisPhone.trim(),
        company: devisCompany.trim(),
        ice: devisIce.trim(),
        city: devisCity,
      };
      persistClientProfile(profile);
      applyProfileToForms(profile);

      const itemsSummary = devisItems.map((x) => `${x.qty}x ${x.product.name}`).join(', ');
      const totalQty = devisItems.reduce((sum, x) => sum + x.qty, 0);

      await Promise.allSettled([
        saveErpDocumentToSupabase({
          docNumber,
          docType: 'DEVIS',
          clientName: profile.fullName,
          clientCompany: profile.company || profile.city,
          clientPhone: profile.phone,
          clientEmail: profile.email,
          totalTtc: devisSubtotalTtc,
          itemsSummary,
          totalQty,
          fullPayloadJson: JSON.stringify(payload),
        }),
        subscribeNewsletter(profile.email),
      ]);

      openAndPrintDevisOrInvoice(payload);
      setCreatedDevisInfo({
        docNumber,
        totalTtc: devisSubtotalTtc,
        summary: itemsSummary,
      });

      await runSearch(profile.phone, '', profile.email);
    } finally {
      setDevisSaving(false);
    }
  };

  const handleDownloadOrderPdf = (order: QuoteRequestItem) => {
    const isConfirmed = order.status !== 'New' && order.status !== 'Lost';
    const rawMsg = order.message || '';

    if (rawMsg.includes('||ERP_JSON||')) {
      try {
        const jsonPart = rawMsg.split('||ERP_JSON||')[1];
        const parsed: ErpDocumentPayload = JSON.parse(jsonPart);
        openAndPrintDevisOrInvoice({
          ...parsed,
          isConfirmedByOwner: isConfirmed,
          showStamp: isConfirmed,
        });
        return;
      } catch {
        // fallback below
      }
    }

    const refMatch = (order.product_name + ' ' + rawMsg).match(
      /\b(FA26\d+|DEV-[\w-]+|GS-\d+)\b/i
    );
    const docNum = refMatch ? refMatch[1] : `FA26${String(order.id).padStart(5, '0')}`;
    const issueDate = (order.created_at || new Date().toISOString()).split('T')[0];

    openAndPrintDevisOrInvoice({
      docType: 'DEVIS',
      docNumber: docNum,
      issueDate,
      clientName: order.name || 'Client',
      clientCompany: order.company || undefined,
      clientPhone: order.phone || undefined,
      clientEmail: order.email || undefined,
      items: [
        {
          sku: `GS-${order.id}`,
          name: order.product_name.replace(/^\[.*?\]\s*/, ''),
          quantity: order.quantity || 1,
          unitPriceTtc: order.deal_value > 0 ? order.deal_value : 1500,
        },
      ],
      taxMode: 'ttc_includes_20',
      isConfirmedByOwner: isConfirmed,
      showStamp: isConfirmed,
    });
  };

  const filteredOrders = useMemo(() => {
    if (orderFilter === 'pending') return orders.filter((o) => o.status === 'New');
    if (orderFilter === 'active')
      return orders.filter((o) => ['Contacted', 'Negotiating', 'Waiting'].includes(o.status));
    if (orderFilter === 'won') return orders.filter((o) => o.status === 'Won');
    return orders;
  }, [orders, orderFilter]);

  return (
    <div className="min-h-screen bg-gray-50 py-8 sm:py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Top Header & Navigation Tabs */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-200/80 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <Link
                to="/"
                className="text-xs font-bold text-red-600 hover:underline flex items-center gap-1.5 mb-2"
              >
                <i className="fa-solid fa-arrow-left" /> Retour à la boutique GearShop.ma
              </Link>
              <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
                👤 Espace Client, Devis & Suivi de Commande
              </h1>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">
                Créez votre compte client, préparez un devis à confirmer par le responsable, et suivez vos commandes et paiements en temps réel.
              </p>
            </div>
          </div>

          {/* Persistent Logged-In Profile Banner */}
          {(savedProfile || authUserEmail) && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center font-black text-sm shrink-0">
                  {(savedProfile?.fullName || authUserEmail || 'C').charAt(0).toUpperCase()}
                </div>
                <div className="text-xs text-emerald-950">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-black text-sm">
                      {savedProfile?.fullName || authUserEmail}
                    </span>
                    <span className="px-2 py-0.5 bg-emerald-600 text-white rounded-full text-[10px] font-bold">
                      ✓ Compte Actif
                    </span>
                  </div>
                  <div className="text-emerald-800 mt-0.5">
                    {savedProfile?.email || authUserEmail}
                    {savedProfile?.phone ? ` • 📱 ${savedProfile.phone}` : ''}
                    {savedProfile?.company ? ` • 🏢 ${savedProfile.company}` : ''}
                    {savedProfile?.ice ? ` • ICE: ${savedProfile.ice}` : ''}
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('devis')}
                  className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold cursor-pointer transition"
                >
                  + Nouveau Devis
                </button>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="px-3 py-1.5 bg-white hover:bg-gray-100 text-gray-700 border border-gray-200 rounded-xl text-xs font-bold cursor-pointer transition"
                >
                  Déconnexion
                </button>
              </div>
            </div>
          )}

          {/* 3 Navigation Tabs */}
          <div className="flex flex-wrap gap-2 bg-gray-100 p-1.5 rounded-2xl">
            <button
              type="button"
              onClick={() => setActiveTab('orders')}
              className={`flex-1 min-w-[180px] px-4 py-2.5 rounded-xl text-xs font-extrabold transition cursor-pointer ${
                activeTab === 'orders'
                  ? 'bg-red-600 text-white shadow'
                  : 'text-gray-700 hover:text-black'
              }`}
            >
              📦 Mes Commandes, Devis & Paiements ({orders.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('devis')}
              className={`flex-1 min-w-[180px] px-4 py-2.5 rounded-xl text-xs font-extrabold transition cursor-pointer ${
                activeTab === 'devis'
                  ? 'bg-red-600 text-white shadow'
                  : 'text-gray-700 hover:text-black'
              }`}
            >
              📋 Créer un Devis en Ligne (À Confirmer)
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('account')}
              className={`flex-1 min-w-[180px] px-4 py-2.5 rounded-xl text-xs font-extrabold transition cursor-pointer ${
                activeTab === 'account'
                  ? 'bg-red-600 text-white shadow'
                  : 'text-gray-700 hover:text-black'
              }`}
            >
              👤 {savedProfile || authUserEmail ? 'Profil Compte Client' : 'Créer un Compte / Connexion'}
            </button>
          </div>
        </div>

        {/* ── TAB 1: MON COMPTE CLIENT (INSCRIPTION / CONNEXION / GOOGLE / MOT DE PASSE) ── */}
        {activeTab === 'account' && (
          <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-gray-200/80">
            {(savedProfile || authUserEmail) && authMode !== 'reset_password' ? (
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h2 className="text-xl font-black text-gray-900">
                    ✅ Votre Compte Client est enregistré dans notre base de données
                  </h2>
                  {isEmailConfirmed ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-extrabold">
                      <i className="fa-solid fa-circle-check" /> Email / Gmail vérifié
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-extrabold">
                      <i className="fa-solid fa-envelope" /> En attente de confirmation par email
                    </span>
                  )}
                </div>

                <p className="text-xs sm:text-sm text-gray-600">
                  Toutes vos demandes de devis, commandes, factures et mises à jour de livraison/paiement sont automatiquement rattachées à votre email (<strong>{savedProfile?.email || authUserEmail}</strong>) et à votre numéro (<strong>{savedProfile?.phone || '-'}</strong>).
                </p>

                {!isEmailConfirmed && (
                  <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 text-xs text-amber-950">
                    <div>
                      <strong>Confirmez votre adresse Gmail / Email :</strong> Ouvrez le lien reçu dans votre boîte mail pour valider définitivement votre compte.
                    </div>
                    <button
                      type="button"
                      disabled={loading}
                      onClick={() => handleResendConfirmation(savedProfile?.email || authUserEmail || '')}
                      className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl cursor-pointer shrink-0"
                    >
                      📩 Renvoyer l’email de confirmation
                    </button>
                  </div>
                )}

                {authMessage && (
                  <p className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 p-3 rounded-xl font-semibold">
                    {authMessage}
                  </p>
                )}
                {authError && (
                  <p className="text-xs text-red-600 bg-red-50 border border-red-200 p-3 rounded-xl font-semibold">
                    {authError}
                  </p>
                )}

                <form
                  onSubmit={handleSaveCompanyProfile}
                  className="bg-gray-50 border border-gray-200 rounded-2xl p-4 sm:p-5 space-y-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-sm font-black text-gray-900">
                      🏢 Informations Professionnelles & Facturation (Société)
                    </h3>
                    <span className="text-[11px] font-semibold text-gray-500">
                      Utilisées pour vos Devis & Factures VERDANOVE
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-gray-700 mb-1">
                        Nom Complet / Responsable
                      </label>
                      <input
                        type="text"
                        required
                        value={authNameInput}
                        onChange={(e) => setAuthNameInput(e.target.value)}
                        placeholder="Nom & Prénom"
                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs text-gray-900"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-gray-700 mb-1">
                        Téléphone / WhatsApp
                      </label>
                      <input
                        type="tel"
                        required
                        value={authPhoneInput}
                        onChange={(e) => setAuthPhoneInput(e.target.value)}
                        placeholder="06 XX XX XX XX"
                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs text-gray-900"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-gray-700 mb-1">
                        Société / Raison Sociale
                      </label>
                      <input
                        type="text"
                        value={authCompanyInput}
                        onChange={(e) => setAuthCompanyInput(e.target.value)}
                        placeholder="Ex: Studio Atlas SARL"
                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs text-gray-900"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-gray-700 mb-1">
                        N° ICE (15 chiffres)
                      </label>
                      <input
                        type="text"
                        value={authIceInput}
                        onChange={(e) => setAuthIceInput(e.target.value)}
                        placeholder="001234567000089"
                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-mono text-gray-900"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-gray-700 mb-1">
                        N° IF / RC (Optionnel)
                      </label>
                      <input
                        type="text"
                        value={authRcIfInput}
                        onChange={(e) => setAuthRcIfInput(e.target.value)}
                        placeholder="IF / Registre de Commerce"
                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-mono text-gray-900"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-bold text-gray-700 mb-1">
                        Adresse de Facturation / Siège Social
                      </label>
                      <input
                        type="text"
                        value={authBillingAddressInput}
                        onChange={(e) => setAuthBillingAddressInput(e.target.value)}
                        placeholder="N°, Rue, Quartier..."
                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs text-gray-900"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-gray-700 mb-1">
                        Ville
                      </label>
                      <input
                        type="text"
                        value={authCityInput}
                        onChange={(e) => setAuthCityInput(e.target.value)}
                        placeholder="Casablanca, Rabat..."
                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs text-gray-900"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={profileSaving}
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl cursor-pointer transition"
                  >
                    {profileSaving
                      ? 'Enregistrement...'
                      : '💾 Enregistrer mes informations de facturation'}
                  </button>
                </form>

                <div className="flex flex-wrap gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab('orders')}
                    className="px-6 py-3 bg-gray-900 hover:bg-black text-white font-bold text-xs rounded-xl cursor-pointer"
                  >
                    📦 Voir Mes Commandes & Paiements
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('devis')}
                    className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl cursor-pointer"
                  >
                    📋 Préparer un Devis en Ligne
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('reset_password');
                      setAuthError(null);
                      setAuthMessage(null);
                    }}
                    className="px-5 py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs rounded-xl cursor-pointer"
                  >
                    🔑 Changer mon mot de passe
                  </button>
                </div>
              </div>
            ) : (
              <form
                onSubmit={handleAuthSubmit}
                className={`space-y-4 mx-auto ${
                  authMode === 'register' ? 'max-w-xl' : 'max-w-md'
                }`}
              >
                <div className="text-center space-y-2 pb-1">
                  <h2 className="text-2xl font-black text-gray-900">
                    {authMode === 'register'
                      ? 'Créer votre Compte'
                      : authMode === 'login'
                      ? 'Connexion à votre Compte'
                      : authMode === 'forgot'
                      ? 'Mot de passe oublié'
                      : 'Nouveau mot de passe'}
                  </h2>
                  <div className="bg-gray-100 border border-gray-200 rounded-xl px-4 py-3 text-xs text-gray-700 leading-relaxed text-left">
                    {authMode === 'register'
                      ? 'Créez votre compte client pour commander plus rapidement, enregistrer vos informations de facturation (ICE / Société) et suivre vos devis.'
                      : authMode === 'login'
                      ? 'Commandez plus rapidement, suivez vos livraisons en direct, consultez vos devis et gérez vos factures.'
                      : authMode === 'forgot'
                      ? 'Saisissez votre adresse email / Gmail pour recevoir un lien sécurisé de réinitialisation.'
                      : 'Saisissez votre nouveau mot de passe sécurisé (6 caractères minimum).'}
                  </div>
                </div>

                {authMode === 'register' && (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">
                          Nom Complet <span className="text-red-600">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={authNameInput}
                          onChange={(e) => setAuthNameInput(e.target.value)}
                          placeholder="Ex: Aya Toraif / Mohamed Alami"
                          className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">
                          Téléphone / WhatsApp <span className="text-red-600">*</span>
                        </label>
                        <input
                          type="tel"
                          required
                          value={authPhoneInput}
                          onChange={(e) => setAuthPhoneInput(e.target.value)}
                          placeholder="06 XX XX XX XX"
                          className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900"
                        />
                      </div>
                    </div>

                    <div className="bg-gray-50 border border-gray-200 rounded-2xl p-3.5 space-y-3">
                      <div className="text-[11px] font-extrabold uppercase tracking-wider text-gray-700">
                        🏢 Informations Facturation / Société (Professionnel)
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-xs font-bold text-gray-700 mb-1">
                            Société / Raison Sociale
                          </label>
                          <input
                            type="text"
                            value={authCompanyInput}
                            onChange={(e) => setAuthCompanyInput(e.target.value)}
                            placeholder="Nom d'entreprise"
                            className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-900"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-700 mb-1">
                            N° ICE (Facture)
                          </label>
                          <input
                            type="text"
                            value={authIceInput}
                            onChange={(e) => setAuthIceInput(e.target.value)}
                            placeholder="15 chiffres ICE"
                            className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-mono text-gray-900"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-700 mb-1">
                            N° IF / RC (Optionnel)
                          </label>
                          <input
                            type="text"
                            value={authRcIfInput}
                            onChange={(e) => setAuthRcIfInput(e.target.value)}
                            placeholder="IF / RC"
                            className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-mono text-gray-900"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="sm:col-span-2">
                          <label className="block text-xs font-bold text-gray-700 mb-1">
                            Adresse de Facturation (Optionnel)
                          </label>
                          <input
                            type="text"
                            value={authBillingAddressInput}
                            onChange={(e) => setAuthBillingAddressInput(e.target.value)}
                            placeholder="N°, Boulevard, Quartier..."
                            className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-900"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-700 mb-1">Ville</label>
                          <input
                            type="text"
                            value={authCityInput}
                            onChange={(e) => setAuthCityInput(e.target.value)}
                            placeholder="Casablanca, Rabat..."
                            className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-900"
                          />
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {authMode === 'reset_password' ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        Nouveau mot de passe <span className="text-red-600">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type={showNewPassword ? 'text' : 'password'}
                          required
                          minLength={6}
                          value={newPasswordInput}
                          onChange={(e) => setNewPasswordInput(e.target.value)}
                          placeholder="6 caractères minimum"
                          className="w-full px-3.5 py-2.5 pr-20 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword((prev) => !prev)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-600 hover:text-black cursor-pointer"
                        >
                          {showNewPassword ? 'Masquer' : 'Afficher'}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        Confirmer le mot de passe <span className="text-red-600">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type={showNewPassword ? 'text' : 'password'}
                          required
                          minLength={6}
                          value={confirmNewPasswordInput}
                          onChange={(e) => setConfirmNewPasswordInput(e.target.value)}
                          placeholder="Répétez le mot de passe"
                          className="w-full px-3.5 py-2.5 pr-20 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword((prev) => !prev)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-600 hover:text-black cursor-pointer"
                        >
                          {showNewPassword ? 'Masquer' : 'Afficher'}
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className={`grid grid-cols-1 ${authMode === 'register' ? 'sm:grid-cols-2' : ''} gap-3`}>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        Email <span className="text-red-600">*</span>
                      </label>
                      <input
                        type="email"
                        required
                        value={emailInput}
                        onChange={(e) => setEmailInput(e.target.value)}
                        placeholder="client@gmail.com"
                        className="w-full px-3.5 py-3 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:border-gray-900"
                      />
                    </div>
                    {authMode !== 'forgot' && (
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">
                          Mot de passe <span className="text-red-600">*</span>
                        </label>
                        <div className="relative">
                          <input
                            type={showPassword ? 'text' : 'password'}
                            required
                            minLength={6}
                            value={passwordInput}
                            onChange={(e) => setPasswordInput(e.target.value)}
                            placeholder="Mot de passe"
                            className="w-full px-3.5 py-3 pr-20 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:border-gray-900"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword((prev) => !prev)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-600 hover:text-black cursor-pointer"
                          >
                            {showPassword ? 'Masquer' : 'Afficher'}
                          </button>
                        </div>
                        {authMode === 'login' && (
                          <div className="text-right mt-1.5">
                            <button
                              type="button"
                              onClick={() => {
                                setAuthMode('forgot');
                                setAuthError(null);
                                setAuthMessage(null);
                              }}
                              className="text-xs font-semibold text-blue-600 hover:underline cursor-pointer"
                            >
                              Mot de passe oublié ?
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {authError && (
                  <p className="text-xs text-red-600 bg-red-50 border border-red-200 p-3 rounded-xl font-semibold">
                    {authError}
                  </p>
                )}
                {authMessage && (
                  <p className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 p-3 rounded-xl font-semibold">
                    {authMessage}
                  </p>
                )}

                {needsEmailConfirmation && (
                  <div className="flex items-center justify-between gap-2 bg-amber-50 border border-amber-200 p-3 rounded-xl text-xs">
                    <span className="text-amber-900 font-semibold">
                      Vous n’avez pas reçu l’email de confirmation ?
                    </span>
                    <button
                      type="button"
                      disabled={loading}
                      onClick={() => handleResendConfirmation()}
                      className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg cursor-pointer shrink-0"
                    >
                      📩 Renvoyer le lien
                    </button>
                  </div>
                )}

                <div className="flex flex-wrap gap-3">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm rounded-lg shadow-sm transition cursor-pointer"
                  >
                    {loading
                      ? 'Traitement...'
                      : authMode === 'register'
                      ? 'Créer mon Compte'
                      : authMode === 'login'
                      ? 'Se Connecter'
                      : authMode === 'forgot'
                      ? 'Envoyer le lien par Email'
                      : 'Enregistrer le mot de passe'}
                  </button>
                  {(authMode === 'forgot' || authMode === 'reset_password') && (
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode('login');
                        setAuthError(null);
                        setAuthMessage(null);
                      }}
                      className="px-5 py-3.5 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs rounded-lg cursor-pointer"
                    >
                      ← Retour
                    </button>
                  )}
                </div>

                {authMode !== 'reset_password' && authMode !== 'forgot' && (
                  <>
                    <div className="text-left pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          setAuthMode(authMode === 'login' ? 'register' : 'login');
                          setAuthError(null);
                          setAuthMessage(null);
                          setNeedsEmailConfirmation(false);
                        }}
                        className="text-xs font-semibold text-blue-600 hover:underline cursor-pointer"
                      >
                        {authMode === 'login' ? 'Créer un Compte' : 'Déjà un compte ? Se connecter'}
                      </button>
                    </div>

                    <div className="pt-2 space-y-2.5">
                      <div className="text-center text-xs font-medium text-gray-500">
                        ou utiliser
                      </div>
                      <div className="flex items-center justify-center gap-3">
                        <button
                          type="button"
                          disabled={loading}
                          onClick={handleGoogleSignIn}
                          title="Se connecter avec Google / Gmail"
                          className="flex items-center justify-center gap-2.5 px-5 py-2.5 bg-white hover:bg-gray-50 border border-gray-300 rounded-lg shadow-sm text-xs font-bold text-gray-800 transition cursor-pointer"
                        >
                          <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                            <path
                              fill="#4285F4"
                              d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17Z"
                            />
                            <path
                              fill="#34A853"
                              d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.29v3.14C3.26 21.3 7.31 24 12 24Z"
                            />
                            <path
                              fill="#FBBC05"
                              d="M5.28 14.24c-.24-.72-.38-1.49-.38-2.24s.14-1.52.38-2.24V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.99-3.14Z"
                            />
                            <path
                              fill="#EA4335"
                              d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.99 3.14c.95-2.85 3.6-4.96 6.72-4.96Z"
                            />
                          </svg>
                          Google / Gmail
                        </button>

                        <button
                          type="button"
                          disabled={loading}
                          onClick={handleMagicLinkSignIn}
                          title="Recevoir un lien de connexion directe par Email"
                          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white hover:bg-gray-50 border border-gray-300 rounded-lg shadow-sm text-xs font-bold text-gray-800 transition cursor-pointer"
                        >
                          <i className="fa-solid fa-envelope text-blue-600" />
                          Lien par Email
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </form>
            )}
          </div>
        )}

        {/* ── TAB 2: CRÉER UN DEVIS EN LIGNE (À CONFIRMER PAR LE RESPONSABLE) ──── */}
        {activeTab === 'devis' && (
          <div className="space-y-6">
            <div className="bg-amber-50 border border-amber-300 rounded-2xl p-4 flex items-start gap-3 text-xs text-amber-950">
              <i className="fa-solid fa-circle-info text-amber-600 text-base mt-0.5 shrink-0" />
              <div>
                <span className="font-black uppercase">Mention « À Confirmer par le Responsable » :</span>{' '}
                Sélectionnez les produits souhaités ci-dessous pour générer votre Devis PDF instantanément. Ce devis portera la mention <strong>« DEVIS EN ATTENTE DE CONFIRMATION »</strong> : veuillez ensuite l’envoyer au responsable (<strong>+212 673 01 18 73 / Verdanove@gmail.com</strong>) pour vérification du stock et validation définitive.
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left: Product Selection Catalog */}
              <div className="lg:col-span-2 bg-white p-6 rounded-3xl shadow-sm border border-gray-200/80 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <h2 className="text-base font-black text-gray-900">
                    1. Sélectionnez vos Produits ({products.length} références)
                  </h2>
                  <input
                    type="text"
                    value={productQuery}
                    onChange={(e) => setProductQuery(e.target.value)}
                    placeholder="🔍 Rechercher (Canon R6, Sony FX30, DJI, Godox...)"
                    className="w-full sm:w-72 px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:border-red-600 outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[420px] overflow-y-auto pr-1">
                  {filteredCatalog.map((prod) => (
                    <div
                      key={prod.id}
                      className="flex items-center gap-3 p-3 rounded-2xl border border-gray-200 hover:border-red-400 transition bg-gray-50/50"
                    >
                      <img
                        src={prod.image}
                        alt={prod.name}
                        className="w-12 h-12 object-contain rounded-lg bg-white border border-gray-100 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-bold text-gray-900 line-clamp-2">
                          {prod.name}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs font-black text-red-600 font-mono">
                            {prod.price.toLocaleString('fr-FR')} DH
                          </span>
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                              prod.inStock
                                ? 'bg-emerald-100 text-emerald-700'
                                : 'bg-amber-100 text-amber-700'
                            }`}
                          >
                            {prod.inStock ? 'En stock' : 'Sur commande'}
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => addDevisProduct(prod)}
                        className="px-3 py-2 bg-gray-900 hover:bg-red-600 text-white rounded-xl text-xs font-bold shrink-0 cursor-pointer transition"
                      >
                        + Ajouter
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right: Selected Lines + Client Info + Generate */}
              <form
                onSubmit={handleCreateClientDevis}
                className="bg-white p-6 rounded-3xl shadow-sm border border-gray-200/80 space-y-4"
              >
                <h2 className="text-base font-black text-gray-900">
                  2. Votre Sélection ({devisItems.length})
                </h2>

                {devisItems.length === 0 ? (
                  <div className="p-4 bg-gray-50 border border-dashed border-gray-300 rounded-2xl text-xs text-gray-500 text-center">
                    Cliquez sur <strong>« + Ajouter »</strong> à gauche pour ajouter des équipements à votre devis.
                  </div>
                ) : (
                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {devisItems.map(({ product, qty }) => (
                      <div
                        key={product.id}
                        className="p-2.5 bg-gray-50 border border-gray-200 rounded-xl flex items-center justify-between gap-2 text-xs"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="font-bold text-gray-900 truncate">{product.name}</div>
                          <div className="text-[11px] text-gray-500 font-mono">
                            {product.price.toLocaleString('fr-FR')} DH × {qty} ={' '}
                            <strong>{(product.price * qty).toLocaleString('fr-FR')} DH</strong>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <input
                            type="number"
                            min={1}
                            value={qty}
                            onChange={(e) => {
                              const nextQty = Math.max(1, parseInt(e.target.value, 10) || 1);
                              setDevisItems((prev) =>
                                prev.map((it) =>
                                  it.product.id === product.id ? { ...it, qty: nextQty } : it
                                )
                              );
                            }}
                            className="w-12 px-1.5 py-1 bg-white border border-gray-300 rounded text-center font-bold"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setDevisItems((prev) =>
                                prev.filter((it) => it.product.id !== product.id)
                              )
                            }
                            className="text-gray-400 hover:text-red-600 p-1 font-bold cursor-pointer"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {devisItems.length > 0 && (
                  <div className="bg-gray-900 text-white rounded-2xl p-3.5 text-xs space-y-1">
                    <div className="flex justify-between text-gray-300">
                      <span>Total HT estimé :</span>
                      <span className="font-mono">
                        {devisSubtotalHt.toLocaleString('fr-FR', { maximumFractionDigits: 2 })} DH
                      </span>
                    </div>
                    <div className="flex justify-between text-gray-300">
                      <span>TVA (20%) :</span>
                      <span className="font-mono">
                        {devisTva.toLocaleString('fr-FR', { maximumFractionDigits: 2 })} DH
                      </span>
                    </div>
                    <div className="flex justify-between font-black text-sm pt-1 border-t border-gray-800">
                      <span>TOTAL TTC :</span>
                      <span className="text-red-400 font-mono">
                        {devisSubtotalTtc.toLocaleString('fr-FR')} DH
                      </span>
                    </div>
                  </div>
                )}

                <div className="space-y-2.5 text-xs pt-1">
                  <input
                    type="text"
                    required
                    value={devisName}
                    onChange={(e) => setDevisName(e.target.value)}
                    placeholder="Nom Complet *"
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-900"
                  />
                  <input
                    type="email"
                    required
                    value={devisEmail}
                    onChange={(e) => setDevisEmail(e.target.value)}
                    placeholder="Email (pour suivi & validation) *"
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-900"
                  />
                  <input
                    type="tel"
                    required
                    value={devisPhone}
                    onChange={(e) => setDevisPhone(e.target.value)}
                    placeholder="Téléphone / WhatsApp *"
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-900"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={devisCompany}
                      onChange={(e) => setDevisCompany(e.target.value)}
                      placeholder="Société (Opt.)"
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-900"
                    />
                    <input
                      type="text"
                      value={devisIce}
                      onChange={(e) => setDevisIce(e.target.value)}
                      placeholder="N° ICE (Opt.)"
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-mono text-gray-900"
                    />
                  </div>
                  <input
                    type="text"
                    value={devisCity}
                    onChange={(e) => setDevisCity(e.target.value)}
                    placeholder="Ville"
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-900"
                  />
                  <textarea
                    rows={2}
                    value={devisNotes}
                    onChange={(e) => setDevisNotes(e.target.value)}
                    placeholder="Précisions ou délai souhaité (Optionnel)..."
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={devisSaving || devisItems.length === 0}
                  className="w-full py-3.5 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-black text-xs uppercase rounded-xl shadow-lg shadow-red-600/20 transition cursor-pointer"
                >
                  {devisSaving
                    ? 'Enregistrement...'
                    : '✅ Enregistrer & Télécharger Devis PDF (À Confirmer)'}
                </button>

                {createdDevisInfo && (
                  <div className="bg-emerald-50 border border-emerald-300 rounded-2xl p-3.5 space-y-2 text-xs text-emerald-950">
                    <div className="font-black">
                      ✅ Devis #{createdDevisInfo.docNumber} enregistré !
                    </div>
                    <p className="text-[11px] text-emerald-800">
                      Votre devis (en attente de confirmation) a été enregistré sur votre compte. Envoyez-le au responsable pour validation finale :
                    </p>
                    <div className="flex flex-col gap-1.5">
                      <a
                        href={`https://wa.me/212673011873?text=${encodeURIComponent(
                          `Bonjour Responsable VERDANOVE / GearShop,\n\nJe souhaite faire confirmer mon Devis N° *${createdDevisInfo.docNumber}* (${createdDevisInfo.totalTtc.toLocaleString('fr-FR')} DH TTC).\nClient : ${devisName} (${devisPhone})\nArticles : ${createdDevisInfo.summary}\nSuivi : https://www.gearshop.ma/suivi-commande?ref=${encodeURIComponent(createdDevisInfo.docNumber)}`
                        )}`}
                        target="_blank"
                        rel="noreferrer"
                        className="w-full py-2 bg-[#25D366] text-white font-bold rounded-xl text-center hover:brightness-105 transition"
                      >
                        📨 Envoyer au Responsable sur WhatsApp
                      </a>
                      <a
                        href={`mailto:Verdanove@gmail.com?subject=${encodeURIComponent(
                          `Confirmation Devis #${createdDevisInfo.docNumber} - ${devisName}`
                        )}&body=${encodeURIComponent(
                          `Bonjour,\n\nJe souhaite confirmer le Devis N° ${createdDevisInfo.docNumber} d'un montant TTC de ${createdDevisInfo.totalTtc} DH.\n\nClient : ${devisName}\nTél : ${devisPhone}\nArticles : ${createdDevisInfo.summary}`
                        )}`}
                        className="w-full py-2 bg-gray-900 text-white font-bold rounded-xl text-center hover:bg-black transition"
                      >
                        ✉️ Envoyer par Email à Verdanove@gmail.com
                      </a>
                    </div>
                  </div>
                )}
              </form>
            </div>
          </div>
        )}

        {/* ── TAB 3: MES COMMANDES, DEVIS & PAIEMENTS (SUIVI EN DIRECT) ─────────── */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            {/* Search Lookup Box */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                runSearch();
              }}
              className="bg-white p-6 rounded-3xl shadow-sm border border-gray-200/80 space-y-4"
            >
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
                <div>
                  <label className="block text-xs font-extrabold text-gray-700 uppercase tracking-wider mb-1.5">
                    📱 Téléphone (WhatsApp)
                  </label>
                  <input
                    type="tel"
                    value={phoneInput}
                    onChange={(e) => setPhoneInput(e.target.value)}
                    placeholder="Ex: 06 61 15 09 61"
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:border-red-600 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-extrabold text-gray-700 uppercase tracking-wider mb-1.5">
                    📄 Ou N° Devis / Commande
                  </label>
                  <input
                    type="text"
                    value={refInput}
                    onChange={(e) => setRefInput(e.target.value)}
                    placeholder="Ex: FA26... ou GS-..."
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 font-mono focus:border-red-600 outline-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-red-600/20 transition cursor-pointer"
                >
                  {loading ? 'Recherche...' : '🔍 Actualiser / Rechercher'}
                </button>
              </div>
            </form>

            {/* Summary KPI Strip & Filters */}
            {orders.length > 0 && (
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap gap-2">
                  {[
                    { id: 'all', label: `Tous (${orders.length})` },
                    { id: 'pending', label: `⏳ À Confirmer (${orders.filter((o) => o.status === 'New').length})` },
                    {
                      id: 'active',
                      label: `🚚 Confirmées / En Cours (${orders.filter((o) => ['Contacted', 'Negotiating', 'Waiting'].includes(o.status)).length})`,
                    },
                    { id: 'won', label: `🎉 Payées & Livrées (${orders.filter((o) => o.status === 'Won').length})` },
                  ].map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setOrderFilter(f.id as any)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition cursor-pointer ${
                        orderFilter === f.id
                          ? 'bg-gray-900 text-white border-gray-900'
                          : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Orders List */}
            {searchedOnce && (
              <div className="space-y-5">
                {filteredOrders.length === 0 ? (
                  <div className="bg-white p-8 rounded-3xl border border-gray-200 text-center space-y-3">
                    <div className="text-3xl">📦</div>
                    <h3 className="text-base font-bold text-gray-900">
                      Aucune commande ou devis trouvé
                    </h3>
                    <p className="text-xs text-gray-500 max-w-md mx-auto">
                      Créez votre premier devis en ligne dans l'onglet « Créer un Devis en Ligne », ou vérifiez votre numéro de téléphone ci-dessus.
                    </p>
                    <button
                      type="button"
                      onClick={() => setActiveTab('devis')}
                      className="px-5 py-2.5 bg-red-600 text-white text-xs font-bold rounded-xl cursor-pointer"
                    >
                      📋 Créer un Devis maintenant
                    </button>
                  </div>
                ) : (
                  filteredOrders.map((order) => {
                    const currentStep = getStepNumber(order.status);
                    const isConfirmed = order.status !== 'New' && order.status !== 'Lost';
                    const dateFormatted = new Date(order.created_at).toLocaleDateString('fr-FR', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric',
                    });

                    return (
                      <div
                        key={order.id}
                        className="bg-white rounded-3xl shadow-sm border border-gray-200/90 p-6 sm:p-8 space-y-5"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-gray-100 pb-4">
                          <div className="space-y-1.5">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="px-3 py-1 bg-gray-900 text-white rounded-lg text-xs font-black font-mono">
                                Dossier #{order.id}
                              </span>
                              {order.status === 'New' && (
                                <span className="px-3 py-1 bg-amber-100 text-amber-800 border border-amber-300 rounded-lg text-xs font-extrabold">
                                  ⏳ À CONFIRMER — Envoyez ce devis au responsable pour validation
                                </span>
                              )}
                              {isConfirmed && (
                                <span className="px-3 py-1 bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-lg text-xs font-extrabold">
                                  ✅ CONFIRMÉ PAR LE RESPONSABLE — Devis Officiel Validé
                                </span>
                              )}
                              <span className="text-xs text-gray-500">Le {dateFormatted}</span>
                            </div>

                            <h3 className="text-base sm:text-lg font-extrabold text-gray-900">
                              {order.product_name.replace(/\|\|ERP_JSON\|\|.*$/, '')}
                            </h3>
                            <p className="text-xs text-gray-500">
                              Client : <strong>{order.name}</strong>{' '}
                              {order.company ? `(${order.company})` : ''} • Tél : {order.phone} • Email : {order.email}
                            </p>
                          </div>

                          <div className="flex flex-col sm:items-end gap-2 shrink-0">
                            {order.deal_value > 0 && (
                              <div className="text-lg font-black text-gray-900 font-mono">
                                {order.deal_value.toLocaleString('fr-FR')} DH TTC
                              </div>
                            )}
                            <div className="flex flex-wrap gap-2">
                              <button
                                type="button"
                                onClick={() => handleDownloadOrderPdf(order)}
                                className="px-4 py-2 bg-gray-900 hover:bg-black text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition"
                              >
                                <i className="fa-solid fa-file-pdf text-red-500" />
                                <span>
                                  {isConfirmed
                                    ? 'Télécharger Devis Officiel Cacheté (PDF)'
                                    : 'Télécharger Devis PDF (À Confirmer)'}
                                </span>
                              </button>
                              <a
                                href={`https://wa.me/212673011873?text=${encodeURIComponent(
                                  order.status === 'New'
                                    ? `Bonjour Responsable VERDANOVE / GearShop,\n\nJe souhaite faire confirmer et vérifier mon devis / ma commande Dossier #${order.id} (${order.name}) : ${order.product_name}.\nLien suivi : https://www.gearshop.ma/suivi-commande?ref=${order.id}`
                                    : `Bonjour, je souhaite suivre mon dossier #${order.id} (${order.name}).`
                                )}`}
                                target="_blank"
                                rel="noreferrer"
                                className="px-3.5 py-2 bg-[#25D366] hover:brightness-105 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition"
                              >
                                <i className="fa-brands fa-whatsapp" />
                                <span>
                                  {order.status === 'New'
                                    ? 'Envoyer au Responsable (Confirmation)'
                                    : 'Contacter sur WhatsApp'}
                                </span>
                              </a>
                            </div>
                          </div>
                        </div>

                        {/* 5-Step Progress & Payment Tracker */}
                        {currentStep === -1 ? (
                          <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-700 font-bold">
                            ❌ Ce dossier / devis est annulé ou expiré.
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 pt-1">
                            {ORDER_STEPS.map((st) => {
                              const isCompleted = currentStep >= st.step;
                              const isCurrent = currentStep === st.step;
                              return (
                                <div
                                  key={st.step}
                                  className={`p-3.5 rounded-2xl border transition flex flex-col justify-between ${
                                    isCurrent
                                      ? 'bg-red-50/70 border-red-500 shadow-sm'
                                      : isCompleted
                                      ? 'bg-emerald-50/40 border-emerald-300'
                                      : 'bg-gray-50 border-gray-200 opacity-60'
                                  }`}
                                >
                                  <div className="flex items-center justify-between mb-2">
                                    <span
                                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black ${
                                        isCurrent
                                          ? 'bg-red-600 text-white'
                                          : isCompleted
                                          ? 'bg-emerald-600 text-white'
                                          : 'bg-gray-200 text-gray-600'
                                      }`}
                                    >
                                      {isCompleted && !isCurrent ? '✓' : st.step}
                                    </span>
                                    <i
                                      className={`fa-solid ${st.icon} text-sm ${
                                        isCurrent
                                          ? 'text-red-600'
                                          : isCompleted
                                          ? 'text-emerald-600'
                                          : 'text-gray-400'
                                      }`}
                                    />
                                  </div>
                                  <div>
                                    <div className="text-xs font-extrabold text-gray-900 leading-snug">
                                      {st.title}
                                    </div>
                                    <div className="text-[11px] text-gray-500 mt-1 leading-relaxed">
                                      {st.desc}
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientOrderTrackingPage;
