import React, { useState, useEffect } from "react";
import { collection, onSnapshot, addDoc, query, where, orderBy } from "firebase/firestore";
import { db } from "../firebase";
import { Product, StoreSettings, Wallet, BannerAd, CartItem, Order } from "../types";
import { motion, AnimatePresence } from "motion/react";
import { theme } from "../theme";
import AlMayarLogo from "./AlMayarLogo";
import { 
  ShoppingBag, Loader2, Search, X, ChevronRight, ChevronLeft, 
  Phone, Copy, Check, MessageSquare, Info, Filter,
  TrendingDown, Star, Sparkles, MapPin, Truck, ShieldCheck, Heart, Menu,
  Facebook, Instagram, Link
} from "lucide-react";

interface StoreFrontProps {
  onOpenAdmin: () => void;
  cart: CartItem[];
  setCart: React.Dispatch<React.SetStateAction<CartItem[]>>;
}

const ImageWithLoader = ({ src, alt, className }: { src: string, alt: string, className?: string }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  const finalSrc = hasError || !src ? "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=500" : src;

  return (
    <div className={`relative ${className} bg-stone-100 overflow-hidden`}>
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-stone-100">
          <Loader2 className="w-6 h-6 text-brand-primary animate-spin opacity-50" />
        </div>
      )}
      <img
        src={finalSrc}
        alt={alt}
        referrerPolicy="no-referrer"
        onLoad={() => setIsLoaded(true)}
        onError={() => { setHasError(true); setIsLoaded(true); }}
        className={`w-full h-full object-cover transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'} ${className}`}
      />
    </div>
  );
};

export default function StoreFront({ onOpenAdmin, cart, setCart }: StoreFrontProps) {
  // Database States
  const [products, setProducts] = useState<Product[]>([]);
  const [settings, setSettings] = useState<StoreSettings>({
    storeName: "الميار ستار",
    whatsappNumber: "+9647712345678",
    contactPhone: "07712345678",
    logoText: "الميار ستار ⭐ Al Mayar Star",
    allowCashOnDelivery: true,
    announcementText: "✨ أهلاً بكم في متجر الميار ستار لملابس النساء الأنيقة - شحن سريع لكافة المحافظات ✨",
    announcementActive: true
  });
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [banners, setBanners] = useState<BannerAd[]>([]);
  
  // UI States
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("الكل");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };
  
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [activeBannerIdx, setActiveBannerIdx] = useState(0);
  
  // Checkout Form States
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerCity, setCustomerCity] = useState("صنعاء");
  const [customerAddress, setCustomerAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'wallet'>('cash');
  const [selectedWalletId, setSelectedWalletId] = useState("");
  const [notes, setNotes] = useState("");
  const [copiedWalletId, setCopiedWalletId] = useState<string | null>(null);
  const [isOrderSubmitting, setIsOrderSubmitting] = useState(false);
  const [orderSuccessDetails, setOrderSuccessDetails] = useState<{orderNumber: string; whatsappMsg: string} | null>(null);

  // List of Yemeni Governorates for delivery drop down
  const yemeniGovernorates = [
    "صنعاء", "عدن", "تعز", "الحديدة", "حضرموت", "إب", "ذمار", 
    "أبين", "لحج", "شبوة", "مأرب", "الجوف", "البيضاء", "حجة", 
    "عمران", "المحويت", "ريمة", "صعدة", "الضالع", "المهرة", "سقطرى"
  ];

  // Subscribe to settings
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "settings"), (snapshot) => {
      snapshot.forEach((doc) => {
        if (doc.id === "main") {
          setSettings(doc.data() as StoreSettings);
        }
      });
    });
    return () => unsub();
  }, []);

  // Subscribe to products
  useEffect(() => {
    const q = query(collection(db, "products"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snapshot) => {
      const list: Product[] = [];
      snapshot.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() } as Product);
      });
      setProducts(list);
    });
    return () => unsub();
  }, []);

  // Subscribe to wallets
  useEffect(() => {
    const q = query(collection(db, "wallets"), where("active", "==", true));
    const unsub = onSnapshot(q, (snapshot) => {
      const list: Wallet[] = [];
      snapshot.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() } as Wallet);
      });
      setWallets(list);
      if (list.length > 0) {
        setSelectedWalletId(list[0].id);
      }
    });
    return () => unsub();
  }, []);

  // Subscribe to banners
  useEffect(() => {
    const q = query(collection(db, "banners"), where("active", "==", true));
    const unsub = onSnapshot(q, (snapshot) => {
      const list: BannerAd[] = [];
      snapshot.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() } as BannerAd);
      });
      setBanners(list);
    });
    return () => unsub();
  }, []);

  // Banner Slideshow timer
  useEffect(() => {
    if (banners.length > 1) {
      const interval = setInterval(() => {
        setActiveBannerIdx((prev) => (prev + 1) % banners.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [banners]);

  // Load favorites from local storage
  useEffect(() => {
    const stored = localStorage.getItem("mayar_favorites");
    if (stored) {
      setFavorites(JSON.parse(stored));
    }
  }, []);

  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    let updated = [...favorites];
    if (favorites.includes(id)) {
      updated = updated.filter(item => item !== id);
    } else {
      updated.push(id);
    }
    setFavorites(updated);
    localStorage.setItem("mayar_favorites", JSON.stringify(updated));
  };

  // Get categories
  const categories = ["الكل", ...Array.from(new Set(products.map(p => p.category)))];

  // Filtered Products
  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "الكل" || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Add to cart helper
  const handleAddToCart = (product: Product, size: string, color: string, qty: number) => {
    if (!size && product.sizes.length > 0) {
      showToast("الرجاء اختيار المقاس أولاً");
      return;
    }
    if (!color && product.colors.length > 0) {
      showToast("الرجاء اختيار اللون أولاً");
      return;
    }

    const existingIndex = cart.findIndex(
      item => item.product.id === product.id && 
              item.selectedSize === size && 
              item.selectedColor === color
    );

    if (existingIndex > -1) {
      const updated = [...cart];
      updated[existingIndex].quantity += qty;
      setCart(updated);
    } else {
      setCart([...cart, { product, selectedSize: size, selectedColor: color, quantity: qty }]);
    }

    // Reset details selections
    setQuantity(1);
    setSelectedProduct(null);
    setIsCartOpen(true);
  };

  // Cart actions
  const updateCartQty = (idx: number, amount: number) => {
    const updated = [...cart];
    updated[idx].quantity += amount;
    if (updated[idx].quantity <= 0) {
      updated.splice(idx, 1);
    }
    setCart(updated);
  };

  const removeFromCart = (idx: number) => {
    const updated = [...cart];
    updated.splice(idx, 1);
    setCart(updated);
  };

  const cartTotal = cart.reduce((total, item) => total + (item.product.price * item.quantity), 0);

  // Copy wallet address
  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedWalletId(id);
    setTimeout(() => setCopiedWalletId(null), 2500);
  };

  // Format currency
  const formatPrice = (price: number) => {
    return price.toLocaleString("ar-YM") + "ريال.يمني قديم";
  };

  // Handle Order Submit
  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !customerPhone || !customerAddress) {
      showToast("الرجاء ملء الحقول المطلوبة (الاسم الكامل، رقم الهاتف، العنوان)");
      return;
    }

    setIsOrderSubmitting(true);
    const orderNumber = "AM-" + Math.floor(1000 + Math.random() * 9000);

    const selectedWallet = paymentMethod === 'wallet' ? wallets.find(w => w.id === selectedWalletId) : null;

    const orderData: Omit<Order, 'id'> = {
      orderNumber,
      customerName,
      customerPhone,
      customerCity,
      customerAddress,
      items: cart.map(item => ({
        productId: item.product.id,
        name: item.product.name,
        price: item.product.price,
        quantity: item.quantity,
        selectedSize: item.selectedSize,
        selectedColor: item.selectedColor,
        image: item.product.images[0] || ""
      })),
      totalAmount: cartTotal,
      paymentMethod,
      walletId: selectedWallet ? selectedWallet.id : null,
      walletName: selectedWallet ? selectedWallet.name : null,
      walletNumber: selectedWallet ? selectedWallet.numberOrAddress : null,
      status: 'pending',
      createdAt: new Date().toISOString(),
      notes
    };

    try {
      // Add order to database
      await addDoc(collection(db, "orders"), orderData);

      // Generate elegant WhatsApp message
      let itemsListText = "";
      cart.forEach((item, index) => {
        itemsListText += `🔸 *${item.product.name}*\n   المقاس: ${item.selectedSize || "N/A"} | اللون: ${item.selectedColor || "N/A"} | العدد: ${item.quantity} | السعر: ${formatPrice(item.product.price)}\n`;
      });

      const paymentMethodText = paymentMethod === 'cash' 
        ? "الدفع عند الاستلام 💵" 
        : `تحويل محفظة إلكترونية 📱 (${selectedWallet?.name})`;

      const whatsappText = `✨ *طلب جديد من متجر الميار ستار* ✨\n\n` +
        `📦 *رقم الطلب:* ${orderNumber}\n` +
        `👤 *الاسم:* ${customerName}\n` +
        `📞 *الهاتف:* ${customerPhone}\n` +
        `📍 *المدينة:* ${customerCity}\n` +
        `🏡 *العنوان بالتفصيل:* ${customerAddress}\n` +
        `💳 *طريقة الدفع:* ${paymentMethodText}\n` +
        (paymentMethod === 'wallet' ? `🔗 *رقم/عنوان المحفظة:* ${selectedWallet?.numberOrAddress}\n` : "") +
        (notes ? `📝 *ملاحظات:* ${notes}\n` : "") +
        `\n🛒 *المنتجات المطلوبة:*\n${itemsListText}\n` +
        `💰 *المجموع الكلي للطلب:* *${formatPrice(cartTotal)}*\n\n` +
        `🛍️ _شكراً لتسوقكِ من متجر الميار ستار لملابس النساء الأنيقة والراقية_ 💖`;

      const encodedMsg = encodeURIComponent(whatsappText);
      setOrderSuccessDetails({
        orderNumber,
        whatsappMsg: encodedMsg
      });

      // Clear Cart
      setCart([]);
      setIsCheckoutOpen(false);
    } catch (error) {
      console.error("Error creating order: ", error);
      showToast("حدث خطأ أثناء إتمام الطلب، الرجاء المحاولة مرة أخرى.");
    } finally {
      setIsOrderSubmitting(false);
    }
  };

  const sendWhatsAppAndClose = () => {
    if (orderSuccessDetails) {
      const cleanPhone = settings.whatsappNumber.replace(/[+\s-]/g, "");
      const waUrl = `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${orderSuccessDetails.whatsappMsg}`;
      window.open(waUrl, "_blank");
      setOrderSuccessDetails(null);
    }
  };

  return (
    <div className={`min-h-screen ${theme.bg.base} ${theme.text.primary} font-sans selection:bg-brand-accent/20 selection:text-brand-text pb-16`} style={{ direction: "rtl" }}>
      
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: -20, x: "-50%" }}
            className="fixed top-4 left-1/2 z-[100] bg-stone-900 text-white px-6 py-3 rounded-full shadow-2xl text-sm font-bold flex items-center gap-2"
          >
            <Check className="w-4 h-4 text-brand-success" />
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* 1. Announcement Bar */}
      {settings.announcementActive && settings.announcementText && (
        <div className="bg-brand-primary text-white text-center text-xs py-2 px-4 font-medium flex items-center justify-center gap-2 overflow-hidden shadow-inner">
          <Sparkles className="w-3.5 h-3.5 text-brand-accent animate-pulse" />
          <span className="truncate">{settings.announcementText}</span>
        </div>
      )}

      {/* 2. Header */}
      <header className={`sticky top-0 z-40 ${theme.bg.card}/95 backdrop-blur-md border-b ${theme.border.base} ${theme.shadow.soft} transition-all duration-300`}>
        <div className="max-w-7xl mx-auto px-4 h-16 sm:h-20 flex items-center justify-between gap-4">
          
          {/* Logo / Branding */}
          <div className="flex items-center gap-2 sm:gap-3">
            <AlMayarLogo logoUrl={settings.logoUrl} size="md" className="shrink-0" />
            <div>
              <h1 className="text-base sm:text-lg font-black tracking-tight text-brand-primary leading-tight font-serif">
                {settings.storeName}
              </h1>
              <p className="text-[10px] sm:text-xs text-brand-text-secondary font-semibold tracking-wide">أرقى ملابس النساء الفاخرة</p>
            </div>
          </div>

          {/* Quick Search on Desktop */}
          <div className="hidden md:flex flex-1 max-w-md relative">
            <input
              type="text"
              placeholder="ابحثي عن فستان، جلابية، أو عباية..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-10 pr-4 py-2 rounded-full border ${theme.border.base} focus:outline-none focus:border-brand-primary ${theme.bg.secondary}/50 text-sm transition-all shadow-inner placeholder:text-stone-400`}
            />
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>

          {/* Control Actions */}
          <div className="flex items-center gap-2 sm:gap-4">
            
            <button
              id="admin-dashboard-access-btn"
              onClick={onOpenAdmin}
              className={`text-xs sm:text-sm font-semibold text-brand-primary hover:text-brand-primary-hover px-4 py-2 rounded-full border border-brand-primary hover:bg-brand-bg-secondary/40 transition-colors`}
            >
              لوحة الإدارة ⚙️
            </button>

            {/* Shopping Cart Trigger */}
            <button
              id="cart-trigger-btn"
              onClick={() => setIsCartOpen(true)}
              className={`relative p-2.5 rounded-full ${theme.bg.secondary} hover:bg-brand-border/60 text-brand-primary transition-all flex items-center justify-center border ${theme.border.base}`}
            >
              <ShoppingBag className="w-5 h-5 sm:w-5.5 sm:h-5.5" />
              {cart.length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-brand-primary text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-bounce shadow">
                  {cart.reduce((total, item) => total + item.quantity, 0)}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="px-4 pb-3 md:hidden">
          <div className="relative">
            <input
              type="text"
              placeholder="ابحثي عن فستان، جلابية، أو عباية..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-10 pr-4 py-2.5 rounded-full border ${theme.border.base} focus:outline-none focus:border-brand-primary ${theme.bg.secondary}/50 text-xs transition-all placeholder:text-stone-400`}
            />
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>
        </div>
      </header>

      {/* 3. Hero Carousel Banner Ads */}
      <section className="max-w-7xl mx-auto px-4 mt-4 sm:mt-6">
        {banners.length > 0 ? (
          <div className={`relative h-48 sm:h-80 md:h-96 w-full rounded-2xl overflow-hidden ${theme.shadow.medium} group border ${theme.border.base}/40`}>
            <AnimatePresence mode="wait">
              <motion.div
                key={activeBannerIdx}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6 }}
                className="absolute inset-0 w-full h-full bg-stone-900"
              >
                <ImageWithLoader
                  src={banners[activeBannerIdx].imageUrl}
                  alt={banners[activeBannerIdx].title}
                  className="w-full h-full object-cover opacity-85 object-center"
                />
                {/* Visual Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-stone-900/90 via-stone-900/40 to-transparent flex flex-col justify-end p-6 sm:p-12 text-right">
                  <motion.span
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-[10px] sm:text-xs font-bold text-brand-accent tracking-wider uppercase mb-1 sm:mb-2 flex items-center gap-1"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    الميار ستار للملابس النسائية
                  </motion.span>
                  <motion.h2
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="text-lg sm:text-3xl font-bold font-serif text-white max-w-xl leading-tight"
                  >
                    {banners[activeBannerIdx].title}
                  </motion.h2>
                  {banners[activeBannerIdx].subtitle && (
                    <motion.p
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.4 }}
                      className="text-xs sm:text-base text-stone-200 mt-1 sm:mt-3 max-w-md font-light leading-relaxed"
                    >
                      {banners[activeBannerIdx].subtitle}
                    </motion.p>
                  )}
                  {banners[activeBannerIdx].link && (
                    <motion.button
                      id={`banner-btn-${activeBannerIdx}`}
                      onClick={() => {
                        setSelectedCategory(banners[activeBannerIdx].link || "الكل");
                        const el = document.getElementById("store-products-anchor");
                        if (el) el.scrollIntoView({ behavior: "smooth" });
                      }}
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.5 }}
                      className="self-start mt-4 sm:mt-6 px-5 py-2 sm:px-6 sm:py-2.5 bg-white text-brand-primary hover:bg-brand-bg-secondary text-xs sm:text-sm font-bold rounded-full transition-all shadow-md transform hover:scale-105"
                    >
                      تسوقي هذا القسم الآن
                    </motion.button>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>
 
            {/* Slider Dots */}
            {banners.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                {banners.map((_, idx) => (
                  <button
                    key={idx}
                    id={`banner-dot-${idx}`}
                    onClick={() => setActiveBannerIdx(idx)}
                    className={`w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full transition-all ${
                      idx === activeBannerIdx ? "bg-white w-5 sm:w-6" : "bg-white/40 hover:bg-white/60"
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="w-full bg-brand-primary text-white p-12 text-center rounded-2xl flex flex-col items-center justify-center gap-3">
            <h2 className="text-2xl font-serif font-bold text-white">مرحباً بكِ في الميار ستار</h2>
            <p className="text-stone-300 max-w-md text-sm font-light">مجموعات أنيقة وفاخرة مصممة خصيصاً لأجلكِ ولإبراز طلتكِ المميزة.</p>
          </div>
        )}
      </section>
 
      {/* 4. Trust Badges Info Bar */}
      <section className="max-w-7xl mx-auto px-4 mt-6">
        <div className={`grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-6 ${theme.bg.card} p-5 rounded-2xl border ${theme.border.base} ${theme.shadow.soft} text-center sm:text-right`}>
          <div className="flex flex-col sm:flex-row items-center gap-3 p-2">
            <div className={`w-10 h-10 rounded-full ${theme.bg.secondary} flex items-center justify-center text-brand-primary border ${theme.border.base}`}>
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-brand-text">توصيل سريع وموثوق</h4>
              <p className="text-[10px] sm:text-xs text-brand-text-secondary mt-0.5">شحن آمن لجميع محافظات اليمن بأجور مدعومة</p>
            </div>
          </div>
          <div className={`flex flex-col sm:flex-row items-center gap-3 p-2 border-t sm:border-t-0 sm:border-r ${theme.border.base}/50`}>
            <div className={`w-10 h-10 rounded-full ${theme.bg.secondary} flex items-center justify-center text-brand-primary border ${theme.border.base}`}>
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-brand-text">أرقى الأقمشة النسائية</h4>
              <p className="text-[10px] sm:text-xs text-brand-text-secondary mt-0.5">خامات ممتازة مستوردة ومطرزة يدوياً بعناية فائقة</p>
            </div>
          </div>
          <div className={`flex flex-col sm:flex-row items-center gap-3 p-2 border-t sm:border-t-0 sm:border-r ${theme.border.base}/50`}>
            <div className={`w-10 h-10 rounded-full ${theme.bg.secondary} flex items-center justify-center text-brand-primary border ${theme.border.base}`}>
              <Phone className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-brand-text">تواصل مباشر 24/7</h4>
              <p className="text-[10px] sm:text-xs text-brand-text-secondary mt-0.5">فريق خدمة العملاء جاهز للإجابة على جميع استفساراتكِ</p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Store Catalog */}
      <section id="store-products-anchor" className="max-w-7xl mx-auto px-4 mt-8">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-lg sm:text-2xl font-serif font-black text-brand-primary flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-brand-accent" />
              تشكيلة ملابس الميار ستار النسائية
            </h3>
            <p className="text-xs sm:text-sm text-brand-text-secondary font-light mt-1">تصفحي المنتجات وانقري لإتمام الشراء بسهولة وسرعة</p>
          </div>
        </div>

        {/* Category Pills Slider */}
        <div className="flex gap-2 overflow-x-auto pb-3 scrollbar-hide select-none max-w-full">
          {categories.map((cat) => (
            <button
              key={cat}
              id={`cat-pill-${cat}`}
              onClick={() => setSelectedCategory(cat)}
              className={`flex-shrink-0 px-5 py-2.5 rounded-full text-xs sm:text-sm font-semibold transition-all shadow-sm ${
                selectedCategory === cat
                  ? "bg-brand-primary text-white scale-105"
                  : "bg-white text-brand-text-secondary hover:bg-brand-bg-secondary hover:text-brand-primary border border-brand-border/40"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Catalog Grid */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 mt-4">
            {filteredProducts.map((p) => {
              const hasDiscount = p.oldPrice && p.oldPrice > p.price;
              const discountPercent = hasDiscount 
                ? Math.round(((p.oldPrice! - p.price) / p.oldPrice!) * 100)
                : 0;
              const isFav = favorites.includes(p.id);

              return (
                <div
                  key={p.id}
                  id={`product-card-${p.id}`}
                  onClick={() => {
                    setSelectedProduct(p);
                    setActiveImageIdx(0);
                    setSelectedSize(p.sizes[0] || "");
                    setSelectedColor(p.colors[0] || "");
                  }}
                  className={`bg-white rounded-2xl border border-brand-border/40 hover:border-brand-accent/45 shadow-[0_2px_15px_rgba(46,58,89,0.02)] hover:shadow-[0_8px_30px_rgba(46,58,89,0.06)] transition-all duration-300 overflow-hidden group flex flex-col h-full cursor-pointer relative`}
                >
                  
                  {/* Image Stage */}
                  <div className="aspect-[3/4] bg-stone-100 relative overflow-hidden flex-shrink-0">
                    <ImageWithLoader
                      src={p.images && p.images.length > 0 ? p.images[0] : ""}
                      alt={p.name}
                      className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-110"
                    />
                    
                    {/* Dark/Transparent Overlay on Hover */}
                    <div className="absolute inset-0 bg-stone-900/5 opacity-0 group-hover:opacity-100 transition-opacity" />

                    {/* Stock indicator badge */}
                    {!p.inStock && (
                      <div className="absolute inset-0 bg-white/80 backdrop-blur-[1px] flex items-center justify-center z-10">
                        <span className="bg-brand-primary text-white text-xs font-bold px-4 py-2 rounded-full shadow-md">
                          نفذت الكمية 😔
                        </span>
                      </div>
                    )}

                    {/* Status badges */}
                    <div className="absolute top-3 right-3 flex flex-col gap-1.5 z-10 pointer-events-none">
                      {p.isNew && (
                        <span className="bg-brand-primary text-white text-[9px] sm:text-xs font-bold px-2 py-0.5 rounded-full shadow-sm text-center">
                          وصل حديثاً ✨
                        </span>
                      )}
                      {hasDiscount && (
                        <span className="bg-brand-accent text-white text-[9px] sm:text-xs font-black px-2 py-0.5 rounded-full shadow-sm text-center flex items-center gap-0.5">
                          <TrendingDown className="w-3 h-3" />
                          خصم {discountPercent}%
                        </span>
                      )}
                    </div>

                    {/* Favorite Heart trigger */}
                    <button
                      id={`fav-btn-${p.id}`}
                      onClick={(e) => toggleFavorite(p.id, e)}
                      className={`absolute bottom-3 right-3 p-2 rounded-full shadow backdrop-blur-md transition-all duration-300 z-10 ${
                        isFav 
                          ? "bg-brand-accent text-white hover:bg-brand-accent/90 scale-110" 
                          : "bg-white/90 text-brand-text-secondary hover:text-brand-accent hover:bg-white hover:scale-105"
                      }`}
                    >
                      <Heart className="w-4 h-4 fill-current" />
                    </button>
                  </div>

                  {/* Card Content */}
                  <div className="p-3 sm:p-4 flex flex-col flex-1 text-right">
                    
                    {/* Category */}
                    <span className="text-[10px] sm:text-xs text-brand-accent font-semibold tracking-wider">
                      {p.category}
                    </span>

                    {/* Title */}
                    <h4 className="text-xs sm:text-sm font-bold text-brand-text mt-1 line-clamp-1 group-hover:text-brand-primary transition-colors">
                      {p.name}
                    </h4>

                    {/* Description excerpt */}
                    <p className="text-[10px] sm:text-xs text-brand-text-secondary mt-1 line-clamp-1 font-light">
                      {p.description}
                    </p>

                    {/* Size list preview */}
                    {p.sizes.length > 0 && (
                      <div className="flex gap-1 flex-wrap mt-2 select-none pointer-events-none">
                        {p.sizes.slice(0, 3).map(sz => (
                          <span key={sz} className="text-[9px] px-1.5 py-0.5 border border-brand-border/40 rounded text-brand-text-secondary">
                            {sz}
                          </span>
                        ))}
                        {p.sizes.length > 3 && (
                          <span className="text-[9px] text-brand-text-secondary">+{p.sizes.length - 3}</span>
                        )}
                      </div>
                    )}

                    {/* Pricing */}
                    <div className={`mt-auto pt-3 flex items-baseline justify-between flex-wrap gap-1 border-t border-brand-border/30`}>
                      <div className="flex flex-col">
                        <span className="text-xs sm:text-sm font-extrabold text-brand-primary">
                          {formatPrice(p.price)}
                        </span>
                        {hasDiscount && (
                          <span className="text-[10px] sm:text-xs text-brand-text-secondary line-through">
                            {formatPrice(p.oldPrice!)}
                          </span>
                        )}
                      </div>

                      <span className="text-[10px] text-brand-accent group-hover:underline font-bold">
                        رؤية التفاصيل ←
                      </span>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className={`bg-white border border-brand-border/40 rounded-2xl p-12 text-center ${theme.shadow.soft}`}>
            <ShoppingBag className="w-12 h-12 text-stone-300 mx-auto mb-3" />
            <p className="text-brand-text-secondary font-medium">لم نجد منتجات في هذا القسم حالياً.</p>
            <button
              id="reset-filter-btn"
              onClick={() => { setSelectedCategory("الكل"); setSearchTerm(""); }}
              className="mt-3 text-xs font-semibold text-brand-primary underline hover:text-brand-primary-hover"
            >
              عرض كافة ملابس المتجر
            </button>
          </div>
        )}
      </section>

      {/* 6. Product Quick Detail Modal */}
      <AnimatePresence>
        {selectedProduct && (
          <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
            
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedProduct(null)}
              className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm"
            />

            {/* Modal Box */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className={`bg-white rounded-3xl overflow-hidden shadow-[0_15px_50px_rgba(46,58,89,0.15)] max-w-4xl w-full max-h-[90vh] md:max-h-none overflow-y-auto flex flex-col md:flex-row relative z-10 border ${theme.border.base}`}
            >
              
              {/* Close trigger */}
              <button
                id="close-prod-modal"
                onClick={() => setSelectedProduct(null)}
                className={`absolute top-4 left-4 p-2 rounded-full ${theme.bg.secondary} hover:bg-brand-border text-brand-text transition-colors z-20`}
              >
                <X className="w-5 h-5" />
              </button>

              {/* Images Gallery */}
              <div className="w-full md:w-1/2 p-4 sm:p-6 bg-stone-50/50 flex flex-col gap-3">
                <div className={`aspect-[3/4] rounded-2xl overflow-hidden bg-white border ${theme.border.base} shadow-inner relative`}>
                  <ImageWithLoader
                    src={selectedProduct.images && selectedProduct.images.length > 0 ? selectedProduct.images[activeImageIdx] : ""}
                    alt={selectedProduct.name}
                    className="w-full h-full object-cover object-top"
                  />
                </div>

                {/* Thumbnail carousels */}
                {selectedProduct.images.length > 1 && (
                  <div className="flex gap-2 justify-center py-1 overflow-x-auto select-none">
                    {selectedProduct.images.map((img, idx) => (
                      <button
                        key={idx}
                        id={`thumb-${idx}`}
                        onClick={() => setActiveImageIdx(idx)}
                        className={`w-14 h-18 rounded-lg overflow-hidden border-2 flex-shrink-0 transition-all ${
                          idx === activeImageIdx ? "border-brand-accent scale-105 shadow-md" : "border-transparent opacity-70 hover:opacity-100"
                        }`}
                      >
                        <ImageWithLoader src={img} alt="thumbnail" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Product Specifications & Purchase triggers */}
              <div className="w-full md:w-1/2 p-6 sm:p-8 text-right flex flex-col justify-between">
                <div>
                  
                  {/* Category */}
                  <span className="text-xs font-bold text-brand-accent bg-brand-bg-secondary px-3 py-1 rounded-full border border-brand-accent/20">
                    {selectedProduct.category}
                  </span>

                  {/* Title */}
                  <h3 className="text-lg sm:text-2xl font-bold text-brand-text mt-4 leading-tight font-serif">
                    {selectedProduct.name}
                  </h3>

                  {/* Pricing */}
                  <div className="flex items-center gap-3 mt-3">
                    <span className="text-xl sm:text-2xl font-black text-brand-primary">
                      {formatPrice(selectedProduct.price)}
                    </span>
                    {selectedProduct.oldPrice && selectedProduct.oldPrice > selectedProduct.price && (
                      <span className="text-brand-text-secondary line-through text-sm sm:text-base font-light">
                        {formatPrice(selectedProduct.oldPrice!)}
                      </span>
                    )}
                  </div>

                  {/* Divider */}
                  <div className={`border-b ${theme.border.base} my-4`} />

                  {/* Description */}
                  <h5 className="text-xs font-bold text-brand-text-secondary">الوصف والتفاصيل:</h5>
                  <p className="text-xs sm:text-sm text-brand-text mt-1 leading-relaxed">
                    {selectedProduct.description}
                  </p>

                  {/* Size Select */}
                  {selectedProduct.sizes.length > 0 && (
                    <div className="mt-5">
                      <h5 className="text-xs font-bold text-brand-text mb-2">حددي المقاس:</h5>
                      <div className="flex gap-2 flex-wrap">
                        {selectedProduct.sizes.map((sz) => (
                          <button
                            key={sz}
                            id={`size-${sz}`}
                            onClick={() => setSelectedSize(sz)}
                            className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg border transition-all ${
                              selectedSize === sz
                                ? "bg-brand-primary text-white border-brand-primary shadow-sm"
                                : "bg-white text-brand-text border-brand-border hover:bg-brand-bg-secondary"
                            }`}
                          >
                            {sz}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Color Select */}
                  {selectedProduct.colors.length > 0 && (
                    <div className="mt-5">
                      <h5 className="text-xs font-bold text-brand-text mb-2">حددي اللون:</h5>
                      <div className="flex gap-2 flex-wrap">
                        {selectedProduct.colors.map((col) => (
                          <button
                            key={col}
                            id={`color-${col}`}
                            onClick={() => setSelectedColor(col)}
                            className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg border transition-all ${
                              selectedColor === col
                                ? "bg-brand-primary text-white border-brand-primary shadow-sm"
                                : "bg-white text-brand-text border-brand-border hover:bg-brand-bg-secondary"
                            }`}
                          >
                            {col}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Quantity Select */}
                  <div className="mt-5">
                    <h5 className="text-xs font-bold text-brand-text mb-2">الكمية المطلوبة:</h5>
                    <div className={`flex items-center gap-3 w-32 border ${theme.border.base} rounded-lg p-1 bg-stone-50 select-none`}>
                      <button
                        id="qty-minus"
                        onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                        className={`w-8 h-8 rounded-md bg-white hover:bg-stone-100 flex items-center justify-center font-bold ${theme.text.secondary} transition-colors shadow-sm`}
                      >
                        -
                      </button>
                      <span className="flex-1 text-center text-sm font-bold text-brand-text">
                        {quantity}
                      </span>
                      <button
                        id="qty-plus"
                        onClick={() => setQuantity(prev => prev + 1)}
                        className={`w-8 h-8 rounded-md bg-white hover:bg-stone-100 flex items-center justify-center font-bold ${theme.text.secondary} transition-colors shadow-sm`}
                      >
                        +
                      </button>
                    </div>
                  </div>

                </div>

                {/* Purchase Trigger */}
                <div className={`mt-8 pt-4 border-t ${theme.border.base}/60 flex items-center gap-3`}>
                  {selectedProduct.inStock ? (
                    <button
                      id="add-to-cart-action"
                      onClick={() => handleAddToCart(selectedProduct, selectedSize, selectedColor, quantity)}
                      className={`w-full py-3.5 bg-brand-primary hover:bg-brand-primary-hover text-white font-extrabold text-sm sm:text-base rounded-full ${theme.shadow.medium} transition-all flex items-center justify-center gap-2 transform hover:scale-[1.01]`}
                    >
                      <ShoppingBag className="w-5 h-5" />
                      أضيفي لـ سلة المشتريات 🛍️
                    </button>
                  ) : (
                    <button
                      id="disabled-add-to-cart"
                      disabled
                      className="w-full py-3.5 bg-stone-200 text-stone-400 font-bold text-sm sm:text-base rounded-full cursor-not-allowed text-center"
                    >
                      المنتج غير متوفر حالياً 😔
                    </button>
                  )}
                </div>

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 7. Slide-In Shopping Cart Drawer */}
      <AnimatePresence>
        {isCartOpen && (
          <div className="fixed inset-0 z-50 overflow-hidden">
            
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCartOpen(false)}
              className="fixed inset-0 bg-stone-950/40 backdrop-blur-sm"
            />

            <div className="absolute inset-y-0 left-0 max-w-full flex">
              <motion.div
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ type: "tween", duration: 0.35 }}
                className={`w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between border-r ${theme.border.base}`}
              >
                
                {/* Drawer Header */}
                <div className={`p-6 border-b ${theme.border.base} flex items-center justify-between text-right`}>
                  <div className="flex items-center gap-2">
                    <ShoppingBag className="w-5 h-5 text-brand-accent" />
                    <h3 className="text-base sm:text-lg font-bold text-brand-text">سلة التسوق الخاصة بكِ</h3>
                  </div>
                  <button
                    id="close-cart-drawer"
                    onClick={() => setIsCartOpen(false)}
                    className={`p-1.5 rounded-full hover:bg-brand-bg-secondary ${theme.text.secondary} transition-colors`}
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Items Area */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-6 text-right">
                  {cart.length > 0 ? (
                    <div className="flex flex-col gap-4">
                      {cart.map((item, idx) => (
                        <div
                          key={`${item.product.id}-${item.selectedSize}-${item.selectedColor}`}
                          className={`flex gap-3 p-3 rounded-xl bg-brand-bg-secondary/40 border ${theme.border.base}/40 shadow-inner group relative`}
                        >
                          {/* Image */}
                          <div className="w-16 h-20 bg-stone-200 rounded-lg overflow-hidden flex-shrink-0">
                            <ImageWithLoader
                              src={item.product.images && item.product.images.length > 0 ? item.product.images[0] : ""}
                              alt={item.product.name}
                              className="w-full h-full object-cover"
                            />
                          </div>

                          {/* Info details */}
                          <div className="flex-1 min-w-0 flex flex-col justify-between text-right">
                            <div>
                              <h5 className="text-xs sm:text-sm font-bold text-brand-text truncate">
                                {item.product.name}
                              </h5>
                              <div className="flex gap-2 flex-wrap mt-0.5 select-none">
                                {item.selectedSize && (
                                  <span className="text-[10px] font-medium text-brand-accent bg-brand-bg-secondary px-1.5 py-0.5 rounded border border-brand-accent/20">
                                    المقاس: {item.selectedSize}
                                  </span>
                                )}
                                {item.selectedColor && (
                                  <span className="text-[10px] font-medium text-brand-accent bg-brand-bg-secondary px-1.5 py-0.5 rounded border border-brand-accent/20">
                                    اللون: {item.selectedColor}
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Qty edit & pricing */}
                            <div className="flex items-center justify-between mt-2 flex-wrap gap-1">
                              <div className={`flex items-center gap-2 border ${theme.border.base} rounded-md p-0.5 bg-white scale-90 select-none`}>
                                <button
                                  id={`qty-minus-cart-${idx}`}
                                  onClick={() => updateCartQty(idx, -1)}
                                  className="w-6 h-6 rounded bg-stone-50 flex items-center justify-center text-xs font-bold"
                                >
                                  -
                                </button>
                                <span className="text-xs font-bold text-brand-text min-w-4 text-center">
                                  {item.quantity}
                                </span>
                                <button
                                  id={`qty-plus-cart-${idx}`}
                                  onClick={() => updateCartQty(idx, 1)}
                                  className="w-6 h-6 rounded bg-stone-50 flex items-center justify-center text-xs font-bold"
                                >
                                  +
                                </button>
                              </div>

                              <span className="text-xs sm:text-sm font-black text-brand-primary">
                                {formatPrice(item.product.price * item.quantity)}
                              </span>
                            </div>
                          </div>

                          {/* Delete Item button */}
                          <button
                            id={`del-cart-item-${idx}`}
                            onClick={() => removeFromCart(idx)}
                            className="absolute -top-1.5 -left-1.5 p-1 rounded-full bg-brand-error hover:bg-brand-error/90 text-white shadow opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center py-12 text-center text-stone-400 gap-3">
                      <ShoppingBag className="w-12 h-12 text-stone-200" />
                      <p className="text-sm">سلة المشتريات فارغة تماماً.</p>
                      <button
                        id="start-shopping-btn"
                        onClick={() => setIsCartOpen(false)}
                        className="text-xs font-bold text-brand-primary underline"
                      >
                        ابدئي باكتشاف ملابس المتجر الآن
                      </button>
                    </div>
                  )}
                </div>

                {/* Footer Drawer Info & Checkout */}
                {cart.length > 0 && (
                  <div className={`p-4 sm:p-6 border-t ${theme.border.base} bg-gradient-to-br from-stone-50 to-stone-100 text-right`}>
                    
                    {/* Invoice Promotional Card */}
                    <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-4 mb-5 relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-12 h-12 bg-brand-primary/5 rounded-bl-full" />
                      <div className="absolute bottom-0 left-0 w-16 h-16 bg-brand-accent/5 rounded-tr-full" />
                      
                      <div className="relative z-10 space-y-2">
                        <div className="flex items-center justify-between text-stone-600 text-xs font-bold border-b border-dashed border-stone-200 pb-2 mb-2">
                          <span>ملخص فاتورتكِ (بطاقة ترويجية)</span>
                          <span className="bg-brand-primary/10 text-brand-primary px-2 py-0.5 rounded text-[10px]">✨ عرض خاص</span>
                        </div>
                        
                        <div className="flex justify-between items-center text-xs text-stone-500">
                          <span>قيمة المنتجات ({cart.length} قطع)</span>
                          <span className="font-medium text-stone-800">{formatPrice(cartTotal)}</span>
                        </div>
                        <div className="flex justify-between items-center text-xs text-stone-500 pb-2 border-b border-stone-100">
                          <span>رسوم التوصيل</span>
                          <span className="font-medium text-stone-800">تحدد عند الدفع</span>
                        </div>
                        
                        <div className="flex items-center justify-between pt-1">
                          <span className="text-sm font-bold text-stone-700">المجموع النهائي:</span>
                          <span className="text-lg font-black text-brand-primary drop-shadow-sm">
                            {formatPrice(cartTotal)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <p className="text-[10px] text-brand-text-secondary mb-4 leading-normal flex items-start gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 shrink-0 text-brand-success" />
                      <span>يرجى إتمام الطلب لتعبئة تفاصيل التوصيل واختيار طريقة الدفع المناسبة لكِ. التسوق آمن ومضمون 100%.</span>
                    </p>

                    <button
                      id="start-checkout-btn"
                      onClick={() => {
                        setIsCartOpen(false);
                        setIsCheckoutOpen(true);
                      }}
                      className="w-full py-4 bg-brand-primary hover:bg-brand-primary-hover text-white text-sm sm:text-base font-bold rounded-2xl shadow-[0_8px_20px_rgb(0,0,0,0.12)] hover:shadow-[0_8px_25px_rgb(0,0,0,0.2)] transition-all text-center flex items-center justify-center gap-2 transform active:scale-95"
                    >
                      متابعة الشراء وتثبيت الطلب 🛍️
                    </button>
                  </div>
                )}

              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* 8. Checkout Modal with Secure Payment selection & Auto-WhatsApp format */}
      <AnimatePresence>
        {isCheckoutOpen && (
          <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
            
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCheckoutOpen(false)}
              className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm"
            />

            {/* Form Container */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-white rounded-3xl overflow-hidden shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 text-right relative z-10 border border-rose-100"
            >
              
              <button
                id="close-checkout-modal"
                onClick={() => setIsCheckoutOpen(false)}
                className="absolute top-4 left-4 p-2 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 transition-colors z-20"
              >
                <X className="w-5 h-5" />
              </button>

              <h3 className="text-lg sm:text-xl font-serif font-bold text-[#722F37] mb-2 flex items-center gap-2">
                ✍️ تأكيد الطلب وتفاصيل الشحن
              </h3>
              <p className="text-xs text-stone-400 mb-6">الرجاء إدخال تفاصيل دقيقة لتصلكِ طلبيتكِ بأسرع وقت ممكن.</p>

              <form onSubmit={handlePlaceOrder} className="space-y-4">
                
                {/* Full Name */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">الاسم الكامل للمستلمة *</label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: مريم علي السعدي"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className={`w-full px-4 py-2.5 rounded-xl border ${theme.border.base} focus:outline-none focus:border-brand-primary ${theme.bg.secondary}/50 text-sm transition-all shadow-inner`}
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-xs font-bold text-brand-text mb-1">رقم هاتف المستلمة *</label>
                  <input
                    type="tel"
                    required
                    placeholder="مثال: 07701234567"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className={`w-full px-4 py-2.5 rounded-xl border ${theme.border.base} focus:outline-none focus:border-brand-primary ${theme.bg.secondary}/50 text-sm transition-all shadow-inner text-left`}
                    style={{ direction: "ltr" }}
                  />
                </div>

                {/* City & Address */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-brand-text mb-1">المحافظة *</label>
                    <select
                      value={customerCity}
                      onChange={(e) => setCustomerCity(e.target.value)}
                      className={`w-full px-4 py-2.5 rounded-xl border ${theme.border.base} focus:outline-none focus:border-brand-primary ${theme.bg.secondary}/50 text-sm transition-all shadow-inner cursor-pointer`}
                    >
                      {yemeniGovernorates.map((city) => (
                        <option key={city} value={city}>{city}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-brand-text mb-1">العنوان بالتفصيل *</label>
                    <input
                      type="text"
                      required
                      placeholder="الحي، اسم الشارع، رقم الدار، معلم قريب"
                      value={customerAddress}
                      onChange={(e) => setCustomerAddress(e.target.value)}
                      className={`w-full px-4 py-2.5 rounded-xl border ${theme.border.base} focus:outline-none focus:border-brand-primary ${theme.bg.secondary}/50 text-sm transition-all shadow-inner`}
                    />
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-xs font-bold text-brand-text mb-1">ملاحظات خاصة (اختياري)</label>
                  <textarea
                    rows={2}
                    placeholder="أي تعليمات خاصة بالسائق، أو المقاس، أو تعديلات..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className={`w-full px-4 py-2.5 rounded-xl border ${theme.border.base} focus:outline-none focus:border-brand-primary ${theme.bg.secondary}/50 text-sm transition-all shadow-inner`}
                  />
                </div>

                {/* Payment Option Selection */}
                <div className={`mt-6 border-t ${theme.border.base} pt-5`}>
                  <h5 className="text-xs font-bold text-brand-text mb-3">طريقة الدفع المناسبة لكِ:</h5>
                  <div className="grid grid-cols-2 gap-3">
                    
                    {settings.allowCashOnDelivery && (
                      <button
                        type="button"
                        id="pay-cash-btn"
                        onClick={() => setPaymentMethod('cash')}
                        className={`p-4 rounded-2xl border text-right transition-all flex flex-col justify-between ${
                          paymentMethod === 'cash'
                            ? "bg-brand-primary/5 border-brand-primary ring-1 ring-brand-primary"
                            : "bg-white border-brand-border hover:bg-brand-bg-secondary"
                        }`}
                      >
                        <span className="text-xs sm:text-sm font-bold text-brand-text flex items-center gap-1.5">
                          💵 الدفع عند الاستلام
                        </span>
                        <p className="text-[10px] text-brand-text-secondary mt-2 leading-relaxed">ادفعي نقداً عند استلام طلبيتكِ من سائق التوصيل.</p>
                      </button>
                    )}

                    {wallets.length > 0 && (
                      <button
                        type="button"
                        id="pay-wallet-btn"
                        onClick={() => setPaymentMethod('wallet')}
                        className={`p-4 rounded-2xl border text-right transition-all flex flex-col justify-between ${
                          paymentMethod === 'wallet'
                            ? "bg-brand-primary/5 border-brand-primary ring-1 ring-brand-primary"
                            : "bg-white border-brand-border hover:bg-brand-bg-secondary"
                        }`}
                      >
                        <span className="text-xs sm:text-sm font-bold text-brand-text flex items-center gap-1.5">
                          📱 تحويل محفظة إلكترونية
                        </span>
                        <p className="text-[10px] text-brand-text-secondary mt-2 leading-relaxed">تحويل سريع وآمن عبر زين كاش، آسيا حوالة أو USDT.</p>
                      </button>
                    )}
                  </div>
                </div>

                {/* Wallet Details Drawer inside Checkout */}
                {paymentMethod === 'wallet' && wallets.length > 0 && (
                  <div className="bg-brand-primary/5 rounded-2xl p-4 border border-brand-border/40 mt-3 space-y-3">
                    <label className="block text-xs font-bold text-brand-text">اختر المحفظة لتحويل المبلغ:</label>
                    <select
                      value={selectedWalletId}
                      onChange={(e) => setSelectedWalletId(e.target.value)}
                      className="w-full px-4 py-2 rounded-xl border border-brand-border bg-white text-xs sm:text-sm cursor-pointer"
                    >
                      {wallets.map((w) => (
                        <option key={w.id} value={w.id}>{w.name}</option>
                      ))}
                    </select>

                    {/* Show selected wallet details */}
                    {(() => {
                      const wall = wallets.find(w => w.id === selectedWalletId);
                      if (!wall) return null;
                      return (
                        <div className={`bg-white p-3.5 rounded-xl border ${theme.border.base} text-right space-y-2 relative shadow-sm`}>
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs text-brand-text-secondary">رقم/عنوان المحفظة:</span>
                            <button
                              type="button"
                              id="copy-wallet-btn"
                              onClick={() => copyToClipboard(wall.numberOrAddress, wall.id)}
                              className="px-2.5 py-1 text-[10px] sm:text-xs font-semibold bg-brand-bg-secondary hover:bg-brand-border text-brand-primary border border-brand-border rounded-full flex items-center gap-1 transition-all"
                            >
                              {copiedWalletId === wall.id ? (
                                <>
                                  <Check className="w-3.5 h-3.5 text-green-600" />
                                  تم النسخ!
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3.5 h-3.5" />
                                  نسخ الرقم
                                </>
                              )}
                            </button>
                          </div>
                          <p className="text-sm font-black text-brand-text break-all select-all font-mono py-1 border-b border-stone-100">
                            {wall.numberOrAddress}
                          </p>
                          {wall.holderName && (
                            <p className="text-xs text-brand-text-secondary">
                              اسم صاحب الحساب: <strong className="text-brand-text">{wall.holderName}</strong>
                            </p>
                          )}
                          {wall.instructions && (
                            <p className="text-[10px] text-brand-accent font-light leading-relaxed bg-brand-accent/5 p-2 rounded-lg border border-brand-accent/20">
                              💡 {wall.instructions}
                            </p>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                )}

                {/* Total Summary */}
                <div className={`p-4 bg-brand-bg-secondary/60 rounded-2xl border ${theme.border.base} mt-6 flex items-center justify-between`}>
                  <span className="text-xs sm:text-sm font-bold text-brand-text">إجمالي المشتريات المستحق دفعها:</span>
                  <span className="text-base sm:text-lg font-black text-brand-primary">{formatPrice(cartTotal)}</span>
                </div>

                {/* Final Place Order */}
                <button
                  type="submit"
                  id="place-order-submit"
                  disabled={isOrderSubmitting}
                  className="w-full py-4 bg-brand-primary hover:bg-brand-primary-hover text-white text-sm sm:text-base font-black rounded-full shadow-lg transition-all text-center flex items-center justify-center gap-2 transform hover:scale-[1.01] disabled:bg-stone-300"
                >
                  {isOrderSubmitting ? (
                    "قيد تسجيل طلبكِ..."
                  ) : (
                    <>
                      <ShoppingBag className="w-5 h-5" />
                      تثبيت الطلب وإرسال عبر الواتساب 🛒
                    </>
                  )}
                </button>

              </form>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 9. Order Success and WhatsApp Transfer Drawer */}
      <AnimatePresence>
        {orderSuccessDetails && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm"
            />

            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className={`bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full text-center relative z-10 border ${theme.border.base} shadow-2xl space-y-5`}
            >
              <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center border border-green-200 mx-auto text-green-600 animate-bounce">
                <Check className="w-8 h-8" />
              </div>

              <div className="space-y-2 text-right">
                <h3 className="text-lg sm:text-xl font-bold text-brand-text text-center font-serif">🎉 تم تسجيل طلبكِ بنجاح!</h3>
                <p className="text-xs text-brand-text-secondary text-center">رقم الطلب الخاص بكِ هو: <strong className="text-brand-accent font-mono text-sm">{orderSuccessDetails.orderNumber}</strong></p>
                
                <div className={`border border-brand-accent/20 p-4 rounded-2xl bg-brand-accent/5 text-xs sm:text-sm text-brand-text leading-relaxed mt-4`}>
                  <p className="font-bold text-brand-primary mb-1">💡 الخطوة التالية والأخيرة لتأكيد طلبكِ:</p>
                  يرجى النقر على الزر بالأسفل لإرسال تفاصيل الفاتورة وقائمة المنتجات تلقائياً إلى رقم إدارة متجر <strong className="font-bold">الميار ستار</strong> عبر تطبيق الواتساب لمتابعة الشحن والتوصيل.
                </div>
              </div>

              <button
                id="send-wa-success-btn"
                onClick={sendWhatsAppAndClose}
                className="w-full py-3.5 bg-green-600 hover:bg-green-700 text-white font-black text-sm sm:text-base rounded-full shadow-lg transition-all flex items-center justify-center gap-2 transform hover:scale-[1.02]"
              >
                <MessageSquare className="w-5 h-5 fill-current" />
                إرسال التفاصيل لتأكيد الطلب عبر واتساب 💬
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 10. Footer Section */}
      <footer className="mt-16 bg-stone-900 text-stone-400 py-10 px-4 border-t border-stone-800 text-center sm:text-right">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <div className="space-y-4 flex flex-col items-center sm:items-start text-center sm:text-right">
            <div className="flex items-center gap-3">
              <AlMayarLogo logoUrl={settings.logoUrl} size="sm" className="bg-white/5 rounded-full p-0.5 border border-stone-800" />
              <h4 className="text-white font-serif font-black text-lg">{settings.storeName}</h4>
            </div>
            <p className="text-xs text-stone-500 font-light leading-relaxed">
              {settings.footerDescription || "متجر الميار لملابس النساء الأنيقة والراقية في العراق. نوفر لكِ تشكيلة واسعة من فساتين السهرة والجلابيات والعبايات المصنوعة بأعلى جودة."}
            </p>
          </div>

          <div className="space-y-3">
            <h5 className="text-white font-bold text-sm">أقسام المتجر السريعة</h5>
            <ul className="text-xs space-y-2 select-none">
              {categories.slice(0, 5).map(cat => (
                <li key={cat}>
                  <button
                    id={`footer-cat-${cat}`}
                    onClick={() => {
                      setSelectedCategory(cat);
                      const el = document.getElementById("store-products-anchor");
                      if (el) el.scrollIntoView({ behavior: "smooth" });
                    }}
                    className="hover:text-brand-accent transition-colors"
                  >
                    {cat}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-3">
            <h5 className="text-white font-bold text-sm">الاتصال والدعم الفني</h5>
            <p className="text-xs text-stone-500 font-light">لأي استفسارات أو تفاصيل إضافية حول المقاسات والتوصيل:</p>
            <div className="flex flex-col gap-2 text-xs">
              <a href={`tel:${settings.contactPhone}`} className="flex items-center gap-2 justify-center sm:justify-start hover:text-white transition-colors" style={{ direction: "ltr" }}>
                <span>{settings.contactPhone}</span>
                <Phone className="w-3.5 h-3.5 text-brand-accent" />
              </a>
              <a href={`https://wa.me/${settings.whatsappNumber.replace(/[+\s-]/g, "")}`} target="_blank" rel="noreferrer" className="flex items-center gap-2 justify-center sm:justify-start hover:text-white transition-colors" style={{ direction: "ltr" }}>
                <span>{settings.whatsappNumber}</span>
                <MessageSquare className="w-3.5 h-3.5 text-green-500" />
              </a>
            </div>
            
            {(settings.facebookUrl || settings.instagramUrl || settings.tiktokUrl) && (
              <div className="pt-4 border-t border-stone-800/60 mt-4 flex items-center justify-center sm:justify-start gap-4">
                {settings.instagramUrl && (
                  <a href={settings.instagramUrl} target="_blank" rel="noreferrer" className="w-8 h-8 rounded-full bg-stone-800 hover:bg-brand-accent flex items-center justify-center text-stone-400 hover:text-white transition-all">
                    <Instagram className="w-4 h-4" />
                  </a>
                )}
                {settings.facebookUrl && (
                  <a href={settings.facebookUrl} target="_blank" rel="noreferrer" className="w-8 h-8 rounded-full bg-stone-800 hover:bg-brand-accent flex items-center justify-center text-stone-400 hover:text-white transition-all">
                    <Facebook className="w-4 h-4" />
                  </a>
                )}
                {settings.tiktokUrl && (
                  <a href={settings.tiktokUrl} target="_blank" rel="noreferrer" className="w-8 h-8 rounded-full bg-stone-800 hover:bg-brand-accent flex items-center justify-center text-stone-400 hover:text-white transition-all">
                    <Link className="w-4 h-4" />
                  </a>
                )}
              </div>
            )}
          </div>

        </div>

        <div className="max-w-7xl mx-auto border-t border-stone-800/60 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between text-[11px] text-stone-600 gap-4">
          <p>© 2026 متجر الميار ستار. جميع الحقوق محفوظة.</p>
          <button id="admin-access-footer" onClick={onOpenAdmin} className="hover:text-stone-400 transition-colors font-semibold">
            دخول المشرفين / الإدارة ⚙️
          </button>
        </div>
      </footer>

    </div>
  );
}
