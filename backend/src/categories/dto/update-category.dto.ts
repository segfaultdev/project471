/**
 * UpdateCategoryDto - Data Transfer Object for updating categories
 * All fields are optional (partial update)
 */
export class UpdateCategoryDto {
  // Category name - optional update field
  name?: string;

  // Category description - optional update field
  description?: string;
}
