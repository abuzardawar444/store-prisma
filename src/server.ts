import "express-async-errors";
import express from "express";
import dotenv from "dotenv";
import errorHandlerMiddleware from "./middleware/error-handler";
import notFound from "./middleware/not-found";
import productRoutes from "./routes/productsRoute";
dotenv.config();
const app = express();

// middleware
app.use(express.json());

// routes

// products routes
app.use("/api/v1/products", productRoutes);

app.use(notFound);
app.use(errorHandlerMiddleware);

app.listen(process.env.PORT, () => {
  console.log(`Server is listening on port ${process.env.PORT}`);
});
