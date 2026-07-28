import React, { useEffect, useState } from "react";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db } from "../firebase";
import { SystemNotification } from "../types";
import { motion, AnimatePresence } from "motion/react";
import { Bell, Flame, Info, Check, X } from "lucide-react";
import { theme } from "../theme";

export default function NotificationToast() {
  const [notifications, setNotifications] = useState<SystemNotification[]>([]);
  const [currentNotif, setCurrentNotif] = useState<SystemNotification | null>(null);
  const [visible, setVisible] = useState(false);

  // Subscribe to active notifications
  useEffect(() => {
    const q = query(collection(db, "notifications"), where("active", "==", true));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list: SystemNotification[] = [];
      snapshot.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() } as SystemNotification);
      });
      setNotifications(list);
    });

    return () => unsubscribe();
  }, []);

  // Display notifications one by one as they load or periodically
  useEffect(() => {
    if (notifications.length > 0 && !currentNotif) {
      const randomNotif = notifications[Math.floor(Math.random() * notifications.length)];
      setCurrentNotif(randomNotif);
      setVisible(true);

      // Play a very subtle notification sound locally
      try {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        oscillator.type = "sine";
        oscillator.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5 note
        gainNode.gain.setValueAtTime(0.015, audioCtx.currentTime);
        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 0.12);
      } catch (e) {
        // Ignore AudioContext blocks
      }

      // Hide after configured duration (in seconds, default 5s)
      const durationMs = (randomNotif.duration || 5) * 1000;
      const timer = setTimeout(() => {
        setVisible(false);
      }, durationMs);

      return () => clearTimeout(timer);
    }
  }, [notifications, currentNotif]);

  // Handle manual dismissal and cycling
  useEffect(() => {
    if (!visible && currentNotif) {
      const cooldown = setTimeout(() => {
        setCurrentNotif(null);
      }, 5000);
      return () => clearTimeout(cooldown);
    }
  }, [visible, currentNotif]);

  if (!currentNotif) return null;

  const getTypeStyle = (type: string) => {
    switch (type) {
      case "sale":
        return {
          icon: <Flame className="w-4 h-4 text-brand-accent animate-pulse" />,
          badge: "bg-brand-bg-secondary text-brand-accent border border-brand-accent/20",
          badgeText: "تنويه راقي"
        };
      case "alert":
        return {
          icon: <Bell className="w-4 h-4 text-brand-primary" />,
          badge: "bg-brand-bg-secondary text-brand-primary border border-brand-primary/10",
          badgeText: "إعلان هام"
        };
      default:
        return {
          icon: <Info className="w-4 h-4 text-brand-text-secondary" />,
          badge: "bg-brand-bg-secondary text-brand-text-secondary border border-brand-border",
          badgeText: "تحديث"
        };
    }
  };

  const style = getTypeStyle(currentNotif.type);

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-sm w-full px-4 sm:px-0 pointer-events-none">
      <AnimatePresence>
        {visible && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.95 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className={`pointer-events-auto w-full rounded-2xl border ${theme.border.base} ${theme.bg.card} p-4 ${theme.shadow.medium} flex gap-3 dir-rtl text-right`}
            style={{ direction: "rtl" }}
          >
            <div className={`flex-shrink-0 mt-0.5 w-8 h-8 rounded-full ${theme.bg.secondary} flex items-center justify-center`}>
              {style.icon}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${style.badge}`}>
                  {style.badgeText}
                </span>
                <span className={`text-[10px] ${theme.text.secondary}`}>الآن</span>
              </div>
              <h4 className={`text-xs sm:text-sm font-bold ${theme.text.primary}`}>
                {currentNotif.title}
              </h4>
              <p className={`text-[11px] sm:text-xs ${theme.text.secondary} mt-1 leading-relaxed`}>
                {currentNotif.message}
              </p>
            </div>

            <button
              id="close-toast-btn"
              onClick={() => setVisible(false)}
              className={`flex-shrink-0 ${theme.text.secondary} hover:text-brand-text self-start p-1.5 transition-colors rounded-full hover:bg-brand-bg-secondary`}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

