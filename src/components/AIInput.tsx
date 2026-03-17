"use client";

import { INITIAL_RESPONSES } from "@/data/responses";
import { useChatStore } from "@/store/useChatStore";
import { useChatMutation } from '@/hooks/useChatMutation';
import { motion } from "framer-motion";

import {
  ArrowRight,
  Briefcase,
  Layers,
  PartyPopper,
  Search,
  Smile,
  UserSearch
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useMemo } from "react";

interface QuickActionProps {
  icon: React.ReactNode;
  label: string;
  color: string;
  delay: number;
  onClick: () => void;
}

const colorMap: Record<string, { bg: string; text: string }> = {
  emerald: { bg: "bg-emerald-400/10", text: "text-emerald-400" },
  green: { bg: "bg-green-400/10", text: "text-green-400" },
  violet: { bg: "bg-violet-400/10", text: "text-violet-400" },
  pink: { bg: "bg-pink-400/10", text: "text-pink-400" },
  amber: { bg: "bg-amber-400/10", text: "text-amber-400" },
};

function QuickAction({ icon, label, color, delay, onClick }: QuickActionProps) {
  const styles = colorMap[color] || colorMap.emerald;

  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      onClick={onClick}
      className="flex flex-col items-center justify-center p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 hover:bg-white/10 transition-all group w-20 md:w-28 aspect-square cursor-pointer"
    >
      <div className={`mb-3 p-2 rounded-xl ${styles.bg} ${styles.text} group-hover:scale-110 transition-transform`}>
        {icon}
      </div>
      <span className="text-sm font-medium text-white/70 group-hover:text-white transition-colors">
        {label}
      </span>
    </motion.button>
  );
}

export function AIInput() {
  const router = useRouter();
  const { addMessage, setInitialQuery } = useChatStore();

  const [placeholder, setPlaceholder] = useState("");

  
  const phrases = useMemo(() => Object.values(INITIAL_RESPONSES).map(r => r.phrase), []);
  
  const [phraseIndex, setPhraseIndex] = useState(0);

  useEffect(() => {
    let currentText = "";
    let isDeleting = false;
    let timeoutId: NodeJS.Timeout;

    const type = () => {
      const currentPhrase = phrases[phraseIndex];
      
      if (isDeleting) {
        currentText = currentPhrase.substring(0, currentText.length - 1);
      } else {
        currentText = currentPhrase.substring(0, currentText.length + 1);
      }

      setPlaceholder(currentText);

      let typeSpeed = isDeleting ? 50 : 100;

      if (!isDeleting && currentText === currentPhrase) {
        typeSpeed = 2000;
        isDeleting = true;
      } else if (isDeleting && currentText === "") {
        isDeleting = false;
        setPhraseIndex((prev: number) => (prev + 1) % phrases.length);
        typeSpeed = 500;
      }

      timeoutId = setTimeout(type, typeSpeed);
    };

    timeoutId = setTimeout(type, 1000);
    return () => clearTimeout(timeoutId);
  }, [phraseIndex, phrases]);

  const mutation = useChatMutation();

  const handleAction = (query: string) => {
    const entry = INITIAL_RESPONSES[query];
    const phrase = entry ? entry.phrase : query;
    
    addMessage({ role: 'user', text: phrase });
    setInitialQuery(phrase);
    mutation.mutate(phrase); // Trigger simulation immediately
    router.push('/chat');
  };


  const [inputText, setInputText] = useState('');

  const actions = [
    { icon: <Smile size={20} />, label: "Me", color: "emerald", delay: 1.4 },
    { icon: <Briefcase size={20} />, label: "Projects", color: "green", delay: 1.5 },
    { icon: <Layers size={20} />, label: "Skills", color: "violet", delay: 1.6 },
    { icon: <PartyPopper size={20} />, label: "Fun", color: "pink", delay: 1.7 },
    { icon: <UserSearch size={20} />, label: "Contact", color: "amber", delay: 1.8 },
  ];

  return (
    <div className="w-full max-w-2xl mt-12">
      {/* Search Bar */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1.2, duration: 0.5 }}
        className="relative group mb-10"
      >
        <div className="absolute -inset-1 bg-linear-to-r from-accent/50 to-violet-500/50 blur rounded-full opacity-25 group-focus-within:opacity-50 transition duration-1000 group-focus-within:duration-200" />
        <div className="relative flex items-center bg-background/80 border border-border rounded-full px-6 py-4 backdrop-blur-xl focus-within:border-accent/50 transition-all">
          <Search size={20} className="text-accent/70 mr-4" />
          <input
            type="text"
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAction(inputText || 'Hi')}
            placeholder={placeholder}
            className="flex-1 bg-transparent border-none outline-none focus:ring-0 text-foreground placeholder:text-muted-foreground text-lg selection:bg-accent/30"
          />
          <button
            onClick={() => handleAction(inputText || 'Hi')}
            className="ml-4 p-2.5 rounded-full bg-accent text-white hover:bg-accent/80 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-accent/20 cursor-pointer"
          >
            <ArrowRight size={20} />
          </button>
        </div>
      </motion.div>

      {/* Quick Actions */}
      <div className="flex flex-wrap justify-center gap-3 md:gap-4 max-w-[340px] md:max-w-none mx-auto">
        {actions.map((action, index) => (
          <QuickAction
            key={index}
            icon={action.icon}
            label={action.label}
            color={action.color}
            delay={action.delay}
            onClick={() => handleAction(action.label)}
          />
        ))}
      </div>
    </div>
  );
}

