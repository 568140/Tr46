import React, { useState, useEffect } from "react";
import StoreFront from "./components/StoreFront";
import AdminDashboard from "./components/AdminDashboard";
import NotificationToast from "./components/NotificationToast";
import { seedDatabase } from "./seed";
import { CartItem } from "./types";
import { Sparkles, ShoppingBag } from "lucide-react";
import { theme } from "./theme";

export default function App() {
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [seedMessage, setSeedMessage] = useState("");

  // Seed database on mount if needed
  useEffect(() => {
    async function initializeApp() {
      setIsLoading(true);
      try {
        setSeedMessage("جاري تهيئة قاعدة البيانات الفاخرة وتجهيز المعروضات الراقية...");
        const seeded = await seedDatabase();
        if (seeded) {
          setSeedMessage("تم تجهيز متجر الميار ستار بتشكيلة راقية تليق بجمالكِ! ✨");
        } else {
          setSeedMessage("");
        }
      } catch (error) {
        console.error("Initialization error: ", error);
      } finally {
        // Small delay for smooth transition
        setTimeout(() => {
          setIsLoading(false);
        }, 1500);
      }
    }

    initializeApp();
  }, []);

  // Load cart from localStorage
  useEffect(() => {
    const storedCart = localStorage.getItem("mayar_cart_items");
    if (storedCart) {
      try {
        setCart(JSON.parse(storedCart));
      } catch (e) {
        // Ignore parsing errors
      }
    }
  }, []);

  // Save cart to localStorage when changed
  useEffect(() => {
    localStorage.setItem("mayar_cart_items", JSON.stringify(cart));
  }, [cart]);

  if (isLoading) {
    return (
      <div className={`min-h-screen ${theme.bg.base} ${theme.text.primary} flex flex-col items-center justify-center p-6 space-y-6 text-center font-sans dir-rtl`} style={{ direction: "rtl" }}>
        
        {/* Animated Loading Ring/Visual */}
        <div className="relative flex items-center justify-center">
          <div className={`w-20 h-20 rounded-full border-4 border-brand-bg-secondary border-t-brand-primary animate-spin`} />
          <span className="absolute text-2xl">✨</span>
        </div>

        <div className="space-y-2 max-w-sm">
          <h2 className={`text-2xl font-serif font-black ${theme.text.primaryNavy}`}>الميار ستار Al Mayar Star</h2>
          <p className={`text-xs ${theme.text.secondary} font-light leading-relaxed`}>أرقى الأزياء النسائية والقطع الفاخرة</p>
          
          {seedMessage && (
            <p className={`text-xs ${theme.text.primaryNavy} font-semibold ${theme.bg.secondary} border ${theme.border.base} px-5 py-3 rounded-full animate-pulse mt-4`}>
              {seedMessage}
            </p>
          )}
        </div>

      </div>
    );
  }

  return (
    <>
      {/* 1. Storefront Experience */}
      <StoreFront 
        onOpenAdmin={() => setIsAdminOpen(true)} 
        cart={cart}
        setCart={setCart}
      />

      {/* 2. Admin Dashboard Suite Overlay */}
      {isAdminOpen && (
        <AdminDashboard onClose={() => setIsAdminOpen(false)} />
      )}

      {/* 3. Global Live Floating Notifications */}
      <NotificationToast />
    </>
  );
}
