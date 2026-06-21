import { z } from "zod";

// Receipt scanner schemas
export const ReceiptItemSchema = z.object({
  name: z.string(),
  quantity: z.number().default(1),
  unit_price: z.number().nullable(),
  total: z.number().nullable(),
});

export const ReceiptDataSchema = z.object({
  store_name: z.string().nullable(),
  date: z.string().nullable(),
  items: z.array(ReceiptItemSchema),
  receipt_total: z.number().nullable(),
});

export type ReceiptData = z.infer<typeof ReceiptDataSchema>;
export type ReceiptItem = z.infer<typeof ReceiptItemSchema>;

// Review item (after user matches to ingredients)
export type ReviewItem = {
  receipt_item: ReceiptItem;
  ingredient_id: string | null;
  name_es: string;
  quantity: number;
  unit: string;
  cost_per_unit: number;
  total_cost: number;
  category: string;
  is_new: boolean;
  excluded: boolean;
};
