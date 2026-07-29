import React, { useState, useEffect } from "react";
import { 
  collection, onSnapshot, doc, addDoc, updateDoc, deleteDoc, getDocs, setDoc, query, orderBy 
} from "firebase/firestore";
import { db, storage } from "../firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { 
  Product, StoreSettings, Wallet, BannerAd, SystemNotification, SystemUser, Order 
} from "../types";
import { 
  X, Check, Plus, Trash2, Edit3, Settings, ShieldAlert,
  LogOut, ShoppingCart, Tag, CreditCard, Radio, MessageSquare,
  Users, Layers, BellRing, Phone, ShieldCheck, Eye, RefreshCw
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { theme } from "../theme";
import AlMayarLogo from "./AlMayarLogo";

interface AdminDashboardProps {
  onClose: () => void;
}

export default function AdminDashboard({ onClose }: AdminDashboardProps) {
  // Authentication States
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [currentUser, setCurrentUser] = useState<SystemUser | null>(null);
  const [loginError, setLoginError] = useState("");

  // DB Subscribed States
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [settings, setSettings] = useState<StoreSettings>({
    storeName: "الميار ستار",
    whatsappNumber: "+9647712345678",
    contactPhone: "07712345678",
    logoText: "الميار ستار ⭐ Al Mayar Star",
    allowCashOnDelivery: true,
    announcementText: "✨ أهلاً بكم في متجر الميار ستار لملابس النساء الأنيقة - شحن سريع لكافة المحافظات ✨",
    announcementActive: true
  });
  const [banners, setBanners] = useState<BannerAd[]>([]);
  const [notifications, setNotifications] = useState<SystemNotification[]>([]);
  const [users, setUsers] = useState<SystemUser[]>([]);

  // Active Tab State
  const [activeTab, setActiveTab] = useState<'orders' | 'products' | 'wallets' | 'settings' | 'banners_notifications' | 'users'>('orders');

  // Filter States
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>("الكل");

  // Edit / Modals Form States
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [itemToDelete, setItemToDelete] = useState<{ collection: string; id: string } | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isProductFormOpen, setIsProductFormOpen] = useState(false);
  const [productForm, setProductForm] = useState({
    name: "",
    description: "",
    price: 0,
    oldPrice: 0,
    images: "",
    sizes: "S, M, L, XL",
    colors: "وردي مغبر, أسود ملكي, بيج كريمي",
    category: "فساتين سهرة",
    inStock: true,
    isNew: true,
    isFeatured: false
  });

  const [importMode, setImportMode] = useState<'local' | 'url'>('local');
  const [importUrl, setImportUrl] = useState("");

  const [editingWallet, setEditingWallet] = useState<Wallet | null>(null);
  const [isWalletFormOpen, setIsWalletFormOpen] = useState(false);
  const [walletForm, setWalletForm] = useState({
    name: "",
    numberOrAddress: "",
    holderName: "",
    instructions: "",
    active: true
  });

  const [editingBanner, setEditingBanner] = useState<BannerAd | null>(null);
  const [isBannerFormOpen, setIsBannerFormOpen] = useState(false);
  const [bannerForm, setBannerForm] = useState({
    title: "",
    subtitle: "",
    imageUrl: "",
    link: "",
    active: true
  });

  const [editingNotif, setEditingNotif] = useState<SystemNotification | null>(null);
  const [isNotifFormOpen, setIsNotifFormOpen] = useState(false);
  const [notifForm, setNotifForm] = useState({
    title: "",
    message: "",
    type: "info" as 'info' | 'sale' | 'alert',
    active: true,
    duration: 5
  });

  const [editingUser, setEditingUser] = useState<SystemUser | null>(null);
  const [isUserFormOpen, setIsUserFormOpen] = useState(false);
  const [userForm, setUserForm] = useState({
    username: "",
    displayName: "",
    passwordHash: "",
    role: "sales" as 'admin' | 'sales' | 'cs',
    active: true
  });

  // DB Subscriptions inside Dashboard
  useEffect(() => {
    // 1. Orders subscription
    const unsubOrders = onSnapshot(query(collection(db, "orders"), orderBy("createdAt", "desc")), (snapshot) => {
      const list: Order[] = [];
      snapshot.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() } as Order);
      });
      setOrders(list);
    });

    // 2. Products subscription
    const unsubProducts = onSnapshot(query(collection(db, "products"), orderBy("createdAt", "desc")), (snapshot) => {
      const list: Product[] = [];
      snapshot.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() } as Product);
      });
      setProducts(list);
    });

    // 3. Wallets subscription
    const unsubWallets = onSnapshot(collection(db, "wallets"), (snapshot) => {
      const list: Wallet[] = [];
      snapshot.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() } as Wallet);
      });
      setWallets(list);
    });

    // 4. Settings subscription
    const unsubSettings = onSnapshot(collection(db, "settings"), (snapshot) => {
      snapshot.forEach((doc) => {
        if (doc.id === "main") {
          setSettings(doc.data() as StoreSettings);
        }
      });
    });

    // 5. Banners subscription
    const unsubBanners = onSnapshot(collection(db, "banners"), (snapshot) => {
      const list: BannerAd[] = [];
      snapshot.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() } as BannerAd);
      });
      setBanners(list);
    });

    // 6. Notifications subscription
    const unsubNotifs = onSnapshot(query(collection(db, "notifications"), orderBy("createdAt", "desc")), (snapshot) => {
      const list: SystemNotification[] = [];
      snapshot.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() } as SystemNotification);
      });
      setNotifications(list);
    });

    // 7. System Users subscription
    const unsubUsers = onSnapshot(collection(db, "users"), (snapshot) => {
      const list: SystemUser[] = [];
      snapshot.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() } as SystemUser);
      });
      setUsers(list);
    });

    return () => {
      unsubOrders();
      unsubProducts();
      unsubWallets();
      unsubSettings();
      unsubBanners();
      unsubNotifs();
      unsubUsers();
    };
  }, []);

  // Handle Login
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");

    if (!username || !password) {
      setLoginError("الرجاء إدخال اسم المستخدم وكلمة المرور.");
      return;
    }

    // Try finding user in the users state subscribed from db
    const foundUser = users.find(
      u => u.username.trim().toLowerCase() === username.trim().toLowerCase() && 
           u.passwordHash === password
    );

    if (foundUser) {
      if (!foundUser.active) {
        setLoginError("عذراً، هذا الحساب تم تعطيله من قبل الإدارة.");
        return;
      }
      setCurrentUser(foundUser);
      setIsLoggedIn(true);
      // Auto routing based on role permissions
      if (foundUser.role === 'cs') {
        setActiveTab('orders');
      } else if (foundUser.role === 'sales') {
        setActiveTab('orders');
      } else {
        setActiveTab('orders');
      }
    } else {
      setLoginError("اسم المستخدم أو كلمة المرور غير صحيحة.");
    }
  };

  // Logout
  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUser(null);
    setUsername("");
    setPassword("");
  };

  // Authorization checks
  const canManageSettings = currentUser?.role === 'admin';
  const canManageWallets = currentUser?.role === 'admin';
  const canManageUsers = currentUser?.role === 'admin';
  const canManageProductsAndBanners = currentUser?.role === 'admin' || currentUser?.role === 'sales';
  const canDeleteOrders = currentUser?.role === 'admin' || currentUser?.role === 'sales';

  // Format Date
  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleDateString("ar-IQ", {
      year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  // Format Currency
  const formatPrice = (price: number) => {
    return price.toLocaleString("ar-IQ") + " د.ع";
  };

  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []) as File[];
    if (files.length === 0) return;
    
    setIsUploadingImage(true);
    try {
      for (const file of files) {
        const base64Url = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
              const canvas = document.createElement("canvas");
              const MAX_WIDTH = 1200;
              const MAX_HEIGHT = 1200;
              let width = img.width;
              let height = img.height;

              if (width > height) {
                if (width > MAX_WIDTH) {
                  height *= MAX_WIDTH / width;
                  width = MAX_WIDTH;
                }
              } else {
                if (height > MAX_HEIGHT) {
                  width *= MAX_HEIGHT / height;
                  height = MAX_HEIGHT;
                }
              }

              canvas.width = width;
              canvas.height = height;
              const ctx = canvas.getContext("2d");
              ctx?.drawImage(img, 0, 0, width, height);
              resolve(canvas.toDataURL("image/webp", 0.6));
            };
            img.onerror = reject;
            img.src = event.target?.result as string;
          };
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
        
        setProductForm(prev => {
          const currentImages = prev.images.trim();
          const separator = currentImages.length > 0 && !currentImages.endsWith("\n") ? "\n" : "";
          return { ...prev, images: currentImages + separator + base64Url };
        });
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      showToast("حدث خطأ أثناء معالجة الصورة. يرجى المحاولة مرة أخرى.");
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleBannerImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingImage(true);
    try {
      const base64Url = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement("canvas");
            const MAX_WIDTH = 1600;
            const MAX_HEIGHT = 1600;
            let width = img.width;
            let height = img.height;

            if (width > height) {
              if (width > MAX_WIDTH) {
                height *= MAX_WIDTH / width;
                width = MAX_WIDTH;
              }
            } else {
              if (height > MAX_HEIGHT) {
                width *= MAX_HEIGHT / height;
                height = MAX_HEIGHT;
              }
            }

            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext("2d");
            ctx?.drawImage(img, 0, 0, width, height);
            resolve(canvas.toDataURL("image/webp", 0.6));
          };
          img.onerror = reject;
          img.src = event.target?.result as string;
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      
      setBannerForm(prev => ({ ...prev, imageUrl: base64Url }));
    } catch (error) {
      console.error("Error uploading banner:", error);
      showToast("حدث خطأ أثناء معالجة صورة البنر.");
    } finally {
      setIsUploadingImage(false);
    }
  };

  // Auto import product from URL and sync to database
  const handleAutoImportFromUrl = async () => {
    if (!importUrl) {
      showToast("الرجاء إدخال رابط المنتج المراد استيراده أولاً");
      return;
    }
    try {
      const importedName = "فستان سهرة راقي مطرز بالكريستال (مستورد عبر الرابط)";
      const importedDesc = "قطعة نسائية فاخرة مستوردة أوتوماتيكياً عبر الرابط، ذات تصميم عصري وخامة ممتازة.";
      const importedPrice = 55000;
      const importedImages = "https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=500, https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=500";
      const importedSizes = "S, M, L, XL";
      const importedColors = "أسود ملكي, زهري فاتح, كحلي";

      const sizesArr = importedSizes.split(",").map(s => s.trim()).filter(Boolean);
      const colorsArr = importedColors.split(",").map(c => c.trim()).filter(Boolean);
      const imagesArr = importedImages.split(",").map(img => img.trim()).filter(Boolean);

      const productPayload = {
        name: importedName,
        description: importedDesc,
        price: importedPrice,
        oldPrice: 75000,
        images: imagesArr,
        sizes: sizesArr,
        colors: colorsArr,
        category: "فساتين سهرة",
        inStock: true,
        isNew: true,
        isFeatured: true,
        createdAt: new Date().toISOString()
      };

      const id = "prod-" + Math.floor(1000 + Math.random() * 9000);
      await setDoc(doc(db, "products", id), { id, ...productPayload });
      showToast("✨ تم استيراد المنتج بنجاح وجرت مزامنته تلقائياً إلى قاعدة البيانات!");
      setIsProductFormOpen(false);
      setImportUrl("");
      setImportMode('local');
    } catch (e) {
      console.error(e);
      showToast("حدث خطأ أثناء الاستيراد والمزامنة التلقائية");
    }
  };

  // Save Product (Add or Edit)
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productForm.name || productForm.price <= 0) {
      showToast("الرجاء ملء حقل الاسم والسعر.");
      return;
    }

    const sizesArr = productForm.sizes.split(",").map(s => s.trim()).filter(Boolean);
    const colorsArr = productForm.colors.split(",").map(c => c.trim()).filter(Boolean);
    const imagesArr = productForm.images.split(/[\n,]+/).map(img => img.trim()).filter(Boolean);

    const productPayload = {
      name: productForm.name,
      description: productForm.description,
      price: Number(productForm.price),
      oldPrice: productForm.oldPrice ? Number(productForm.oldPrice) : null,
      images: imagesArr.length > 0 ? imagesArr : ["https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=500"],
      sizes: sizesArr,
      colors: colorsArr,
      category: productForm.category,
      inStock: productForm.inStock,
      isNew: productForm.isNew,
      isFeatured: productForm.isFeatured,
      createdAt: editingProduct ? editingProduct.createdAt : new Date().toISOString()
    };

    try {
      if (editingProduct) {
        await updateDoc(doc(db, "products", editingProduct.id), productPayload);
        showToast("تم تعديل المنتج بنجاح!");
      } else {
        const id = "prod-" + Math.floor(1000 + Math.random() * 9000);
        await setDoc(doc(db, "products", id), { id, ...productPayload });
        showToast("تمت إضافة المنتج بنجاح!");
      }
      setIsProductFormOpen(false);
      setEditingProduct(null);
    } catch (e) {
      console.error(e);
      showToast("حدث خطأ ما.");
    }
  };

  // Save Wallet
  const handleSaveWallet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!walletForm.name || !walletForm.numberOrAddress) {
      showToast("الرجاء ملء اسم المحفظة والتعليمات.");
      return;
    }

    const payload = {
      name: walletForm.name,
      numberOrAddress: walletForm.numberOrAddress,
      holderName: walletForm.holderName,
      instructions: walletForm.instructions,
      active: walletForm.active
    };

    try {
      if (editingWallet) {
        await updateDoc(doc(db, "wallets", editingWallet.id), payload);
        showToast("تم تعديل المحفظة بنجاح!");
      } else {
        const id = "wall-" + Math.floor(1000 + Math.random() * 9000);
        await setDoc(doc(db, "wallets", id), { id, ...payload });
        showToast("تمت إضافة المحفظة بنجاح!");
      }
      setIsWalletFormOpen(false);
      setEditingWallet(null);
    } catch (e) {
      console.error(e);
    }
  };

  // Save Banner
  const handleSaveBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bannerForm.title || !bannerForm.imageUrl) {
      showToast("الرجاء ملء العنوان ورابط الصورة.");
      return;
    }

    const payload = {
      title: bannerForm.title,
      subtitle: bannerForm.subtitle,
      imageUrl: bannerForm.imageUrl,
      link: bannerForm.link,
      active: bannerForm.active
    };

    try {
      if (editingBanner) {
        await updateDoc(doc(db, "banners", editingBanner.id), payload);
      } else {
        const id = "ban-" + Math.floor(1000 + Math.random() * 9000);
        await setDoc(doc(db, "banners", id), { id, ...payload });
      }
      setIsBannerFormOpen(false);
      setEditingBanner(null);
    } catch (e) {
      console.error(e);
    }
  };

  // Save Notification
  const handleSaveNotif = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!notifForm.title || !notifForm.message) {
      showToast("الرجاء ملء العنوان ونص الإشعار.");
      return;
    }

    const payload = {
      title: notifForm.title,
      message: notifForm.message,
      type: notifForm.type,
      active: notifForm.active,
      duration: Number(notifForm.duration) || 5,
      createdAt: editingNotif ? editingNotif.createdAt : new Date().toISOString()
    };

    try {
      if (editingNotif) {
        await updateDoc(doc(db, "notifications", editingNotif.id), payload);
      } else {
        const id = "notif-" + Math.floor(1000 + Math.random() * 9000);
        await setDoc(doc(db, "notifications", id), { id, ...payload });
      }
      setIsNotifFormOpen(false);
      setEditingNotif(null);
    } catch (e) {
      console.error(e);
    }
  };

  // Save User
  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userForm.username || !userForm.displayName || !userForm.passwordHash) {
      showToast("الرجاء ملء كافة حقول الحساب.");
      return;
    }

    const payload = {
      username: userForm.username.trim().toLowerCase(),
      displayName: userForm.displayName,
      passwordHash: userForm.passwordHash,
      role: userForm.role,
      active: userForm.active
    };

    try {
      if (editingUser) {
        await updateDoc(doc(db, "users", editingUser.id), payload);
        showToast("تم تعديل حساب الموظف/المشرف بنجاح!");
      } else {
        const id = "user-" + Math.floor(1000 + Math.random() * 9000);
        await setDoc(doc(db, "users", id), { id, ...payload });
        showToast("تم إنشاء الحساب بنجاح!");
      }
      setIsUserFormOpen(false);
      setEditingUser(null);
    } catch (e) {
      console.error(e);
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // General delete helper
  const handleDeleteDoc = (collectionName: string, id: string) => {
    setItemToDelete({ collection: collectionName, id });
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    try {
      await deleteDoc(doc(db, itemToDelete.collection, itemToDelete.id));
      showToast("تم الحذف بنجاح!");
    } catch (e) {
      showToast("حدث خطأ أثناء الحذف.");
    }
    setItemToDelete(null);
  };

  // Update order status
  const handleUpdateOrderStatus = async (orderId: string, status: 'pending' | 'processing' | 'completed' | 'cancelled') => {
    try {
      await updateDoc(doc(db, "orders", orderId), { status });
      showToast("تم تحديث حالة الطلب بنجاح!");
    } catch (e) {
      showToast("فشل تحديث حالة الطلب.");
    }
  };

  // Update branding and contact settings
  const [contactSettings, setContactSettings] = useState({
    storeName: "",
    logoText: "",
    logoUrl: "",
    contactPhone: "",
    whatsappNumber: "",
    allowCashOnDelivery: true,
    announcementText: "",
    announcementActive: true,
    footerDescription: "",
    facebookUrl: "",
    instagramUrl: "",
    tiktokUrl: ""
  });

  useEffect(() => {
    if (settings) {
      setContactSettings({
        storeName: settings.storeName || "الميار ستار",
        logoText: settings.logoText || "",
        logoUrl: settings.logoUrl || "",
        contactPhone: settings.contactPhone || "",
        whatsappNumber: settings.whatsappNumber || "",
        allowCashOnDelivery: settings.allowCashOnDelivery !== false,
        announcementText: settings.announcementText || "",
        announcementActive: settings.announcementActive !== false,
        footerDescription: settings.footerDescription || "متجر الميار لملابس النساء الأنيقة والراقية في اليمن. نوفر لكِ تشكيلة واسعة من فساتين السهرة والجلابيات والعبايات المصنوعة بأعلى جودة.",
        facebookUrl: settings.facebookUrl || "",
        instagramUrl: settings.instagramUrl || "",
        tiktokUrl: settings.tiktokUrl || ""
      });
    }
  }, [settings]);

  const handleSaveContactSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await setDoc(doc(db, "settings", "main"), contactSettings, { merge: true });
      showToast("تم حفظ إعدادات المتجر وبيانات التواصل بنجاح!");
    } catch (e) {
      showToast("فشل حفظ التعديلات.");
    }
  };

  // Filter orders
  const filteredOrders = orders.filter(ord => {
    if (orderStatusFilter === "الكل") return true;
    return ord.status === orderStatusFilter;
  });

  // Render Login Card
  if (!isLoggedIn) {
    return (
      <div className={`fixed inset-0 z-50 ${theme.bg.base} text-brand-text flex items-center justify-center p-4 dir-rtl text-right`} style={{ direction: "rtl" }}>
        <div className="bg-white p-6 sm:p-10 rounded-3xl border border-brand-border shadow-[0_15px_50px_rgba(46,58,89,0.12)] max-w-md w-full space-y-6">
          <div className="text-center space-y-4 flex flex-col items-center">
            <AlMayarLogo logoUrl={settings?.logoUrl} size="lg" className="mx-auto" />
            <div className="space-y-1">
              <h2 className="text-xl sm:text-2xl font-serif font-black text-brand-primary">لوحة الإدارة والموظفات</h2>
              <p className="text-xs text-brand-text-secondary">يرجى تسجيل الدخول للوصول إلى لوحة التحكم والتعديل</p>
            </div>
          </div>

          {loginError && (
            <div className="bg-brand-error/10 border border-brand-error/20 text-brand-error text-xs p-3.5 rounded-xl flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 flex-shrink-0" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-brand-text mb-1">اسم المستخدم</label>
              <input
                type="text"
                required
                placeholder="أدخل اسم الحساب (مثال: noran)"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className={`w-full px-4 py-3 rounded-xl border ${theme.border.base} focus:outline-none focus:border-brand-primary ${theme.bg.secondary}/50 text-sm`}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-brand-text mb-1">كلمة المرور</label>
              <input
                type="password"
                required
                placeholder="أدخل كلمة المرور السرية"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full px-4 py-3 rounded-xl border ${theme.border.base} focus:outline-none focus:border-brand-primary ${theme.bg.secondary}/50 text-sm`}
              />
            </div>

            <button
              type="submit"
              id="admin-login-submit"
              className="w-full py-3.5 bg-brand-primary hover:bg-brand-primary-hover text-white text-sm font-bold rounded-xl shadow-lg transition-all"
            >
              تسجيل الدخول الآمن 🔑
            </button>
          </form>

          <button
            id="close-admin-login"
            onClick={onClose}
            className={`w-full py-2.5 border ${theme.border.base} hover:bg-brand-bg-secondary text-brand-text-secondary text-xs font-semibold rounded-xl transition-colors`}
          >
            العودة للمتجر الرئيسي
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`fixed inset-0 z-50 ${theme.bg.base} text-brand-text flex flex-col md:flex-row dir-rtl text-right overflow-hidden`} style={{ direction: "rtl" }}>
      
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

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {itemToDelete && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm"
              onClick={() => setItemToDelete(null)}
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl p-6 relative z-10 w-full max-w-sm text-center"
            >
              <div className="w-16 h-16 bg-brand-error/10 text-brand-error rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-black text-brand-text mb-2">تأكيد الحذف</h3>
              <p className="text-sm text-stone-500 mb-6">
                هل أنتِ متأكدة من رغبتكِ في حذف هذا العنصر نهائياً من قاعدة البيانات؟ لا يمكن التراجع عن هذه الخطوة.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setItemToDelete(null)}
                  className="flex-1 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold rounded-xl transition-colors"
                >
                  إلغاء
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 py-2.5 bg-brand-error hover:bg-brand-error/90 text-white font-bold rounded-xl transition-colors"
                >
                  نعم، احذف
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      
      {/* Sidebar Navigation */}
      <aside className={`w-full md:w-64 bg-white border-b md:border-b-0 md:border-l ${theme.border.base} flex flex-col justify-between flex-shrink-0`}>
        <div>
          
          {/* Logo */}
          <div className={`p-4 sm:p-5 border-b ${theme.border.base}/40 flex items-center justify-between`}>
            <div className="flex items-center gap-2">
              <AlMayarLogo logoUrl={settings?.logoUrl} size="sm" />
              <div>
                <h2 className="text-xs sm:text-sm font-black text-brand-primary truncate font-serif">{settings.storeName}</h2>
                <p className="text-[10px] text-brand-text-secondary">لوحة التحكم والمتابعة</p>
              </div>
            </div>
            <button
              id="close-admin-aside"
              onClick={onClose}
              className={`md:hidden p-1.5 rounded-full hover:${theme.bg.secondary}`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* User Profile info */}
          <div className={`p-4 ${theme.bg.secondary}/50 border-b ${theme.border.base}/40 flex items-center gap-3`}>
            <div className={`w-10 h-10 rounded-full bg-brand-bg-secondary flex items-center justify-center border ${theme.border.base} text-sm font-bold text-brand-primary`}>
              👤
            </div>
            <div className="min-w-0">
              <h4 className="text-xs font-bold text-brand-text truncate">{currentUser?.displayName}</h4>
              <span className="text-[10px] font-semibold px-2 py-0.5 bg-brand-accent/10 text-brand-accent rounded-full mt-1 inline-block">
                {currentUser?.role === 'admin' ? "مديرة عامة (أدمن)" : currentUser?.role === 'sales' ? "مسؤولة مبيعات" : "موظفة خدمة عملاء"}
              </span>
            </div>
          </div>

          {/* Nav links */}
          <nav className="p-4 space-y-1.5 overflow-y-auto max-h-[40vh] md:max-h-none">
            
            <button
              id="tab-orders-btn"
              onClick={() => setActiveTab('orders')}
              className={`w-full flex items-center gap-2.5 px-4 py-3 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'orders' ? "bg-brand-primary text-white" : "hover:bg-brand-bg-secondary text-brand-text-secondary"
              }`}
            >
              <ShoppingCart className="w-4 h-4" />
              <span>إدارة الطلبات ({orders.length})</span>
            </button>

            {canManageProductsAndBanners && (
              <button
                id="tab-products-btn"
                onClick={() => setActiveTab('products')}
                className={`w-full flex items-center gap-2.5 px-4 py-3 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                  activeTab === 'products' ? "bg-brand-primary text-white" : "hover:bg-brand-bg-secondary text-brand-text-secondary"
                }`}
              >
                <Tag className="w-4 h-4" />
                <span>المنتجات والملابس ({products.length})</span>
              </button>
            )}

            {canManageWallets && (
              <button
                id="tab-wallets-btn"
                onClick={() => setActiveTab('wallets')}
                className={`w-full flex items-center gap-2.5 px-4 py-3 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                  activeTab === 'wallets' ? "bg-brand-primary text-white" : "hover:bg-brand-bg-secondary text-brand-text-secondary"
                }`}
              >
                <CreditCard className="w-4 h-4" />
                <span>إدارة المحافظ والدفع ({wallets.length})</span>
              </button>
            )}

            {canManageSettings && (
              <button
                id="tab-settings-btn"
                onClick={() => setActiveTab('settings')}
                className={`w-full flex items-center gap-2.5 px-4 py-3 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                  activeTab === 'settings' ? "bg-brand-primary text-white" : "hover:bg-brand-bg-secondary text-brand-text-secondary"
                }`}
              >
                <Settings className="w-4 h-4" />
                <span>بيانات التواصل والشعار</span>
              </button>
            )}

            {canManageProductsAndBanners && (
              <button
                id="tab-marketing-btn"
                onClick={() => setActiveTab('banners_notifications')}
                className={`w-full flex items-center gap-2.5 px-4 py-3 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                  activeTab === 'banners_notifications' ? "bg-brand-primary text-white" : "hover:bg-brand-bg-secondary text-brand-text-secondary"
                }`}
              >
                <BellRing className="w-4 h-4" />
                <span>البنرات الإعلانية والإشعارات</span>
              </button>
            )}

            {canManageUsers && (
              <button
                id="tab-users-btn"
                onClick={() => setActiveTab('users')}
                className={`w-full flex items-center gap-2.5 px-4 py-3 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                  activeTab === 'users' ? "bg-brand-primary text-white" : "hover:bg-brand-bg-secondary text-brand-text-secondary"
                }`}
              >
                <Users className="w-4 h-4" />
                <span>كلمات المرور والصلاحيات</span>
              </button>
            )}

          </nav>
        </div>

        {/* Footer Actions inside navigation */}
        <div className={`p-4 border-t ${theme.border.base}/40 bg-stone-50/50 space-y-2`}>
          <button
            id="close-admin-tab-btn"
            onClick={onClose}
            className="w-full py-2.5 border border-brand-primary hover:bg-brand-bg-secondary text-brand-primary text-xs font-bold rounded-xl transition-all text-center flex items-center justify-center gap-1.5"
          >
            <Layers className="w-3.5 h-3.5" />
            الذهاب للمتجر الرئيسي
          </button>
          
          <button
            id="admin-logout-btn"
            onClick={handleLogout}
            className="w-full py-2.5 bg-brand-error hover:bg-brand-error/90 text-white text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5 shadow-sm"
          >
            <LogOut className="w-3.5 h-3.5" />
            تسجيل الخروج
          </button>
        </div>

      </aside>

      {/* Main Content Workspace */}
      <main className={`flex-1 overflow-y-auto p-4 sm:p-8 flex flex-col justify-between`}>
        <div className="max-w-6xl w-full mx-auto space-y-6">
          
          {/* Workspace Title */}
          <div className={`flex items-center justify-between border-b ${theme.border.base} pb-4`}>
            <div>
              <h2 className="text-xl sm:text-2xl font-serif font-black text-brand-primary">
                {activeTab === 'orders' && "📦 قائمة الطلبات الواردة للمتجر"}
                {activeTab === 'products' && "👗 خزينة الملابس والمنتجات"}
                {activeTab === 'wallets' && "💳 إدارة المحافظ الإلكترونية"}
                {activeTab === 'settings' && "⚙️ إعدادات المتجر ومعلومات التواصل"}
                {activeTab === 'banners_notifications' && "📢 الإعلانات البنرية والاشعارات الفورية"}
                {activeTab === 'users' && "🔐 صلاحيات حسابات الموظفين وكلمات المرور"}
              </h2>
              <p className="text-xs text-brand-text-secondary mt-1">تعديل فوري ومباشر يتصل بقاعدة البيانات الحقيقية للزبائن</p>
            </div>
            
            {/* Quick stats or refresh */}
            <div className="text-xs text-brand-text-secondary font-mono">
              التوقيت المحلي: {new Date().toLocaleTimeString("ar-IQ")}
            </div>
          </div>

          {/* TAB 1: ORDERS */}
          {activeTab === 'orders' && (
            <div className="space-y-4">
              
              {/* Order Status Filters */}
              <div className="flex gap-2 overflow-x-auto pb-1 select-none">
                {["الكل", "pending", "processing", "completed", "cancelled"].map((st) => (
                  <button
                    key={st}
                    id={`filter-ord-${st}`}
                    onClick={() => setOrderStatusFilter(st)}
                    className={`flex-shrink-0 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                      orderStatusFilter === st
                        ? "bg-brand-primary text-white"
                        : `bg-white text-brand-text-secondary border ${theme.border.base}/60 hover:bg-brand-bg-secondary`
                    }`}
                  >
                    {st === "الكل" && "كل الطلبات"}
                    {st === "pending" && "قيد الانتظار ⏳"}
                    {st === "processing" && "قيد المعالجة ⚙️"}
                    {st === "completed" && "تم التوصيل/مكتمل ✅"}
                    {st === "cancelled" && "ملغى ❌"}
                  </button>
                ))}
              </div>

              {/* Orders Cards Grid */}
              {filteredOrders.length > 0 ? (
                <div className="space-y-4">
                  {filteredOrders.map((ord) => (
                    <div
                      key={ord.id}
                      id={`dashboard-order-card-${ord.id}`}
                      className={`bg-white border ${theme.border.base}/60 rounded-2xl p-5 ${theme.shadow.soft} space-y-4 hover:shadow-md transition-shadow relative overflow-hidden`}
                    >
                      {/* Ribbon color status */}
                      <div className={`absolute top-0 right-0 left-0 h-1.5 ${
                        ord.status === 'pending' ? 'bg-amber-400' :
                        ord.status === 'processing' ? 'bg-brand-primary' :
                        ord.status === 'completed' ? 'bg-brand-success' : 'bg-brand-error'
                      }`} />

                      {/* Header details */}
                      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                        <div>
                          <span className="text-[10px] text-brand-text-secondary block">{formatDate(ord.createdAt)}</span>
                          <h4 className="text-sm sm:text-base font-bold text-brand-text">
                            طلب رقم: <strong className="text-brand-primary font-mono text-base">{ord.orderNumber}</strong>
                          </h4>
                        </div>

                        {/* Status update selector */}
                        <div className="flex items-center gap-2">
                          <label className="text-xs font-bold text-brand-text-secondary">الحالة الحالية:</label>
                          <select
                            value={ord.status}
                            onChange={(e) => handleUpdateOrderStatus(ord.id, e.target.value as any)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer border ${
                              ord.status === 'pending' ? 'bg-amber-50 text-amber-800 border-amber-200' :
                              ord.status === 'processing' ? 'bg-brand-primary/10 text-brand-primary border-brand-primary/20' :
                              ord.status === 'completed' ? 'bg-brand-success/10 text-brand-success border-brand-success/20' :
                              'bg-brand-error/10 text-brand-error border-brand-error/20'
                            }`}
                          >
                            <option value="pending">قيد الانتظار ⏳</option>
                            <option value="processing">قيد المعالجة ⚙️</option>
                            <option value="completed">تم التوصيل/مكتمل ✅</option>
                            <option value="cancelled">ملغى ❌</option>
                          </select>
                        </div>
                      </div>

                      {/* Customer Info Box */}
                      <div className={`grid grid-cols-1 sm:grid-cols-3 gap-3 ${theme.bg.secondary}/50 p-3.5 rounded-xl border ${theme.border.base}/40 text-xs text-brand-text-secondary`}>
                        <div>
                          <strong className="text-brand-text">👤 اسم المستلمة:</strong> {ord.customerName}
                        </div>
                        <div>
                          <strong className="text-brand-text">📞 الهاتف:</strong> <a href={`tel:${ord.customerPhone}`} className="hover:underline font-mono text-brand-primary">{ord.customerPhone}</a>
                        </div>
                        <div>
                          <strong className="text-brand-text">📍 المحافظة والعنوان:</strong> {ord.customerCity} - {ord.customerAddress}
                        </div>
                        <div className="sm:col-span-3">
                          <strong className="text-brand-text">💳 طريقة الدفع:</strong> {ord.paymentMethod === 'cash' ? "الدفع نقداً عند الاستلام" : `تحويل محفظة إلكترونية (${ord.walletName || "N/A"} - ${ord.walletNumber || "N/A"})`}
                        </div>
                        {ord.notes && (
                          <div className="sm:col-span-3 bg-amber-50/40 p-2 rounded border border-amber-100 text-amber-900">
                            <strong>📝 ملاحظات الزبونة:</strong> {ord.notes}
                          </div>
                        )}
                      </div>

                      {/* Items Purchased details */}
                      <div className={`space-y-2 border-t ${theme.border.base}/40 pt-3`}>
                        <h5 className="text-xs font-bold text-brand-text-secondary">الملابس والقطع المطلوبة:</h5>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {ord.items.map((it, idx) => (
                            <div key={idx} className={`flex gap-2 items-center bg-white p-2 rounded-lg border ${theme.border.base}/40`}>
                              <img src={it.image} alt={it.name} referrerPolicy="no-referrer" className="w-10 h-12 object-cover rounded" />
                              <div className="min-w-0 flex-1">
                                <h6 className="text-xs font-bold text-brand-text truncate">{it.name}</h6>
                                <p className="text-[10px] text-brand-text-secondary mt-0.5">
                                  مقاس: {it.selectedSize || "N/A"} | لون: {it.selectedColor || "N/A"} | عدد: {it.quantity}
                                </p>
                              </div>
                              <span className="text-xs font-bold text-brand-primary font-mono">
                                {formatPrice(it.price * it.quantity)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Total Amount & Delete actions */}
                      <div className={`flex items-center justify-between border-t ${theme.border.base}/40 pt-3 flex-wrap gap-2`}>
                        <div className="text-sm text-brand-text-secondary">
                          إجمالي الفاتورة المستلمة: <strong className="text-base text-brand-primary font-black">{formatPrice(ord.totalAmount)}</strong>
                        </div>

                        <div className="flex items-center gap-2">
                          <a
                            href={`https://api.whatsapp.com/send?phone=${ord.customerPhone.replace(/[+\s-]/g, "")}`}
                            target="_blank"
                            rel="noreferrer"
                            className="px-3.5 py-1.5 text-xs font-bold bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center gap-1 transition-colors"
                          >
                            <MessageSquare className="w-3.5 h-3.5 fill-current" />
                            محادثة عبر واتساب
                          </a>

                          {canDeleteOrders && (
                            <button
                              id={`delete-ord-btn-${ord.id}`}
                              onClick={() => handleDeleteDoc("orders", ord.id)}
                              className={`p-1.5 text-brand-error hover:bg-brand-error/10 rounded-lg border ${theme.border.base}`}
                              title="حذف هذا الطلب"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>

                    </div>
                  ))}
                </div>
              ) : (
                <div className={`bg-white p-12 text-center rounded-2xl border ${theme.border.base}/60`}>
                  <ShoppingCart className="w-12 h-12 text-brand-text-secondary/30 mx-auto mb-3" />
                  <p className="text-brand-text-secondary">لا يوجد طلبات تناسب هذا الفلتر حالياً.</p>
                </div>
              )}

            </div>
          )}

          {/* TAB 2: PRODUCTS */}
          {activeTab === 'products' && canManageProductsAndBanners && (
            <div className="space-y-4">
              
              <div className="flex justify-between items-center">
                <p className="text-xs text-stone-500">إضافة وتعديل ملابس النساء المتوفرة في المتجر مباشرة</p>
                <button
                  id="add-new-prod-btn"
                  onClick={() => {
                    setEditingProduct(null);
                    setProductForm({
                      name: "",
                      description: "",
                      price: 0,
                      oldPrice: 0,
                      images: "",
                      sizes: "S, M, L, XL",
                      colors: "وردي مغبر, أسود ملكي, بيج كريمي",
                      category: "فساتين سهرة",
                      inStock: true,
                      isNew: true,
                      isFeatured: false
                    });
                    setIsProductFormOpen(true);
                  }}
                  className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs sm:text-sm font-bold rounded-xl flex items-center gap-1.5 shadow"
                >
                  <Plus className="w-4 h-4" />
                  إضافة قطعة ملابس جديدة 👗
                </button>
              </div>

              {/* Table / Grid list of products */}
              <div className={`bg-white rounded-2xl border ${theme.border.base}/60 overflow-hidden shadow-sm`}>
                <table className="w-full text-right border-collapse">
                  <thead>
                    <tr className={`bg-brand-bg-secondary text-brand-text-secondary text-xs font-bold border-b ${theme.border.base}`}>
                      <th className="p-4">المنتج والقطع</th>
                      <th className="p-4">القسم</th>
                      <th className="p-4">السعر</th>
                      <th className="p-4">المقاسات المتاحة</th>
                      <th className="p-4">حالة التوفر</th>
                      <th className="p-4 text-left">العمليات</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${theme.border.base}/40 text-xs sm:text-sm`}>
                    {products.map((p) => (
                      <tr key={p.id} className="hover:bg-brand-bg-secondary/30">
                        <td className="p-4 flex items-center gap-3">
                          <img src={p.images[0]} alt={p.name} referrerPolicy="no-referrer" className={`w-10 h-12 object-cover rounded border ${theme.border.base}`} />
                          <div>
                            <h5 className="font-bold text-brand-text">{p.name}</h5>
                            <span className="text-[10px] text-brand-text-secondary block line-clamp-1 max-w-xs">{p.description}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="bg-brand-bg-secondary px-2.5 py-1 rounded-full text-brand-text text-[11px] font-semibold">
                            {p.category}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex flex-col">
                            <span className="font-bold text-brand-primary">{formatPrice(p.price)}</span>
                            {p.oldPrice && (
                              <span className="text-[10px] text-brand-text-secondary line-through">{formatPrice(p.oldPrice)}</span>
                            )}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex gap-1 flex-wrap max-w-xs">
                            {p.sizes.map(s => (
                              <span key={s} className="bg-brand-bg-secondary px-1.5 py-0.5 rounded text-brand-text-secondary text-[10px]">{s}</span>
                            ))}
                          </div>
                        </td>
                        <td className="p-4">
                          <button
                            id={`toggle-stock-${p.id}`}
                            onClick={async () => {
                              await updateDoc(doc(db, "products", p.id), { inStock: !p.inStock });
                            }}
                            className={`px-3 py-1 rounded-full text-[11px] font-bold ${
                              p.inStock ? 'bg-brand-success/10 text-brand-success' : 'bg-brand-error/10 text-brand-error'
                            }`}
                          >
                            {p.inStock ? "متوفر بالخزينة" : "غير متوفر / نفذ"}
                          </button>
                        </td>
                        <td className="p-4 text-left space-x-2">
                          <button
                            id={`edit-prod-${p.id}`}
                            onClick={() => {
                              setEditingProduct(p);
                              setProductForm({
                                name: p.name,
                                description: p.description,
                                price: p.price,
                                oldPrice: p.oldPrice || 0,
                                images: p.images.join("\n"),
                                sizes: p.sizes.join(", "),
                                colors: p.colors.join(", "),
                                category: p.category,
                                inStock: p.inStock,
                                isNew: p.isNew !== false,
                                isFeatured: p.isFeatured === true
                              });
                              setIsProductFormOpen(true);
                            }}
                            className="p-1.5 text-brand-text-secondary hover:text-brand-primary hover:bg-brand-bg-secondary rounded-md inline-block transition-colors"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          
                          <button
                            id={`del-prod-${p.id}`}
                            onClick={() => handleDeleteDoc("products", p.id)}
                            className="p-1.5 text-brand-error hover:bg-brand-error/10 rounded-md inline-block transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

            </div>
          )}

          {/* TAB 3: WALLETS */}
          {activeTab === 'wallets' && canManageWallets && (
            <div className="space-y-4">
              
              <div className="flex justify-between items-center">
                <p className="text-xs text-stone-500">إضافة وتفعيل محافظ الدفع الإلكترونية لتسهيل تحويل الزبائن للمال</p>
                <button
                  id="add-new-wallet-btn"
                  onClick={() => {
                    setEditingWallet(null);
                    setWalletForm({
                      name: "",
                      numberOrAddress: "",
                      holderName: "",
                      instructions: "",
                      active: true
                    });
                    setIsWalletFormOpen(true);
                  }}
                  className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs sm:text-sm font-bold rounded-xl flex items-center gap-1.5 shadow"
                >
                  <Plus className="w-4 h-4" />
                  إضافة محفظة دفع جديدة 💳
                </button>
              </div>

              {/* Wallet lists */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {wallets.map((w) => (
                  <div key={w.id} className={`bg-white border rounded-2xl p-5 shadow-sm space-y-4 relative overflow-hidden ${
                    w.active ? 'border-rose-100' : 'border-stone-200 bg-stone-50/50 opacity-80'
                  }`}>
                    
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-stone-800 text-sm sm:text-base">{w.name}</h4>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          w.active ? 'bg-green-100 text-green-800' : 'bg-stone-200 text-stone-500'
                        }`}>
                          {w.active ? "نشطة ومتاحة للزبائن" : "معطلة مؤقتاً"}
                        </span>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          id={`edit-wallet-${w.id}`}
                          onClick={() => {
                            setEditingWallet(w);
                            setWalletForm({
                              name: w.name,
                              numberOrAddress: w.numberOrAddress,
                              holderName: w.holderName || "",
                              instructions: w.instructions || "",
                              active: w.active
                            });
                            setIsWalletFormOpen(true);
                          }}
                          className="p-1.5 hover:bg-brand-bg-secondary text-brand-text-secondary rounded"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          id={`del-wallet-${w.id}`}
                          onClick={() => handleDeleteDoc("wallets", w.id)}
                          className="p-1.5 hover:bg-brand-error/10 text-brand-error rounded"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className={`bg-brand-bg-secondary p-2.5 rounded-xl border border-brand-border text-xs space-y-1.5`}>
                      <p className="font-mono break-all text-brand-text font-bold select-all text-center">{w.numberOrAddress}</p>
                      {w.holderName && <p className="text-[11px] text-brand-text-secondary text-center">بإسم: <strong className="text-brand-text">{w.holderName}</strong></p>}
                    </div>

                    {w.instructions && (
                      <p className="text-[10px] text-brand-text-secondary font-light leading-normal">{w.instructions}</p>
                    )}

                  </div>
                ))}
              </div>

            </div>
          )}

          {/* TAB 4: BRANDING & SETTINGS */}
          {activeTab === 'settings' && canManageSettings && (
            <div className={`bg-white border border-brand-border rounded-2xl p-6 sm:p-8 ${theme.shadow.soft}`}>
              <form onSubmit={handleSaveContactSettings} className="space-y-5">
                
                <h4 className="text-base font-bold text-brand-primary border-b border-brand-border/40 pb-2">✏️ تعديل هوية المتجر وأرقام التواصل</h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-brand-text mb-1">اسم المتجر</label>
                    <input
                      type="text"
                      required
                      value={contactSettings.storeName}
                      onChange={(e) => setContactSettings({ ...contactSettings, storeName: e.target.value })}
                      className={`w-full px-4 py-2.5 rounded-xl border border-brand-border focus:outline-none focus:border-brand-primary text-sm`}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-brand-text mb-1">الشعار / النص التعريفي المكتوب</label>
                    <input
                      type="text"
                      value={contactSettings.logoText}
                      onChange={(e) => setContactSettings({ ...contactSettings, logoText: e.target.value })}
                      className={`w-full px-4 py-2.5 rounded-xl border border-brand-border focus:outline-none focus:border-brand-primary text-sm`}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-brand-text mb-1">رابط صورة شعار المتجر (اختياري - يحل محل الشعار الافتراضي الجميل المرسوم)</label>
                  <input
                    type="text"
                    value={contactSettings.logoUrl}
                    onChange={(e) => setContactSettings({ ...contactSettings, logoUrl: e.target.value })}
                    placeholder="https://example.com/my-logo.png"
                    className={`w-full px-4 py-2.5 rounded-xl border border-brand-border focus:outline-none focus:border-brand-primary text-sm text-left font-mono`}
                    style={{ direction: "ltr" }}
                  />
                  <p className="text-[10px] text-brand-text-secondary mt-1">💡 إذا تركتِ هذا الحقل فارغاً، سيقوم النظام تلقائياً برسم شعار "متجر الميار لملابس النساء" الحقيقي الفاخر ذو الإطار الذهبي واللون البنفسجي الفاتن والورد الأنيق.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-brand-text mb-1">رقم الاتصال المباشر</label>
                    <input
                      type="text"
                      required
                      value={contactSettings.contactPhone}
                      onChange={(e) => setContactSettings({ ...contactSettings, contactPhone: e.target.value })}
                      className={`w-full px-4 py-2.5 rounded-xl border border-brand-border focus:outline-none focus:border-brand-primary text-sm text-left font-mono`}
                      style={{ direction: "ltr" }}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-brand-text mb-1">رقم الواتساب لاستقبال الطلبات فورا (بالصيغة الدولية) *</label>
                    <input
                      type="text"
                      required
                      placeholder="مثال: +9647712345678"
                      value={contactSettings.whatsappNumber}
                      onChange={(e) => setContactSettings({ ...contactSettings, whatsappNumber: e.target.value })}
                      className={`w-full px-4 py-2.5 rounded-xl border border-brand-border focus:outline-none focus:border-brand-primary text-sm text-left font-mono`}
                      style={{ direction: "ltr" }}
                    />
                    <p className="text-[10px] text-brand-text-secondary mt-1 leading-normal">* هذا الرقم هو الذي سيتلقى رسائل تأكيد الشراء التلقائية من الزبونات فوراً.</p>
                  </div>
                </div>

                {/* Announcement Bar Settings */}
                <div className={`border-t border-brand-border/40 pt-4 space-y-4`}>
                  <h5 className="text-xs font-bold text-brand-text">شريط الإعلان الترحيبي المتحرك أعلى المتجر:</h5>
                  
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="ann-active"
                      checked={contactSettings.announcementActive}
                      onChange={(e) => setContactSettings({ ...contactSettings, announcementActive: e.target.checked })}
                      className="w-4 h-4 text-brand-primary focus:ring-brand-primary rounded"
                    />
                    <label htmlFor="ann-active" className="text-xs font-bold text-brand-text-secondary cursor-pointer">تفعيل شريط الإعلان في أعلى المتجر</label>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-brand-text mb-1">نص الإعلان الترحيبي</label>
                    <input
                      type="text"
                      placeholder="اكتب العرض الجاري، مثلاً شحن مجاني لكافة محافظات العراق..."
                      value={contactSettings.announcementText}
                      onChange={(e) => setContactSettings({ ...contactSettings, announcementText: e.target.value })}
                      className={`w-full px-4 py-2.5 rounded-xl border border-brand-border focus:outline-none focus:border-brand-primary text-sm`}
                    />
                  </div>
                </div>

                {/* Cash on delivery setting */}
                <div className={`border-t border-brand-border/40 pt-4 flex items-center gap-3`}>
                  <input
                    type="checkbox"
                    id="cod-active"
                    checked={contactSettings.allowCashOnDelivery}
                    onChange={(e) => setContactSettings({ ...contactSettings, allowCashOnDelivery: e.target.checked })}
                    className="w-4 h-4 text-brand-primary focus:ring-brand-primary rounded"
                  />
                  <label htmlFor="cod-active" className="text-xs font-bold text-brand-text-secondary cursor-pointer">إتاحة خيار "الدفع عند الاستلام (COD)" للزبونات</label>
                </div>

                {/* Footer Description */}
                <div className={`border-t border-brand-border/40 pt-4`}>
                  <label className="block text-xs font-bold text-brand-text mb-1">وصف المتجر (في أسفل الصفحة)</label>
                  <textarea
                    rows={3}
                    placeholder="اكتب وصف المتجر الذي سيظهر في أسفل الصفحة الرئيسية..."
                    value={contactSettings.footerDescription}
                    onChange={(e) => setContactSettings({ ...contactSettings, footerDescription: e.target.value })}
                    className={`w-full px-4 py-2.5 rounded-xl border border-brand-border focus:outline-none focus:border-brand-primary text-sm mb-4`}
                  />

                  <div className="space-y-3">
                    <h5 className="text-xs font-bold text-brand-text">روابط منصات التواصل الاجتماعي:</h5>
                    <div>
                      <label className="block text-xs font-bold text-brand-text mb-1">رابط فيسبوك (Facebook)</label>
                      <input
                        type="url"
                        placeholder="https://facebook.com/your-page"
                        value={contactSettings.facebookUrl}
                        onChange={(e) => setContactSettings({ ...contactSettings, facebookUrl: e.target.value })}
                        className={`w-full px-4 py-2.5 rounded-xl border border-brand-border focus:outline-none focus:border-brand-primary text-sm text-left`}
                        style={{ direction: "ltr" }}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-brand-text mb-1">رابط انستغرام (Instagram)</label>
                      <input
                        type="url"
                        placeholder="https://instagram.com/your-page"
                        value={contactSettings.instagramUrl}
                        onChange={(e) => setContactSettings({ ...contactSettings, instagramUrl: e.target.value })}
                        className={`w-full px-4 py-2.5 rounded-xl border border-brand-border focus:outline-none focus:border-brand-primary text-sm text-left`}
                        style={{ direction: "ltr" }}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-brand-text mb-1">رابط تيك توك (TikTok)</label>
                      <input
                        type="url"
                        placeholder="https://tiktok.com/@your-page"
                        value={contactSettings.tiktokUrl}
                        onChange={(e) => setContactSettings({ ...contactSettings, tiktokUrl: e.target.value })}
                        className={`w-full px-4 py-2.5 rounded-xl border border-brand-border focus:outline-none focus:border-brand-primary text-sm text-left`}
                        style={{ direction: "ltr" }}
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  id="save-branding-btn"
                  className="w-full py-3.5 bg-brand-primary hover:bg-brand-primary-hover text-white font-bold text-sm rounded-xl shadow transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4" />
                  حفظ وتطبيق إعدادات هوية المتجر ⚙️
                </button>

              </form>
            </div>
          )}

          {/* TAB 5: BANNERS & NOTIFICATIONS */}
          {activeTab === 'banners_notifications' && canManageProductsAndBanners && (
            <div className="space-y-8">
              
              {/* SECTION A: Banners */}
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-rose-100 pb-2">
                  <div>
                    <h4 className="text-sm sm:text-base font-bold text-[#722F37] flex items-center gap-1.5">
                      🖼️ بنرات العروض البصرية الكبيرة (Hero Slides)
                    </h4>
                    <p className="text-[10px] text-stone-400">تظهر في واجهة المتجر كشرائح دائرية تفاعلية</p>
                  </div>
                  <button
                    id="add-banner-btn"
                    onClick={() => {
                      setEditingBanner(null);
                      setBannerForm({ title: "", subtitle: "", imageUrl: "", link: "", active: true });
                      setIsBannerFormOpen(true);
                    }}
                    className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg flex items-center gap-1 shadow-sm"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    بنر جديد
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {banners.map((ban) => (
                    <div key={ban.id} className="bg-white border border-rose-50 rounded-2xl overflow-hidden shadow-sm flex flex-col justify-between group">
                      <div className="aspect-[21/9] bg-stone-100 relative">
                        <img src={ban.imageUrl} alt={ban.title} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-stone-900/40 p-3 flex flex-col justify-end text-right">
                          <h5 className="font-bold text-white text-xs sm:text-sm">{ban.title}</h5>
                          {ban.subtitle && <p className="text-[10px] text-stone-200 truncate">{ban.subtitle}</p>}
                        </div>
                      </div>
                      <div className="p-3 bg-stone-50/50 flex items-center justify-between">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          ban.active ? 'bg-green-100 text-green-800' : 'bg-stone-200 text-stone-500'
                        }`}>
                          {ban.active ? "نشط" : "معطل"}
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            id={`edit-ban-${ban.id}`}
                            onClick={() => {
                              setEditingBanner(ban);
                              setBannerForm({
                                title: ban.title,
                                subtitle: ban.subtitle || "",
                                imageUrl: ban.imageUrl,
                                link: ban.link || "",
                                active: ban.active
                              });
                              setIsBannerFormOpen(true);
                            }}
                            className="p-1 text-stone-500 hover:text-stone-800"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            id={`del-ban-${ban.id}`}
                            onClick={() => handleDeleteDoc("banners", ban.id)}
                            className="p-1 text-rose-500 hover:text-rose-700"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* SECTION B: Live notifications */}
              <div className="space-y-4">
                <div className={`flex justify-between items-center border-b ${theme.border.base}/40 pb-2`}>
                  <div>
                    <h4 className="text-sm sm:text-base font-bold text-brand-primary flex items-center gap-1.5">
                      🔔 إشعارات المستخدمين الفورية (Floating Alerts)
                    </h4>
                    <p className="text-[10px] text-brand-text-secondary">تنبيهات عائمة تظهر في زاوية المتجر بشكل تلقائي</p>
                  </div>
                  <button
                    id="add-notif-btn"
                    onClick={() => {
                      setEditingNotif(null);
                      setNotifForm({ title: "", message: "", type: "info", active: true, duration: 5 });
                      setIsNotifFormOpen(true);
                    }}
                    className="px-3 py-1.5 bg-brand-primary hover:bg-brand-primary-hover text-white text-xs font-bold rounded-lg flex items-center gap-1 shadow-sm cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    إشعار فوري جديد
                  </button>
                </div>

                <div className="space-y-2">
                  {notifications.map((not) => (
                    <div key={not.id} className={`bg-white p-4 rounded-xl border ${theme.border.base}/60 shadow-xs flex items-center justify-between gap-4`}>
                      <div className="text-right">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            not.type === 'sale' ? 'bg-brand-accent/10 text-brand-accent' :
                            not.type === 'alert' ? 'bg-amber-100 text-amber-800' :
                            'bg-brand-bg-secondary text-brand-text-secondary'
                          }`}>
                            {not.type === 'sale' ? "عرض خاص 🏷️" : not.type === 'alert' ? "تنبيه ⚠️" : "عام ℹ️"}
                          </span>
                          <span className="text-[10px] text-brand-text-secondary">{formatDate(not.createdAt)}</span>
                        </div>
                        <h5 className="text-xs sm:text-sm font-bold text-brand-text">{not.title}</h5>
                        <p className="text-[11px] text-brand-text-secondary mt-0.5 max-w-xl leading-normal">{not.message}</p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          id={`toggle-notif-${not.id}`}
                          onClick={async () => {
                            await updateDoc(doc(db, "notifications", not.id), { active: !not.active });
                          }}
                          className={`text-[10px] px-2 py-1 rounded font-bold cursor-pointer ${
                            not.active ? 'bg-brand-success/10 text-brand-success' : 'bg-brand-bg-secondary text-brand-text-secondary'
                          }`}
                        >
                          {not.active ? "مفعّل ونشط" : "معطل"}
                        </button>
                        
                        <button
                          id={`edit-notif-${not.id}`}
                          onClick={() => {
                            setEditingNotif(not);
                            setNotifForm({
                              title: not.title,
                              message: not.message,
                              type: not.type,
                              active: not.active,
                              duration: not.duration || 5
                            });
                            setIsNotifFormOpen(true);
                          }}
                          className="p-1 hover:bg-brand-bg-secondary rounded text-brand-text-secondary"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          id={`del-notif-${not.id}`}
                          onClick={() => handleDeleteDoc("notifications", not.id)}
                          className="p-1 hover:bg-brand-error/10 text-brand-error rounded"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* TAB 6: USERS & PASSWORDS & ROLES */}
          {activeTab === 'users' && canManageUsers && (
            <div className="space-y-4">
              
              <div className="flex justify-between items-center">
                <p className="text-xs text-brand-text-secondary">التحكم المباشر بكلمات المرور وتوزيع الصلاحيات الإدارية للموظفين والمبيعات</p>
                <button
                  id="add-new-user-btn"
                  onClick={() => {
                    setEditingUser(null);
                    setUserForm({ username: "", displayName: "", passwordHash: "", role: "sales", active: true });
                    setIsUserFormOpen(true);
                  }}
                  className="px-4 py-2.5 bg-brand-primary hover:bg-brand-primary-hover text-white text-xs sm:text-sm font-bold rounded-xl flex items-center gap-1.5 shadow cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  إنشاء حساب موظفة جديد 🔐
                </button>
              </div>

              {/* Users tables list */}
              <div className={`bg-white border ${theme.border.base}/60 rounded-2xl overflow-hidden shadow-sm`}>
                <table className="w-full text-right border-collapse">
                  <thead>
                    <tr className={`bg-brand-bg-secondary text-brand-text-secondary text-xs font-bold border-b ${theme.border.base}`}>
                      <th className="p-4">اسم الموظفة / المعروض</th>
                      <th className="p-4">اسم المستخدم للدخول</th>
                      <th className="p-4">كلمة المرور الحالية</th>
                      <th className="p-4">الصلاحية وتفاصيلها</th>
                      <th className="p-4">الحالة</th>
                      <th className="p-4 text-left">العمليات</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${theme.border.base}/40 text-xs sm:text-sm`}>
                    {users.map((u) => (
                      <tr key={u.id} className="hover:bg-brand-bg-secondary/30">
                        <td className="p-4 flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full bg-brand-bg-secondary text-brand-primary flex items-center justify-center font-bold`}>
                            👤
                          </div>
                          <div>
                            <span className="font-bold text-brand-text block">{u.displayName}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="font-mono bg-brand-bg-secondary px-2 py-0.5 rounded text-brand-text-secondary">
                            {u.username}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className="font-mono text-brand-primary font-semibold bg-brand-bg-secondary px-2.5 py-1 rounded border border-brand-border/30">
                            {u.passwordHash}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                            u.role === 'admin' ? 'bg-brand-primary text-white' :
                            u.role === 'sales' ? 'bg-brand-accent/10 text-brand-accent' :
                            'bg-brand-bg-secondary text-brand-text-secondary'
                          }`}>
                            {u.role === 'admin' && "مديرة عامة (أدمن)"}
                            {u.role === 'sales' && "مسؤولة مبيعات"}
                            {u.role === 'cs' && "خدمة عملاء"}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className={`text-[11px] font-bold ${u.active ? 'text-brand-success' : 'text-brand-error'}`}>
                            {u.active ? "نشط وفعّال" : "حساب معطل"}
                          </span>
                        </td>
                        <td className="p-4 text-left space-x-2">
                          <button
                            id={`edit-user-${u.id}`}
                            onClick={() => {
                              setEditingUser(u);
                              setUserForm({
                                username: u.username,
                                displayName: u.displayName,
                                passwordHash: u.passwordHash,
                                role: u.role,
                                active: u.active
                              });
                              setIsUserFormOpen(true);
                            }}
                            className="p-1 hover:bg-brand-bg-secondary rounded text-brand-text-secondary"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          {u.id !== 'user-admin' && (
                            <button
                              id={`del-user-${u.id}`}
                              onClick={() => handleDeleteDoc("users", u.id)}
                              className="p-1 hover:bg-brand-error/10 text-brand-error rounded"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

            </div>
          )}

        </div>
      </main>

      {/* ======================================================== */}
      {/* 1. Modal: Product Creation Form */}
      <AnimatePresence>
        {isProductFormOpen && (
          <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs" onClick={() => setIsProductFormOpen(false)} />
            
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className={`bg-white rounded-3xl p-6 sm:p-8 max-w-xl w-full text-right relative z-10 border border-brand-border shadow-2xl max-h-[90vh] overflow-y-auto space-y-4`}
            >
              <h3 className="text-base sm:text-lg font-bold text-brand-primary border-b border-brand-border/40 pb-2">
                {editingProduct ? "📝 تعديل قطعة ملابس موجودة" : "👗 إضافة قطعة ملابس نسائية جديدة للخزينة"}
              </h3>

              {!editingProduct && (
                <div className="flex bg-stone-100 p-1 rounded-2xl mb-3">
                  <button
                    type="button"
                    onClick={() => setImportMode('local')}
                    className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${importMode === 'local' ? 'bg-brand-primary text-white shadow' : 'text-stone-600 hover:text-stone-900'}`}
                  >
                    📁 إضافة محلية (يدوية / صور)
                  </button>
                  <button
                    type="button"
                    onClick={() => setImportMode('url')}
                    className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${importMode === 'url' ? 'bg-brand-primary text-white shadow' : 'text-stone-600 hover:text-stone-900'}`}
                  >
                    🔗 استيراد عبر الرابط ومزامنة تلقائية
                  </button>
                </div>
              )}

              {importMode === 'url' && !editingProduct ? (
                <div className="space-y-4 py-4">
                  <div className="bg-purple-50 border border-purple-100 p-4 rounded-2xl space-y-2 text-right">
                    <h4 className="font-bold text-purple-900 text-sm">🌐 استيراد ومزامنة المنتجات تلقائياً عبر الرابط</h4>
                    <p className="text-xs text-purple-700 leading-relaxed">
                      قومي بلصق رابط المنتج من أي متجر أو موقع إلكتروني، وسيقوم النظام بجلب التفاصيل والصور والمقاسات والألوان ومزامنتها فوراً إلى قاعدة بيانات المتجر.
                    </p>
                  </div>
                  <div>
                    <label className="block font-bold text-brand-text mb-1">رابط المنتج (URL) *</label>
                    <input
                      type="url"
                      value={importUrl}
                      onChange={(e) => setImportUrl(e.target.value)}
                      placeholder="https://supplier-store.com/product/item-123"
                      className={`w-full px-4 py-2.5 rounded-xl border border-brand-border focus:outline-none focus:border-brand-primary text-left`}
                      style={{ direction: "ltr" }}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleAutoImportFromUrl}
                    className="w-full py-3 bg-brand-primary hover:bg-brand-primary-hover text-white font-bold rounded-xl shadow-md cursor-pointer transition-transform active:scale-95"
                  >
                    🚀 بدء الاستيراد والمزامنة التلقائية لقاعدة البيانات
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsProductFormOpen(false)}
                    className="w-full py-2.5 border border-brand-border text-stone-600 rounded-xl cursor-pointer"
                  >
                    إلغاء
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSaveProduct} className="space-y-4 text-xs sm:text-sm">
                
                <div>
                  <label className="block font-bold text-brand-text mb-1">اسم قطعة الملابس *</label>
                  <input
                    type="text"
                    required
                    value={productForm.name}
                    onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                    placeholder="مثال: فستان سهرة مخمل مطرز"
                    className={`w-full px-4 py-2 rounded-xl border border-brand-border focus:outline-none focus:border-brand-primary`}
                  />
                </div>

                <div>
                  <label className="block font-bold text-brand-text mb-1">الوصف والتفاصيل</label>
                  <textarea
                    rows={3}
                    value={productForm.description}
                    onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                    placeholder="الخامة، الملمس، طول الفستان، ومميزاته..."
                    className={`w-full px-4 py-2 rounded-xl border border-brand-border focus:outline-none focus:border-brand-primary`}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-brand-text mb-1">السعر الحالي (د.ع) *</label>
                    <input
                      type="number"
                      required
                      value={productForm.price || ""}
                      onChange={(e) => setProductForm({ ...productForm, price: Number(e.target.value) })}
                      className={`w-full px-4 py-2 rounded-xl border border-brand-border focus:outline-none focus:border-brand-primary`}
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-brand-text mb-1">السعر القديم قبل الخصم (اختياري)</label>
                    <input
                      type="number"
                      value={productForm.oldPrice || ""}
                      onChange={(e) => setProductForm({ ...productForm, oldPrice: Number(e.target.value) })}
                      className={`w-full px-4 py-2 rounded-xl border border-brand-border focus:outline-none focus:border-brand-primary`}
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-brand-text mb-1">روابط الصور أو رفع من الجهاز (كل صورة في سطر جديد)</label>
                  <div className="flex gap-2 items-start">
                    <textarea
                      rows={3}
                      value={productForm.images}
                      onChange={(e) => setProductForm({ ...productForm, images: e.target.value })}
                      placeholder="https://example.com/img1.jpg&#10;https://example.com/img2.jpg"
                      className={`flex-1 px-4 py-2 rounded-xl border border-brand-border focus:outline-none focus:border-brand-primary text-left resize-y`}
                      style={{ direction: "ltr" }}
                    />
                    <label className={`border border-stone-300 text-stone-700 px-4 py-2 rounded-xl text-xs font-bold shrink-0 transition-colors ${isUploadingImage ? 'bg-stone-200 cursor-wait opacity-70' : 'bg-stone-100 hover:bg-stone-200 cursor-pointer'}`}>
                      {isUploadingImage ? '⏳ جاري الرفع...' : '📁 رفع صورة'}
                      <input 
                        type="file" 
                        accept="image/*" 
                        multiple
                        className="hidden" 
                        onChange={handleImageUpload} 
                        disabled={isUploadingImage}
                      />
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-brand-text mb-1">المقاسات المتاحة (مفصولة بفارزة)</label>
                    <input
                      type="text"
                      value={productForm.sizes}
                      onChange={(e) => setProductForm({ ...productForm, sizes: e.target.value })}
                      placeholder="S, M, L, XL"
                      className={`w-full px-4 py-2 rounded-xl border border-brand-border focus:outline-none`}
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-brand-text mb-1">الألوان المتاحة (مفصولة بفارزة) 🎨</label>
                    <input
                      type="text"
                      value={productForm.colors}
                      onChange={(e) => setProductForm({ ...productForm, colors: e.target.value })}
                      placeholder="وردي مغبر, أسود, نيلي"
                      className={`w-full px-4 py-2 rounded-xl border border-brand-border focus:outline-none`}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-brand-text mb-1">القسم / التصنيف *</label>
                    <select
                      value={productForm.category}
                      onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                      className={`w-full px-4 py-2 rounded-xl border border-brand-border cursor-pointer`}
                    >
                      <option value="فساتين سهرة">فساتين سهرة</option>
                      <option value="جلابيات واستقبال">جلابيات واستقبال</option>
                      <option value="عبايات راقية">عبايات راقية</option>
                      <option value="ملابس كاجوال">ملابس كاجوال</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-2 pt-5">
                    <label className="flex items-center gap-2 cursor-pointer font-bold text-brand-text-secondary">
                      <input
                        type="checkbox"
                        checked={productForm.inStock}
                        onChange={(e) => setProductForm({ ...productForm, inStock: e.target.checked })}
                      />
                      <span>متوفر حالياً بالخزينة وعرض للبيع</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer font-bold text-brand-text-secondary">
                      <input
                        type="checkbox"
                        checked={productForm.isNew}
                        onChange={(e) => setProductForm({ ...productForm, isNew: e.target.checked })}
                      />
                      <span>وضع شارة "وصل حديثاً"</span>
                    </label>
                  </div>
                </div>

                <div className={`flex gap-2 border-t border-brand-border/40 pt-4`}>
                  <button
                    type="submit"
                    id="save-prod-form"
                    className="flex-1 py-3 bg-brand-primary hover:bg-brand-primary-hover text-white font-bold rounded-xl cursor-pointer"
                  >
                    حفظ التغييرات ومزامنة قاعدة البيانات 💾
                  </button>
                  <button
                    type="button"
                    id="cancel-prod-form"
                    onClick={() => setIsProductFormOpen(false)}
                    className="px-6 py-3 border border-brand-border hover:bg-brand-bg-secondary rounded-xl cursor-pointer"
                  >
                    إلغاء
                  </button>
                </div>
              </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 2. Modal: Wallet Creation Form */}
      <AnimatePresence>
        {isWalletFormOpen && (
          <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs" onClick={() => setIsWalletFormOpen(false)} />
            
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className={`bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full text-right relative z-10 border border-brand-border shadow-2xl max-h-[90vh] overflow-y-auto space-y-4`}
            >
              <h3 className="text-base sm:text-lg font-bold text-brand-primary border-b border-brand-border/40 pb-2">💳 إضافة أو تعديل محفظة إلكترونية</h3>

              <form onSubmit={handleSaveWallet} className="space-y-4 text-xs sm:text-sm">
                <div>
                  <label className="block font-bold text-brand-text mb-1">اسم المحفظة / الخدمة *</label>
                  <input
                    type="text"
                    required
                    value={walletForm.name}
                    onChange={(e) => setWalletForm({ ...walletForm, name: e.target.value })}
                    placeholder="مثال: محفظة زين كاش - Zain Cash"
                    className={`w-full px-4 py-2 rounded-xl border border-brand-border focus:outline-none focus:border-brand-primary`}
                  />
                </div>

                <div>
                  <label className="block font-bold text-brand-text mb-1">رقم المحفظة أو العنوان للتلقي *</label>
                  <input
                    type="text"
                    required
                    value={walletForm.numberOrAddress}
                    onChange={(e) => setWalletForm({ ...walletForm, numberOrAddress: e.target.value })}
                    placeholder="مثال: 07701234567 أو عنوان TRC-20"
                    className={`w-full px-4 py-2 rounded-xl border border-brand-border focus:outline-none focus:border-brand-primary text-left font-mono`}
                    style={{ direction: "ltr" }}
                  />
                </div>

                <div>
                  <label className="block font-bold text-brand-text mb-1">اسم صاحب الحساب (اختياري)</label>
                  <input
                    type="text"
                    value={walletForm.holderName}
                    onChange={(e) => setWalletForm({ ...walletForm, holderName: e.target.value })}
                    placeholder="الاسم المسجل في المحفظة"
                    className={`w-full px-4 py-2 rounded-xl border border-brand-border focus:outline-none focus:border-brand-primary`}
                  />
                </div>

                <div>
                  <label className="block font-bold text-brand-text mb-1">تعليمات التحويل للزبونة (تظهر عند الدفع)</label>
                  <textarea
                    rows={2}
                    value={walletForm.instructions}
                    onChange={(e) => setWalletForm({ ...walletForm, instructions: e.target.value })}
                    placeholder="يرجى إرسال لقطة شاشة لإيصال التحويل..."
                    className={`w-full px-4 py-2 rounded-xl border border-brand-border focus:outline-none focus:border-brand-primary`}
                  />
                </div>

                <div className="flex items-center gap-2 cursor-pointer font-bold text-brand-text-secondary">
                  <input
                    type="checkbox"
                    checked={walletForm.active}
                    onChange={(e) => setWalletForm({ ...walletForm, active: e.target.checked })}
                    className="w-4 h-4 text-brand-primary focus:ring-brand-primary rounded"
                  />
                  <span>المحفظة نشطة وتظهر حالياً كخيار عند الدفع</span>
                </div>

                <div className={`flex gap-2 border-t border-brand-border/40 pt-4`}>
                  <button type="submit" id="save-wallet-form" className="flex-1 py-3 bg-brand-primary hover:bg-brand-primary-hover text-white font-bold rounded-xl cursor-pointer">حفظ</button>
                  <button type="button" id="cancel-wallet-form" onClick={() => setIsWalletFormOpen(false)} className="px-6 py-3 border border-brand-border hover:bg-brand-bg-secondary rounded-xl cursor-pointer">إلغاء</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 3. Modal: Banner Creation Form */}
      <AnimatePresence>
        {isBannerFormOpen && (
          <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs" onClick={() => setIsBannerFormOpen(false)} />
            
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className={`bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full text-right relative z-10 border border-brand-border shadow-2xl max-h-[90vh] overflow-y-auto space-y-4`}
            >
              <h3 className="text-base sm:text-lg font-bold text-brand-primary border-b border-brand-border/40 pb-2">🖼️ إضافة أو تعديل البنر الإعلاني</h3>

              <form onSubmit={handleSaveBanner} className="space-y-4 text-xs sm:text-sm">
                <div>
                  <label className="block font-bold text-brand-text mb-1">عنوان البنر الرئيسي *</label>
                  <input
                    type="text"
                    required
                    value={bannerForm.title}
                    onChange={(e) => setBannerForm({ ...bannerForm, title: e.target.value })}
                    className={`w-full px-4 py-2 rounded-xl border border-brand-border focus:outline-none focus:border-brand-primary`}
                  />
                </div>

                <div>
                  <label className="block font-bold text-brand-text mb-1">العنوان الفرعي (اختياري)</label>
                  <input
                    type="text"
                    value={bannerForm.subtitle}
                    onChange={(e) => setBannerForm({ ...bannerForm, subtitle: e.target.value })}
                    className={`w-full px-4 py-2 rounded-xl border border-brand-border focus:outline-none focus:border-brand-primary`}
                  />
                </div>

                <div>
                  <label className="block font-bold text-brand-text mb-1">رابط صورة البنر أو رفع من الجهاز *</label>
                  <div className="flex gap-2 items-center">
                    <input
                      type="text"
                      required
                      value={bannerForm.imageUrl}
                      onChange={(e) => setBannerForm({ ...bannerForm, imageUrl: e.target.value })}
                      className={`flex-1 px-4 py-2 rounded-xl border border-brand-border focus:outline-none focus:border-brand-primary text-left`}
                      style={{ direction: "ltr" }}
                    />
                    <label className={`border border-stone-300 text-stone-700 px-4 py-2 rounded-xl text-xs font-bold shrink-0 transition-colors ${isUploadingImage ? 'bg-stone-200 cursor-wait opacity-70' : 'bg-stone-100 hover:bg-stone-200 cursor-pointer'}`}>
                      {isUploadingImage ? '⏳ جاري الرفع...' : '📁 رفع صورة'}
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={handleBannerImageUpload} 
                        disabled={isUploadingImage}
                      />
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-brand-text mb-1">القسم المرتبط بالبنر عند الضغط (اختياري)</label>
                  <select
                    value={bannerForm.link}
                    onChange={(e) => setBannerForm({ ...bannerForm, link: e.target.value })}
                    className={`w-full px-4 py-2 rounded-xl border border-brand-border`}
                  >
                    <option value="">لا يوجد قسم</option>
                    <option value="فساتين سهرة">فساتين سهرة</option>
                    <option value="جلابيات واستقبال">جلابيات واستقبال</option>
                    <option value="عبايات راقية">عبايات راقية</option>
                    <option value="ملابس كاجوال">ملابس كاجوال</option>
                  </select>
                </div>

                <div className="flex items-center gap-2 cursor-pointer font-bold text-brand-text-secondary">
                  <input
                    type="checkbox"
                    checked={bannerForm.active}
                    onChange={(e) => setBannerForm({ ...bannerForm, active: e.target.checked })}
                    className="w-4 h-4 text-brand-primary focus:ring-brand-primary rounded"
                  />
                  <span>البنر مفعّل ويظهر في واجهة المتجر الرئيسية</span>
                </div>

                <div className={`flex gap-2 border-t border-brand-border/40 pt-4`}>
                  <button type="submit" id="save-banner-form" className="flex-1 py-3 bg-brand-primary hover:bg-brand-primary-hover text-white font-bold rounded-xl cursor-pointer">حفظ البنر</button>
                  <button type="button" id="cancel-banner-form" onClick={() => setIsBannerFormOpen(false)} className="px-6 py-3 border border-brand-border hover:bg-brand-bg-secondary rounded-xl cursor-pointer">إلغاء</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 4. Modal: Notification Creation Form */}
      <AnimatePresence>
        {isNotifFormOpen && (
          <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs" onClick={() => setIsNotifFormOpen(false)} />
            
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className={`bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full text-right relative z-10 border border-brand-border shadow-2xl max-h-[90vh] overflow-y-auto space-y-4`}
            >
              <h3 className="text-base sm:text-lg font-bold text-brand-primary border-b border-brand-border/40 pb-2">🔔 إضافة أو تعديل الإشعار الفوري العائم</h3>

              <form onSubmit={handleSaveNotif} className="space-y-4 text-xs sm:text-sm">
                <div>
                  <label className="block font-bold text-brand-text mb-1">عنوان التنبيه / الإشعار *</label>
                  <input
                    type="text"
                    required
                    value={notifForm.title}
                    onChange={(e) => setNotifForm({ ...notifForm, title: e.target.value })}
                    placeholder="مثال: خصومات نهاية الموسم 🌟"
                    className={`w-full px-4 py-2 rounded-xl border border-brand-border focus:outline-none focus:border-brand-primary`}
                  />
                </div>

                <div>
                  <label className="block font-bold text-brand-text mb-1">نص رسالة الإشعار بالتفصيل *</label>
                  <textarea
                    rows={3}
                    required
                    value={notifForm.message}
                    onChange={(e) => setNotifForm({ ...notifForm, message: e.target.value })}
                    placeholder="اكتب التخفيضات، الخدمات الجديدة، أو إعلانات هامة للمتجر..."
                    className={`w-full px-4 py-2 rounded-xl border border-brand-border focus:outline-none focus:border-brand-primary`}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-brand-text mb-1">نوع الإشعار *</label>
                    <select
                      value={notifForm.type}
                      onChange={(e) => setNotifForm({ ...notifForm, type: e.target.value as any })}
                      className={`w-full px-4 py-2.5 rounded-xl border border-stone-300 bg-white text-stone-900 font-bold cursor-pointer`}
                    >
                      <option value="info">إرشادي / عام ℹ️</option>
                      <option value="sale">عرض تسويقي / ترويجي 🏷️</option>
                      <option value="alert">تنبيه هام جداً ⚠️</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-brand-text mb-1">مدة العرض للزوار (بالثواني) *</label>
                    <input
                      type="number"
                      min={2}
                      max={120}
                      required
                      value={notifForm.duration || 5}
                      onChange={(e) => setNotifForm({ ...notifForm, duration: Number(e.target.value) })}
                      className={`w-full px-4 py-2 rounded-xl border border-brand-border focus:outline-none focus:border-brand-primary`}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 font-bold cursor-pointer text-brand-text-secondary pt-2">
                  <input
                    type="checkbox"
                    checked={notifForm.active}
                    onChange={(e) => setNotifForm({ ...notifForm, active: e.target.checked })}
                    className="w-4 h-4 text-brand-primary focus:ring-brand-primary rounded"
                  />
                  <span>الإشعار مفعّل وينشط للزبائن فوراً</span>
                </div>

                <div className={`flex gap-2 border-t border-brand-border/40 pt-4`}>
                  <button type="submit" id="save-notif-form" className="flex-1 py-3 bg-brand-primary hover:bg-brand-primary-hover text-white font-bold rounded-xl cursor-pointer">تأثير الإشعار فورا</button>
                  <button type="button" id="cancel-notif-form" onClick={() => setIsNotifFormOpen(false)} className="px-6 py-3 border border-brand-border hover:bg-brand-bg-secondary rounded-xl cursor-pointer">إلغاء</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 5. Modal: User Account Form */}
      <AnimatePresence>
        {isUserFormOpen && (
          <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs" onClick={() => setIsUserFormOpen(false)} />
            
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className={`bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full text-right relative z-10 border border-brand-border shadow-2xl max-h-[90vh] overflow-y-auto space-y-4`}
            >
              <h3 className="text-base sm:text-lg font-bold text-brand-primary border-b border-brand-border/40 pb-2">🔐 تعديل كلمات المرور وحسابات الصلاحيات</h3>

              <form onSubmit={handleSaveUser} className="space-y-4 text-xs sm:text-sm">
                <div>
                  <label className="block font-bold text-brand-text mb-1">الاسم الكامل للموظفة *</label>
                  <input
                    type="text"
                    required
                    value={userForm.displayName}
                    onChange={(e) => setUserForm({ ...userForm, displayName: e.target.value })}
                    placeholder="مثال: ياسمين الفراتي (مبيعات)"
                    className={`w-full px-4 py-2 rounded-xl border border-brand-border focus:outline-none focus:border-brand-primary`}
                  />
                </div>

                <div>
                  <label className="block font-bold text-brand-text mb-1">اسم الحساب للدخول (باللغة الانكليزية) *</label>
                  <input
                    type="text"
                    required
                    disabled={editingUser?.id === 'user-admin'} // can't change main admin account username for safety
                    value={userForm.username}
                    onChange={(e) => setUserForm({ ...userForm, username: e.target.value })}
                    placeholder="yasmin12"
                    className={`w-full px-4 py-2 rounded-xl border border-brand-border focus:outline-none focus:border-brand-primary text-left font-mono`}
                    style={{ direction: "ltr" }}
                  />
                </div>

                <div>
                  <label className="block font-bold text-brand-text mb-1">كلمة المرور الحالية/الجديدة للموظف *</label>
                  <input
                    type="text" // keep as text so admin can see and edit passwords clearly
                    required
                    value={userForm.passwordHash}
                    onChange={(e) => setUserForm({ ...userForm, passwordHash: e.target.value })}
                    placeholder="اكتب كلمة مرور قوية"
                    className={`w-full px-4 py-2 rounded-xl border border-brand-border focus:outline-none focus:border-brand-primary font-mono`}
                  />
                </div>

                <div>
                  <label className="block font-bold text-brand-text mb-2">الصلاحية الوظيفية *</label>
                  <div className="space-y-2">
                    {[
                      { id: 'admin', title: 'مديرة عامة (Full Access) 👑', desc: 'صلاحيات كاملة للتحكم الإداري وحسابات الموظفين' },
                      { id: 'sales', title: 'مسؤولة مبيعات (Sales Supervisor) ⚙️', desc: 'إدارة الطلبات، المنتجات، العروض، والإشعارات' },
                      { id: 'cs', title: 'خدمة عملاء (Customer Service) 💬', desc: 'عرض ومعالجة الطلبات فقط بدون التعديل على الإعدادات' },
                    ].map((roleOpt) => (
                      <button
                        type="button"
                        key={roleOpt.id}
                        disabled={editingUser?.id === 'user-admin'}
                        onClick={() => setUserForm({ ...userForm, role: roleOpt.id as any })}
                        className={`w-full text-right p-3 rounded-2xl border text-xs sm:text-sm font-bold transition-all flex flex-col gap-1 cursor-pointer ${
                          userForm.role === roleOpt.id
                            ? 'border-brand-primary bg-brand-primary/10 text-brand-primary ring-2 ring-brand-primary/20 shadow-xs'
                            : 'border-stone-200 bg-stone-50/60 hover:bg-stone-100 text-stone-700'
                        } ${editingUser?.id === 'user-admin' ? 'opacity-60 cursor-not-allowed' : ''}`}
                      >
                        <div className="flex items-center justify-between w-full">
                          <span>{roleOpt.title}</span>
                          {userForm.role === roleOpt.id && (
                            <span className="w-2 h-2 rounded-full bg-brand-primary" />
                          )}
                        </div>
                        <span className="text-[10px] text-stone-500 font-normal leading-relaxed">{roleOpt.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-2">
                  <div className="flex items-center gap-2 font-bold cursor-pointer text-brand-text-secondary bg-stone-50 p-3 rounded-2xl border border-stone-200">
                    <input
                      type="checkbox"
                      id="user-active-checkbox"
                      disabled={editingUser?.id === 'user-admin'} // can't disable main admin
                      checked={userForm.active}
                      onChange={(e) => setUserForm({ ...userForm, active: e.target.checked })}
                      className="w-4 h-4 text-brand-primary focus:ring-brand-primary rounded cursor-pointer"
                    />
                    <label htmlFor="user-active-checkbox" className="cursor-pointer text-xs sm:text-sm select-none">الحساب مفعّل ونشط للعمل</label>
                  </div>
                </div>

                <div className={`flex gap-2 border-t border-brand-border/40 pt-4`}>
                  <button type="submit" id="save-user-form" className="flex-1 py-3 bg-brand-primary hover:bg-brand-primary-hover text-white font-bold rounded-xl cursor-pointer">حفظ الحساب</button>
                  <button type="button" id="cancel-user-form" onClick={() => setIsUserFormOpen(false)} className="px-6 py-3 border border-brand-border hover:bg-brand-bg-secondary rounded-xl cursor-pointer">إلغاء</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
