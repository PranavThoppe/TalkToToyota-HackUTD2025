import { motion } from "framer-motion";

interface CategoryTabsProps {
  categories: string[];
  activeCategory: string;
  onCategoryChange: (category: string) => void;
}

const CategoryTabs = ({
  categories,
  activeCategory,
  onCategoryChange,
}: CategoryTabsProps) => {
  return (
    <div className="border-b border-border sticky top-0 bg-background z-50">
      <div className="container mx-auto px-4">
        <div className="flex gap-8 overflow-x-auto">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => onCategoryChange(category)}
              className="relative py-4 text-sm font-medium whitespace-nowrap transition-colors"
            >
              <span
                className={
                  activeCategory === category
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }
              >
                {category}
              </span>
              {activeCategory === category && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CategoryTabs;
