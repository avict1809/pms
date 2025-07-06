"use client";
import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  FolderOpen,
  ClipboardList,
  FileText,
  Megaphone,
  Users,
  Calendar,
  ArrowRight,
  Loader2,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuthRedirect";

interface SearchResult {
  id: string;
  type: "project" | "task" | "file" | "announcement" | "user";
  title: string;
  description?: string;
  url: string;
  metadata?: {
    status?: string;
    created_at?: string;
    updated_at?: string;
    assigned_to?: string;
    file_type?: string;
    file_size?: number;
  };
}

interface GlobalSearchProps {
  className?: string;
  placeholder?: string;
  showSuggestions?: boolean;
  maxResults?: number;
}

export default function GlobalSearch({
  className = "",
  placeholder = "Search across projects, tasks, files, announcements...",
  showSuggestions = true,
  maxResults = 10,
}: GlobalSearchProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);

  // Close results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setShowResults(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Search suggestions
  useEffect(() => {
    if (searchTerm.length > 2 && showSuggestions) {
      const commonTerms = [
        "project",
        "task",
        "file",
        "announcement",
        "user",
        "admin",
        "supervisor",
        "student",
        "pending",
        "active",
        "completed",
        "finance",
        "proposal",
      ];

      const filtered = commonTerms.filter((term) =>
        term.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setSuggestions(filtered.slice(0, 5));
    } else {
      setSuggestions([]);
    }
  }, [searchTerm, showSuggestions]);

  // Perform search
  useEffect(() => {
    const performSearch = async () => {
      if (searchTerm.length < 2) {
        setResults([]);
        setShowResults(false);
        return;
      }

      setLoading(true);
      try {
        const response = await fetch(
          `/api/search?q=${encodeURIComponent(searchTerm)}&limit=${maxResults}`
        );
        const data = await response.json();

        if (response.ok) {
          setResults(data.results || []);
          setShowResults(true);
        } else {
          console.error("Search failed:", data.error);
          setResults([]);
        }
      } catch (error) {
        console.error("Search error:", error);
        setResults([]);
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(performSearch, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchTerm, maxResults]);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "project":
        return <FolderOpen className="w-4 h-4" />;
      case "task":
        return <ClipboardList className="w-4 h-4" />;
      case "file":
        return <FileText className="w-4 h-4" />;
      case "announcement":
        return <Megaphone className="w-4 h-4" />;
      case "user":
        return <Users className="w-4 h-4" />;
      default:
        return <Search className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "project":
        return "bg-blue-500 text-white";
      case "task":
        return "bg-green-500 text-white";
      case "file":
        return "bg-purple-500 text-white";
      case "announcement":
        return "bg-orange-500 text-white";
      case "user":
        return "bg-cyan-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const handleResultClick = (result: SearchResult) => {
    router.push(result.url);
    setShowResults(false);
    setSearchTerm("");
  };

  const handleSuggestionClick = (suggestion: string) => {
    setSearchTerm(suggestion);
  };

  const clearSearch = () => {
    setSearchTerm("");
    setResults([]);
    setShowResults(false);
  };

  return (
    <div className={`relative ${className}`} ref={searchRef}>
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-4 h-4" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-10 pr-10 py-2 bg-[#18181b] border border-neutral-700 rounded-md text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
          onFocus={() => {
            if (searchTerm.length >= 2) {
              setShowResults(true);
            }
          }}
        />
        {searchTerm && (
          <button
            onClick={clearSearch}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Search Results */}
      {showResults && (
        <Card className="absolute top-full left-0 right-0 mt-2 bg-[#23232a] border-orange-500 shadow-lg z-50 max-h-96 overflow-y-auto">
          <CardContent className="p-0">
            {loading ? (
              <div className="p-4 flex items-center justify-center">
                <Loader2 className="w-5 h-5 text-orange-400 animate-spin mr-2" />
                <span className="text-neutral-400">Searching...</span>
              </div>
            ) : results.length > 0 ? (
              <div className="divide-y divide-neutral-700">
                {results.map((result) => (
                  <div
                    key={`${result.type}-${result.id}`}
                    onClick={() => handleResultClick(result)}
                    className="p-4 hover:bg-neutral-800/50 cursor-pointer transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-1">
                        {getTypeIcon(result.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="text-white font-medium truncate">
                            {result.title}
                          </h4>
                          <Badge
                            className={`text-xs ${getTypeColor(result.type)}`}
                          >
                            {result.type}
                          </Badge>
                        </div>
                        {result.description && (
                          <p className="text-neutral-400 text-sm line-clamp-2 mb-2">
                            {result.description}
                          </p>
                        )}
                        <div className="flex items-center gap-4 text-xs text-neutral-500">
                          {result.metadata?.status && (
                            <span className="capitalize">
                              {result.metadata.status}
                            </span>
                          )}
                          {result.metadata?.created_at && (
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {formatDate(result.metadata.created_at)}
                            </div>
                          )}
                          {result.metadata?.file_type && (
                            <span>{result.metadata.file_type}</span>
                          )}
                          {result.metadata?.file_size && (
                            <span>
                              {(
                                result.metadata.file_size /
                                1024 /
                                1024
                              ).toFixed(2)}{" "}
                              MB
                            </span>
                          )}
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-neutral-400 flex-shrink-0" />
                    </div>
                  </div>
                ))}
              </div>
            ) : searchTerm.length >= 2 ? (
              <div className="p-4 text-center">
                <Search className="w-8 h-8 text-neutral-400 mx-auto mb-2" />
                <p className="text-neutral-400">
                  No results found for "{searchTerm}"
                </p>
              </div>
            ) : null}
          </CardContent>
        </Card>
      )}

      {/* Search Suggestions */}
      {suggestions.length > 0 && !showResults && searchTerm.length > 2 && (
        <Card className="absolute top-full left-0 right-0 mt-2 bg-[#23232a] border-orange-500 shadow-lg z-50">
          <CardContent className="p-0">
            <div className="divide-y divide-neutral-700">
              {suggestions.map((suggestion, index) => (
                <div
                  key={index}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="p-3 hover:bg-neutral-800/50 cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Search className="w-4 h-4 text-neutral-400" />
                    <span className="text-white">{suggestion}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
