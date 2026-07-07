import { Link } from "react-router-dom";
import { TrendingUp, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export default function ProfitAnalysis() {
  return (
    <section className="min-h-screen flex items-center justify-center bg-background px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl w-full text-center"
      >
        <div className="flex justify-center mb-6">
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="h-16 w-16 rounded-full bg-gradient-primary flex items-center justify-center"
          >
            <TrendingUp className="h-8 w-8 text-primary-foreground" />
          </motion.div>
        </div>

        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-4xl md:text-5xl font-display font-bold text-foreground mb-4"
        >
          Profit Analysis
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-lg text-muted-foreground mb-8 leading-relaxed"
        >
          This feature will be available soon! We're working on bringing you powerful tools to track expenses, predict yields, and analyze profitability to make data-driven farming decisions.
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-base text-muted-foreground mb-12"
        >
          Stay tuned for more updates. In the meantime, explore our other powerful features to enhance your farming experience.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Button asChild size="lg">
            <Link to="/" className="inline-flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Link>
          </Button>
        </motion.div>
      </motion.div>
    </section>
  );
}
