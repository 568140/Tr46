import { collection, getDocs, doc, setDoc, writeBatch } from "firebase/firestore";
import { db } from "./firebase";
import { Product, StoreSettings, Wallet, BannerAd, SystemNotification, SystemUser } from "./types";

export const initialProducts: Product[] = [
  {
    id: "prod-1",
    name: "فستان سهرة كلاسيك مطرز بالخرز اليدوي",
    description: "فستان سهرة ناعم وأنيق بتصميم عصري من الشيفون الطبيعي مطرز يدوياً بالخرز اللامع على الصدر والأكمام، مثالي للمناسبات الخاصة والأعراس العائلية.",
    price: 120000,
    oldPrice: 150000,
    images: [
      "https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&auto=format&fit=crop&q=80"
    ],
    sizes: ["S", "M", "L", "XL"],
    colors: ["أزرق كحلي فاخر", "عاجي كلاسيك", "أسود ملكي"],
    category: "فساتين سهرة",
    inStock: true,
    isFeatured: true,
    isNew: true,
    createdAt: new Date().toISOString()
  },
  {
    id: "prod-2",
    name: "جلابية شامواه ملكية بتطريز ذهبي فاخر",
    description: "جلابية نسائية من قماش الشامواه الناعم بتطريزات قصب ذهبية فاخرة على الياقة والأكمام وجوانب الفستان. تصميم فضفاض ومريح لطلة رمضانية أو زيارات عائلية مميزة.",
    price: 85000,
    oldPrice: 110000,
    images: [
      "https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?w=800&auto=format&fit=crop&q=80"
    ],
    sizes: ["M", "L", "XL", "XXL"],
    colors: ["أخضر زمردي فاخر", "ذهبي شامبين ناعم", "كحلي ملكي"],
    category: "جلابيات واستقبال",
    inStock: true,
    isFeatured: true,
    isNew: false,
    createdAt: new Date().toISOString()
  },
  {
    id: "prod-3",
    name: "عباية مخملية سوداء مرصعة باللؤلؤ",
    description: "عباية راقية من قماش الكريب السعودي الفاخر مع لمسات من المخمل الأسود وتفاصيل لؤلؤية رقيقة موزعة بجمالية على الأطراف. تأتي مع شيلة ناعمة متناسقة.",
    price: 95000,
    images: [
      "https://images.unsplash.com/photo-1518049360754-ee095207797d?w=800&auto=format&fit=crop&q=80"
    ],
    sizes: ["52", "54", "56", "58"],
    colors: ["أسود ملكي"],
    category: "عبايات راقية",
    inStock: true,
    isFeatured: false,
    isNew: true,
    createdAt: new Date().toISOString()
  },
  {
    id: "prod-4",
    name: "فستان صيفي من الحرير الإيطالي المشجر",
    description: "فستان نسائي كاجوال طويل ومريح، مصنوع من الحرير الإيطالي الخفيف والبارد، مزين بنقوش ورود ناعمة مستوحاة من الطبيعة الصيفية الإيطالية.",
    price: 65000,
    oldPrice: 75000,
    images: [
      "https://images.unsplash.com/photo-1612336307429-8a898d10e223?w=800&auto=format&fit=crop&q=80"
    ],
    sizes: ["S", "M", "L"],
    colors: ["أزرق سماوي", "أصفر هادئ"],
    category: "ملابس كاجوال",
    inStock: true,
    isFeatured: false,
    isNew: false,
    createdAt: new Date().toISOString()
  },
  {
    id: "prod-5",
    name: "طقم كاجوال قطعتين كتان ناعم وعصري",
    description: "طقم نسائي مريح يتكون من بلوزة طويلة وبنطال بقصة واسعة من الكتان الخفيف الممتاز. تصميم بسيط وعملي يناسب العمل والمشاوير اليومية السريعة.",
    price: 55000,
    images: [
      "https://images.unsplash.com/photo-1618244972963-dbee1a7edc95?w=800&auto=format&fit=crop&q=80"
    ],
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: ["بيج كريمي", "زيتي هادئ", "تراكوتا"],
    category: "ملابس كاجوال",
    inStock: true,
    isFeatured: true,
    isNew: true,
    createdAt: new Date().toISOString()
  }
];

export const initialWallets: Wallet[] = [
  {
    id: "wall-1",
    name: "محفظة زين كاش - Zain Cash",
    numberOrAddress: "07712345678",
    holderName: "الميار ستار للملابس",
    instructions: "يرجى إرسال لقطة شاشة لإيصال التحويل عبر واتساب لتأكيد الطلب.",
    active: true
  },
  {
    id: "wall-2",
    name: "محفظة آسيا حوالة - AsiaHawala",
    numberOrAddress: "07501234567",
    holderName: "الميار ستار للتجارة",
    instructions: "التحويل متاح على مدار الساعة، يرجى كتابة اسمك في الملاحظات.",
    active: true
  },
  {
    id: "wall-3",
    name: "عنوان USDT (TRC-20)",
    numberOrAddress: "TX1234567890abcdefghijklmnopqrstub",
    holderName: "Al Mayar Wallet",
    instructions: "تأكد من اختيار شبكة TRC-20 لتجنب فقدان الأموال.",
    active: true
  }
];

export const initialBanners: BannerAd[] = [
  {
    id: "ban-1",
    title: "مجموعة فساتين السهرة الجديدة 2026",
    subtitle: "أناقة لا تضاهى لكل مناسباتكِ السعيدة - خصومات تصل إلى 20%",
    imageUrl: "https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=1600&auto=format&fit=crop&q=80",
    link: "فساتين سهرة",
    active: true
  },
  {
    id: "ban-2",
    title: "تألقي بجلابيات الاستقبال الرمضانية",
    subtitle: "تطريز يدوي على أرقى الأقمشة الخليجية بأسعار مذهلة",
    imageUrl: "https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?w=1600&auto=format&fit=crop&q=80",
    link: "جلابيات واستقبال",
    active: true
  }
];

export const initialNotifications: SystemNotification[] = [
  {
    id: "notif-1",
    title: "عروض نهاية الموسم المتميزة 🌟",
    message: "تخفيضات تصل إلى 30% على تشكيلة الملابس الكاجوال والعبايات. تسوقي الآن واستفيدي من التوصيل المجاني!",
    type: "sale",
    createdAt: new Date().toISOString(),
    active: true
  },
  {
    id: "notif-2",
    title: "تفعيل الدفع عبر زين كاش وآسيا حوالة 📱",
    message: "يمكنك الآن إتمام دفع طلباتكِ بكل أمان وسهولة عبر المحافظ الإلكترونية المتاحة في المتجر مباشرة.",
    type: "info",
    createdAt: new Date().toISOString(),
    active: true
  }
];

export const initialSettings: StoreSettings = {
  storeName: "الميار ستار",
  whatsappNumber: "+9647712345678",
  contactPhone: "07712345678",
  logoText: "الميار ستار ✨ Al Mayar Star",
  allowCashOnDelivery: true,
  announcementText: "✨ تسوقي أرقى تصاميم الأزياء النسائية الفاخرة لعام 2026 - شحن سريع لكافة محافظات العراق ✨",
  announcementActive: true
};

export const initialUsers: SystemUser[] = [
  {
    id: "user-admin",
    username: "admin",
    displayName: "المديرة العامة (أدمن)",
    passwordHash: "admin123", // For simple custom admin auth requested
    role: "admin",
    active: true
  },
  {
    id: "user-sales",
    username: "sales",
    displayName: "مسؤولة المبيعات",
    passwordHash: "sales123",
    role: "sales",
    active: true
  },
  {
    id: "user-cs",
    username: "cs",
    displayName: "موظفة خدمة العملاء",
    passwordHash: "cs123",
    role: "cs",
    active: true
  }
];

export async function seedDatabase() {
  try {
    const productsRef = collection(db, "products");
    const productsSnapshot = await getDocs(productsRef);
    
    // Check if seeded already by checking if products is empty
    if (!productsSnapshot.empty) {
      console.log("Database already seeded");
      return false;
    }

    console.log("Seeding database...");
    
    // 1. Seed Products
    for (const prod of initialProducts) {
      await setDoc(doc(db, "products", prod.id), prod);
    }

    // 2. Seed Wallets
    for (const wall of initialWallets) {
      await setDoc(doc(db, "wallets", wall.id), wall);
    }

    // 3. Seed Banners
    for (const ban of initialBanners) {
      await setDoc(doc(db, "banners", ban.id), ban);
    }

    // 4. Seed Notifications
    for (const notif of initialNotifications) {
      await setDoc(doc(db, "notifications", notif.id), notif);
    }

    // 5. Seed Settings
    await setDoc(doc(db, "settings", "main"), initialSettings);

    // 6. Seed Users
    for (const user of initialUsers) {
      await setDoc(doc(db, "users", user.id), user);
    }

    console.log("Seeding database complete!");
    return true;
  } catch (error) {
    console.error("Error seeding database: ", error);
    return false;
  }
}
