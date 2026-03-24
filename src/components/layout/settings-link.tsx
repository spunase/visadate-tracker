"use client";

import Link from "next/link";
import { Settings } from "lucide-react";
import { motion } from "framer-motion";

export function SettingsLink() {
  return (
    <motion.div whileHover={{ rotate: 15 }} whileTap={{ scale: 0.9 }}>
      <Link
        href="/settings"
        className="inline-flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-calm-blue focus-visible:ring-offset-2"
        aria-label="Settings"
      >
        <Settings className="h-[18px] w-[18px]" />
      </Link>
    </motion.div>
  );
}
