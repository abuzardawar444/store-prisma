import { Request, Response } from "express";
import db from "../utils/db";
import { Company } from "@prisma/client";
import {
  Filter,
  OrderBy,
  Product,
  QueryObj,
  SelectedFields,
} from "../utils/types";
import {
  imageSchema,
  updateProductSchema,
  validate,
} from "../utils/validation";
import multer from "multer";

const storage = multer.memoryStorage();
const upload = multer({ storage }).single("image");

export const createProduct = async (req: Request, res: Response) => {
  const { name, price, company, featured, rating } = req.body;
  const product = await db.products.create({
    data: {
      name,
      price,
      company,
      featured,
      rating,
    },
  });
  res.status(201).send({ product: "hello" });
};

// GetALLProducts
export const getAllProducts = async (req: Request, res: Response) => {
  const { featured, company, name, sort, fields, numericFilters }: Filter =
    req.query;

  // query-object
  const queryObj: QueryObj = {};
  if (numericFilters) {
    const operatorMap = {
      ">": "gt",
      ">=": "gte",
      "=": "eq",
      "<": "lt",
      "<=": "lte",
    };
    const regEx = /\b(<|>|>=|=|<|<=)\b/g;
    let filters = (numericFilters as string).replace(
      regEx,
      (match) => `-${operatorMap[match]}-`
    );
    const options = ["price", "rating"];
    filters.split(",").forEach((item) => {
      const [field, operator, value] = item.split("-");
      if (options.includes(field)) {
        queryObj[field] = { [operator]: Number(value) };
      }
    });
    console.log(queryObj);
  }
  // featured filter
  if (featured) {
    queryObj.featured = featured === "true" ? true : false;
  }

  // company filter
  if (company) {
    queryObj.company = company as Company;
  }

  // name filter
  if (name) {
    queryObj.name = { contains: name, mode: "insensitive" };
  }

  // sort functionalities
  let orderBy: OrderBy[] = [{ createdAt: "desc" }];
  if (sort && typeof sort === "string") {
    orderBy = sort.split(",").map((field): OrderBy => {
      const [key, direction] = field.split(":");
      return {
        [key]: direction === "desc" ? "desc" : "asc",
      };
    });
  }

  // fields functionalites
  let selectedFields: SelectedFields = {};
  if (fields) {
    fields.split(",").map((field) => {
      selectedFields[field.trim()] = true;
    });
  }

  if (Object.keys(selectedFields).length === 0) {
    selectedFields = {
      id: true,
      name: true,
      price: true,
      company: true,
      featured: true,
      rating: true,
      createdAt: true,
      updatedAt: true,
    };
  }

  // Paginations
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  // find products
  const totalProducts = await db.products.count({ where: queryObj });
  const products = await db.products.findMany({
    where: queryObj,
    orderBy,
    select: selectedFields,
    skip,
    take: limit,
  });
  res.status(200).json({
    products,
    nbHits: products.length,
    totalProducts,
    totalPages: Math.ceil(totalProducts / limit),
    page,
  });
};

export const getProduct = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { fields }: Filter = req.query;
  let selectedFields: SelectedFields = {};
  if (fields) {
    fields.split(",").map((field) => {
      selectedFields[field.trim()] = true;
    });
  }
  if (Object.keys(selectedFields).length === 0) {
    selectedFields = {
      id: true,
      name: true,
      price: true,
      company: true,
      featured: true,
      rating: true,
      createdAt: true,
      updatedAt: true,
    };
  }
  const product = await db.products.findUnique({
    where: { id },
    select: selectedFields,
  });
  res.status(200).json({ product });
};

export const updateProduct = async (req: Request, res: Response) => {
  const { id } = req.params;
  const existingProduct = await db.products.findUnique({ where: { id } });
  if (!existingProduct) {
    res.status(404).json({ message: "Product doesn't exists" });
    return;
  }
  const updates: Product = req.body;
  const validateProducts = updateProductSchema.safeParse(updates);
  const product = await db.products.update({
    where: { id },
    data: validateProducts.data,
  });
  res.status(200).json({ product });
};

export const deleteProduct = async (req: Request, res: Response) => {
  const { id } = req.params;
  const existingProduct = await db.products.findUnique({ where: { id } });
  if (!existingProduct) {
    res.status(404).json({ message: "product doesn't exists" });
    return;
  }
  await db.products.delete({
    where: {
      id,
    },
  });
  res.status(200).json({ message: "Product deleted" });
};
