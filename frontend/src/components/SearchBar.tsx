import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

interface SearchBarProps {
  onSearch: (query: string) => void;
}

const SearchBar = ({ onSearch }: SearchBarProps) => {
  const [query, setQuery] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query);
    }
  };

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="fixed bottom-0 left-0 right-0 bg-card border-t border-border backdrop-blur-sm bg-card/95"
      style={{ height: "15vh", minHeight: "100px" }}
    >
      <div className="container mx-auto h-full flex items-center px-4 max-w-4xl">
        <form onSubmit={handleSubmit} className="w-full flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground h-5 w-5" />
            <Input
              type="text"
              placeholder='Try "show me hybrids under $30k" or "compare Corolla and Prius"'
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-12 pr-4 h-14 text-base bg-background border-border"
            />
          </div>
          <Button
            type="submit"
            size="lg"
            className="h-14 px-8 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
          >
            <Sparkles className="h-5 w-5 mr-2" />
            Search
          </Button>
        </form>
      </div>
    </motion.div>
  );
};

export default SearchBar;
