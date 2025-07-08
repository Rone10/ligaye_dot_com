"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";
import { useQueryState } from "nuqs";
import { getLocationsAction } from "../_actions";

interface Location {
  id: string;
  city: string | null;
  district: string | null;
  region: string;
}

export function JobFilters() {
  const router = useRouter();
  const [locations, setLocations] = useState<Location[]>([]);
  const [searchInput, setSearchInput] = useState("");
  
  const [status, setStatus] = useQueryState("status");
  const [search, setSearch] = useQueryState("search");
  const [location, setLocation] = useQueryState("location");

  useEffect(() => {
    const fetchLocations = async () => {
      const result = await getLocationsAction();
      if (result.success && result.data) {
        setLocations(result.data);
      }
    };
    fetchLocations();
  }, []);

  useEffect(() => {
    setSearchInput(search || "");
  }, [search]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput || null);
  };

  const handleClearFilters = () => {
    setStatus(null);
    setSearch(null);
    setLocation(null);
    setSearchInput("");
  };

  const hasActiveFilters = status || search || location;

  return (
    <div className="mb-6 space-y-4">
      <form onSubmit={handleSearch} className="flex gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by job title or description..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button type="submit" variant="secondary">
          Search
        </Button>
      </form>

      <div className="flex flex-wrap gap-4">
        <Select value={status || "all"} onValueChange={(value) => setStatus(value === "all" ? null : value)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="ACTIVE">Active</SelectItem>
            <SelectItem value="PENDING_PAYMENT">Pending Payment</SelectItem>
            <SelectItem value="DRAFT">Draft</SelectItem>
            <SelectItem value="EXPIRED">Expired</SelectItem>
            <SelectItem value="FILLED">Filled</SelectItem>
            <SelectItem value="DELETED">Deleted</SelectItem>
          </SelectContent>
        </Select>

        <Select value={location || "all"} onValueChange={(value) => setLocation(value === "all" ? null : value)}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="All Locations" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Locations</SelectItem>
            {locations.map((loc) => (
              <SelectItem key={loc.id} value={loc.id}>
                {loc.city || loc.district || "Unknown"}
                {loc.region && ` - ${loc.region}`}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearFilters}
            className="h-10"
          >
            <X className="mr-2 h-4 w-4" />
            Clear Filters
          </Button>
        )}
      </div>
    </div>
  );
}