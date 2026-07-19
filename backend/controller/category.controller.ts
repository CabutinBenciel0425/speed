import Category from "../models/category.model.js";
import type { CategoryUpdateInput } from "../schemas/category.schema.js";
import {
  createNewCategory,
  updateDetailsCategory,
} from "../services/category.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import type { Request, Response } from "express";
import { NotFoundError } from "../utils/errors.js";

export const createCategory = asyncHandler(
  async (req: Request, res: Response) => {
    const { name, description, displayOrder } = req.body;
    const image = req.file;
    const newCategory = await createNewCategory(
      name,
      description,
      displayOrder,
      image,
    );

    res.status(201).json({
      success: true,
      data: newCategory,
    });
  },
);
export const allCategory = asyncHandler(async (req: Request, res: Response) => {
  const allCategory = await Category.find({});

  res.status(200).json({
    success: true,
    data: allCategory,
  });
});

export const updateCategory = asyncHandler(
  async (req: Request, res: Response) => {
    const categoryId = req.params.id;
    const body: CategoryUpdateInput = req.body;
    const image: Express.Multer.File | undefined = req.file;

    if (!categoryId) {
      throw new NotFoundError("Category id not found");
    }

    const updatedCategory = await updateDetailsCategory(
      body,
      image,
      categoryId.toString(),
    );
    res.status(201).json({
      success: true,
      data: updatedCategory,
    });
  },
);

export const toggleIsActive = asyncHandler(
  async (req: Request, res: Response) => {
    const category = await Category.findById(req.params.id);

    if (!category) {
      throw new NotFoundError("Category not found");
    }

    category.isActive = !category.isActive;

    await category.save();

    res.status(200).json({
      success: true,
      data: category,
    });
  },
);

//toggling isActive
