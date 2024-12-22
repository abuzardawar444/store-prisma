import { Company } from "@prisma/client";
import { NextFunction, Request, Response } from "express";
import { z, ZodSchema } from "zod";

export const productSchema = z.object({
  name: z.string().min(3, "Name is required"),
  price: z.number().positive("Price must be a positive number"),
  rating: z.number().min(1).max(5, "Rating must be between 0 and 5"),
  company: z.enum(Object.values(Company) as [string, ...string[]], {
    errorMap: () => ({
      message: "Company must be one of IKEA, LIDDY, MARCOSE, or CAREASA",
    }),
  }),
  featured: z.boolean().optional(),
});

export const idSchema = z.object({
  id: z.string().uuid("Invalid product id format").optional(),
});

export const updateProductSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters").optional(),
  price: z.number().positive("Price must be a positive number").optional(),
  company: z.enum(["IKEA", "LIDDY", "CAREASA"]).optional(),
  featured: z.boolean().optional(),
  rating: z.number().min(1).max(5, "Rating must be between 1 and 5").optional(),
});

export const imageSchema = z.object({
  image: validateFile(),
});

export const validate =
  (schema: ZodSchema) => (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          success: false,
          errors: error.errors.map((err) => ({
            path: err.path,
            message: err.message,
          })),
        });
        return;
      }
      next(error);
    }
  };

function validateFile() {
  const maxUploadSize = 1024 * 1024;
  const acceptedFilesTypes = ["image/"];
  return z
    .instanceof(File)
    .refine((file) => {
      return !file || file.size <= maxUploadSize;
    }, "File size must be less then 1 MB")
    .refine((file) => {
      return (
        !file || acceptedFilesTypes.some((type) => file.type.startsWith(type))
      );
    }, "File must be an image");
}
