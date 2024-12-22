import express from "express";
import {
  createProduct,
  deleteProduct,
  getAllProducts,
  getProduct,
  updateProduct,
} from "../controllers/products";
import {
  idSchema,
  productSchema,
  updateProductSchema,
  validate,
} from "../utils/validation";

const router = express.Router();

router.route("/").post(createProduct).get(getAllProducts);
router
  .route("/:id")
  .get(validate(idSchema), getProduct)
  .patch(validate(updateProductSchema), updateProduct)
  .delete(validate(idSchema), deleteProduct);
export default router;
