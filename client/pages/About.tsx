import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Lightbulb,
  Zap,
  Shield,
  ArrowRight,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6 },
  },
};

function ContactForm() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // Simulate form submission
      await new Promise((resolve) => setTimeout(resolve, 1000));
      // Reset form
      setFormData({ fullName: "", email: "", phone: "", message: "" });
      // Show success message
      alert("Message sent successfully! We'll get back to you soon.");
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="fullName" className="block text-sm font-medium text-foreground mb-2">
          Full Name
        </label>
        <input
          type="text"
          id="fullName"
          name="fullName"
          value={formData.fullName}
          onChange={handleChange}
          placeholder="Your name"
          required
          className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
          Email Address
        </label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="your-email@example.com"
          required
          className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-foreground mb-2">
          Phone Number
        </label>
        <input
          type="tel"
          id="phone"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          placeholder="+91 XXXXX-XXXXX"
          className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      <div>
        <label htmlFor="message" className="block text-sm font-medium text-foreground mb-2">
          Message
        </label>
        <textarea
          id="message"
          name="message"
          value={formData.message}
          onChange={handleChange}
          placeholder="Tell us how we can help you..."
          rows={5}
          required
          className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
        />
      </div>

      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full"
        size="lg"
      >
        {isSubmitting ? "Sending..." : "Send Message"}
      </Button>
    </form>
  );
}

export default function About() {
  const benefits = [
    {
      number: "01",
      title: "Improved Productivity",
      description:
        "Increase crop yield by up to 30% with data-driven insights and recommendations tailored to your farm.",
    },
    {
      number: "02",
      title: "Reduced Costs",
      description:
        "Minimize fertilizer wastage and optimize resource allocation, reducing farming expenses significantly.",
    },
    {
      number: "03",
      title: "Sustainable Farming",
      description:
        "Promote eco-friendly practices that protect soil health and the environment for future generations.",
    },
    {
      number: "04",
      title: "Farmer Empowerment",
      description:
        "Give farmers the tools and knowledge to make independent decisions without external dependency.",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Hero Section */}
      <section className="py-20 md:py-32 px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-6xl mx-auto"
        >
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-foreground mb-6 tracking-tight">
              Empowering Farmers with
              <span className="block text-primary mt-2">AI-Driven Agriculture</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8 leading-relaxed">
              DharaaAI is an AI-powered agricultural advisory platform designed to support farmers in
              making informed and sustainable farming decisions. By combining modern machine learning
              techniques with agricultural knowledge, we empower farmers with reliable, data-driven
              insights for smarter farming.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild className="gap-2">
                <Link to="/crop-advisor">
                  Explore Features <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/register">Get Started </Link>
              </Button>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Mission Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="rounded-xl shadow-lg overflow-hidden bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center"
            style={{ minHeight: "400px" }}
          >
            <img
              src="https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=600&h=600&fit=crop"
              alt="Farmer in agricultural field using modern technology"
              className="w-full h-full object-cover"
            />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Badge className="mb-4 bg-primary/10 text-primary hover:bg-primary/20">
              Our Mission
            </Badge>
            <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-6">
              Bridging Technology and Agriculture
            </h2>
            <p className="text-lg text-muted-foreground mb-4">
              Through continuous updates and expert-driven inputs, DharaaAI strives to bridge the gap between
              modern technology and traditional agriculture, making advanced guidance accessible to farmers at all
              levels.
            </p>
            <p className="text-lg text-muted-foreground mb-8">
              Our platform combines machine learning techniques with agricultural expertise to provide intelligent,
              practical recommendations that farmers can trust and act upon immediately.
            </p>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Shield className="h-5 w-5 text-primary flex-shrink-0" />
                <span className="text-foreground">Secure and private data handling</span>
              </div>
              <div className="flex items-center gap-3">
                <Zap className="h-5 w-5 text-primary flex-shrink-0" />
                <span className="text-foreground">Real-time insights and recommendations</span>
              </div>
              <div className="flex items-center gap-3">
                <Lightbulb className="h-5 w-5 text-primary flex-shrink-0" />
                <span className="text-foreground">Expert-validated agricultural knowledge</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Key Benefits */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-card">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={containerVariants}
          className="max-w-6xl mx-auto"
        >
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
              Why Choose DharaaAI
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Proven benefits that help farmers improve productivity while reducing costs
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {benefits.map((benefit, index) => (
              <motion.div
                key={benefit.number}
                variants={itemVariants}
                className="relative pl-16"
              >
                <div className="absolute left-0 top-0 h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <span className="text-lg font-bold text-primary">{benefit.number}</span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">{benefit.title}</h3>
                  <p className="text-muted-foreground">{benefit.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Vision Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={containerVariants}
          className="max-w-4xl mx-auto text-center"
        >
          <motion.div variants={itemVariants} className="mb-8">
            <Badge className="mb-4 bg-primary/10 text-primary hover:bg-primary/20">
              Our Vision
            </Badge>
          </motion.div>
          <motion.h2
            variants={itemVariants}
            className="text-3xl md:text-4xl font-display font-bold text-foreground mb-6"
          >
            Making Advanced Agriculture Accessible to All
          </motion.h2>
          <motion.p
            variants={itemVariants}
            className="text-lg text-muted-foreground mb-8 leading-relaxed"
          >
            We believe every farmer, regardless of their location or resources, deserves access to cutting-edge
            agricultural technology and expert knowledge. DharaaAI is committed to democratizing agricultural
            intelligence and empowering farmers to become decision-makers in their own farming journey.
          </motion.p>
          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild className="gap-2">
              <Link to="/crop-advisor">
                Start Using DharaaAI <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/community">Join Our Community</Link>
            </Button>
          </motion.div>
        </motion.div>
      </section>

      {/* Contact Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-card">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-start">
            {/* Contact Information */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-6">
                Get in Touch
              </h2>
              <p className="text-lg text-muted-foreground mb-12">
                Have questions? We're here to help. Fill out the form and our team will get back to you within 24 hours.
              </p>

              <div className="space-y-8">
                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                    <Mail className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">Email</h3>
                    <p className="text-muted-foreground">support@dharaaai.com</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                    <Phone className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">Phone</h3>
                    <p className="text-muted-foreground">+91 7204583193</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                    <MapPin className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">Address</h3>
                    <p className="text-muted-foreground">
                      Srinivas Institute of Technology<br />
                      Valachil, Mangalore, Karnataka 577143
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <ContactForm />
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
