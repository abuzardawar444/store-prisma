import { Company } from "@prisma/client";

export type Product = {
  name: string;
  price: number;
  image: string;
  company?: Company;
  featured?: boolean;
  rating?: number;
};

export type QueryObj = {
  featured?: boolean;
  company?: Company;
  name?: {
    contains: string;
    mode: "insensitive";
  };
};
export type OrderBy = {
  [key: string]: "asc" | "desc";
};

export type SelectedFields = {
  [key: string]: boolean;
};
export type Filter = {
  featured?: string;
  company?: Company;
  name?: string;
  sort?: string;
  fields?: string;
  numericFilters?: QueryObj;
};
