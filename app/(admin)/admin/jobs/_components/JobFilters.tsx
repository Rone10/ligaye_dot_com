"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, X, Plus } from "lucide-react";
import { useQueryState } from "nuqs";
import { getLocationsAction } from "../_actions";

interface Location {
  id: string;
  city: string | null;
  district: string | null;
  region: string;
}

export function JobFilters() {
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

  const handleSearchChange = (value: string) => {
    setSearchInput(value);
    setSearch(value || null);
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
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/70" />
          <Input
            placeholder="Search jobs by title or description..."
            value={searchInput}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10 h-11 bg-white border-gray-200 focus-visible:ring-emerald-500 focus-visible:border-emerald-500 shadow-sm"
          />
        </div>
        <Button asChild className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm h-11 px-5">
          <Link href="/employer/jobs/new">
            <Plus className="h-4 w-4 mr-2" />
            Create New Job
          </Link>
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Select value={status || "all"} onValueChange={(value) => setStatus(value === "all" ? null : value)}>
          <SelectTrigger className="w-[180px] h-9 border-gray-200 shadow-sm bg-white">
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
          <SelectTrigger className="w-[200px] h-9 border-gray-200 shadow-sm bg-white">
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
            className="h-9 text-sm text-muted-foreground hover:text-foreground"
          >
            <X className="mr-1.5 h-3.5 w-3.5" />
            Clear Filters
          </Button>
        )}
      </div>
    </div>
  );
}