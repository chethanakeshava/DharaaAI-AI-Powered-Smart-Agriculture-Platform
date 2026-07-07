import React from "react";
import { Link } from "react-router-dom";
import { Sprout, Facebook, Twitter, Instagram, Linkedin } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks: Record<string, { label: string; path: string }[]> = {
    Product: [
      { label: "Features", path: "/#features" },
      { label: "Crop Advisor", path: "/crop-advisor" },
      { label: "Fertilizer Guide", path: "/fertilizer" },
      { label: "Crop Rotation", path: "/rotation" },
    ],
    Company: [
      { label: "About Us", path: "/about" },
      { label: "Contact", path: "/about#contact" },
      { label: "Blog", path: "#" },
      { label: "Careers", path: "#" },
    ],
    Resources: [
      { label: "Documentation", path: "#" },
      { label: "Help Center", path: "#" },
      { label: "Community", path: "#" },
      { label: "Partners", path: "#" },
    ],
    Legal: [
      { label: "Privacy Policy", path: "#" },
      { label: "Terms of Service", path: "#" },
      { label: "Cookie Policy", path: "#" },
    ],
  };

  const socialLinks = [
    { icon: Facebook, href: "#", label: "Facebook" },
    { icon: Twitter, href: "#", label: "Twitter" },
    { icon: Instagram, href: "#", label: "Instagram" },
    { icon: Linkedin, href: "#", label: "LinkedIn" },
  ];

  return (
    <footer className="bg-card border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-8 mb-8">
          {/* Brand Section */}
          <div className="col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <img
                src="/images/logo.png"
                alt="DharaaAI Logo"
                className="h-12 w-12 object-contain"
              />
              <span className="text-xl font-display font-bold text-foreground">DharaaAI</span>
            </Link>
            <p className="text-sm text-muted-foreground mb-4 max-w-xs">
              Empowering farmers with AI-driven agricultural insights for better crop management and sustainable farming.
            </p>
            <div className="flex gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className="h-9 w-9 rounded-lg bg-muted hover:bg-primary hover:text-primary-foreground flex items-center justify-center transition-all"
                >
                  <social.icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Links Sections */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className="font-semibold text-sm text-foreground mb-3">{category}</h3>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link to={link.path} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-border flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">© {currentYear} DhaaraAI. All rights reserved.</p>
          <p className="text-sm text-muted-foreground">Made with <span className="text-primary">♥</span> for farmers</p>
        </div>
      </div>
    </footer>
  );
}
