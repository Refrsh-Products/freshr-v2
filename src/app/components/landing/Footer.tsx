"use client";

import Image from "next/image";

const Footer = () => {
  return (
    <footer className="py-12 px-4 border-t border-border">
      <div className="container max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logo */}
          <a href="/" className="flex items-center gap-2">
            <Image
              src="/FRESHR-LOGO.png"
              alt="FRESHR"
              width={32}
              height={32}
              className="w-8 h-8 rounded-lg"
            />
            <span className="text-lg font-bold">FRESHR</span>
          </a>

          {/* Links */}
          <nav className="flex items-center gap-6 text-sm">
            <a
              href="#"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Privacy
            </a>
            <a
              href="#"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Terms
            </a>
            <a
              href="#"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Contact
            </a>
          </nav>

          {/* Copyright */}
          <p className="text-sm text-muted-foreground">
            © 2026 FRESHR. Made with 💚 by REFRSH
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
