"use server";

import { getAnthropicClient } from "@/lib/ai/client";
import { ReceiptDataSchema, type ReceiptData } from "@/lib/ai/types";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

const RECEIPT_SYSTEM_PROMPT = `You are a receipt data extractor for a catering business in Texas, USA.
Extract data from grocery store receipts. Receipts are typically from Texas stores (HEB, Walmart, Fiesta, Sam's Club, Costco, Aldi) and use English text with USD prices.

Return ONLY valid JSON with this exact structure:
{
  "store_name": "string or null",
  "date": "YYYY-MM-DD or null",
  "items": [
    {
      "name": "item name as written on receipt",
      "quantity": number (default 1),
      "unit_price": number,
      "total": number
    }
  ],
  "receipt_total": number or null
}

Rules:
- Prices are in USD (US dollars)
- If quantity is not explicit, default to 1
- Include ALL food/ingredient line items
- For produce sold by weight (lb), use the weight as quantity
- Ignore tax lines, change given, payment method, loyalty savings breakdown
- If you cannot read part of the receipt, include what you can and set uncertain fields to null
- Do NOT include non-food items (bags, cleaning supplies) unless they look like a cooking ingredient`;

/**
 * Scan a receipt image using Claude Vision and extract structured data
 */
export async function scanReceipt(
  formData: FormData
): Promise<{ data?: ReceiptData; error?: string }> {
  try {
    const file = formData.get("file") as File;
    if (!file || file.size === 0) {
      return { error: "No file provided" };
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return { error: "Only JPEG, PNG, and WebP images are allowed" };
    }

    // Limit to 5MB (receipt photos from iPhone can be large)
    if (file.size > 5 * 1024 * 1024) {
      return { error: "Image must be under 5MB" };
    }

    // Convert to base64
    const buffer = Buffer.from(await file.arrayBuffer());
    const base64 = buffer.toString("base64");
    const mediaType = file.type as "image/jpeg" | "image/png" | "image/webp";

    // Call Claude Vision
    const client = getAnthropicClient();
    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4096,
      system: RECEIPT_SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: { type: "base64", media_type: mediaType, data: base64 },
            },
            {
              type: "text",
              text: "Extract all items from this grocery receipt. Return ONLY the JSON.",
            },
          ],
        },
      ],
    });

    // Extract text response
    const textBlock = response.content.find((b) => b.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      return { error: "No response from AI" };
    }

    // Parse JSON from response (Claude might wrap in ```json blocks)
    let jsonStr = textBlock.text.trim();
    if (jsonStr.startsWith("```")) {
      jsonStr = jsonStr.replace(/```json?\n?/g, "").replace(/```$/g, "").trim();
    }

    const parsed = JSON.parse(jsonStr);
    const validated = ReceiptDataSchema.parse(parsed);

    return { data: validated };
  } catch (error) {
    console.error("Receipt scan error:", error);
    if (error instanceof SyntaxError) {
      return { error: "Could not parse receipt data. Try a clearer photo." };
    }
    return { error: "Failed to scan receipt. Please try again." };
  }
}

export type ConfirmReceiptItem = {
  ingredient_id: string | null; // null = create new
  name_es: string;
  name_en?: string;
  quantity: number;
  unit: string;
  cost_per_unit: number;
  total_cost: number;
  category?: string;
  is_new: boolean;
};

export type ConfirmReceiptData = {
  items: ConfirmReceiptItem[];
  store_name?: string;
  receipt_date?: string;
};

/**
 * Confirm scanned receipt items — updates inventory and creates transactions
 */
export async function confirmReceipt(
  data: ConfirmReceiptData
): Promise<{ success?: boolean; itemsProcessed?: number; newCreated?: number; error?: string }> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id || null;

    let itemsProcessed = 0;
    let newCreated = 0;
    const notes = [
      data.store_name && `Tienda: ${data.store_name}`,
      data.receipt_date && `Fecha: ${data.receipt_date}`,
    ]
      .filter(Boolean)
      .join(" | ");

    for (const item of data.items) {
      let ingredientId = item.ingredient_id;

      // Create new ingredient if needed
      if (item.is_new || !ingredientId) {
        const { data: newIngredient, error: createError } = await supabase
          .from("ingredients")
          .insert({
            name_es: item.name_es,
            name_en: item.name_en || null,
            unit: item.unit,
            category: item.category || "other",
            current_stock: 0,
            min_stock: 0,
            cost_per_unit: item.cost_per_unit,
          })
          .select("id")
          .single();

        if (createError) {
          console.error("Failed to create ingredient:", createError);
          continue;
        }
        ingredientId = newIngredient.id;
        newCreated++;
      }

      // Update stock (increment)
      const { data: currentIngredient } = await supabase
        .from("ingredients")
        .select("current_stock")
        .eq("id", ingredientId)
        .single();

      if (currentIngredient) {
        await supabase
          .from("ingredients")
          .update({
            current_stock: currentIngredient.current_stock + item.quantity,
            cost_per_unit: item.cost_per_unit,
          })
          .eq("id", ingredientId);
      }

      // Record transaction
      await supabase.from("inventory_transactions").insert({
        ingredient_id: ingredientId,
        transaction_type: "purchase",
        quantity: item.quantity,
        notes: notes || null,
        created_by: userId,
      });

      itemsProcessed++;
    }

    revalidatePath("/inventario");
    revalidatePath("/compras");
    revalidatePath("/");

    return { success: true, itemsProcessed, newCreated };
  } catch (error) {
    console.error("Confirm receipt error:", error);
    return { error: "Failed to save receipt data. Please try again." };
  }
}
