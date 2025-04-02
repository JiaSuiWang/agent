import {
  useAssistantRuntime,
  useAssistantToolUI,
  Tool,
} from "@assistant-ui/react";
import { useEffect } from "react";

const AddToCartTool = () => {
  return (
    <p className="text-center font-mono text-sm font-bold text-blue-500">
      add_to_cart(...)
    </p>
  );
};

export const useAssistantTools = () => {
  const assistantRuntime = useAssistantRuntime();

  useEffect(() => {
    const value = {
      system: `Help users operate the product page. Available products:
  1. Wireless Headphones (ID: 1)
     - Price: ¥999
     - Description: High quality wireless Bluetooth headphones with active noise cancellation
  
  2. Smart Rice Cooker (ID: 2)
     - Price: ¥599
     - Description: Multi-functional smart rice cooker with various cooking modes
  
  3. Smart Refrigerator (ID: 3)
     - Price: ¥3999
     - Description: Large capacity smart refrigerator with intelligent temperature control
  
  When user mentions a product name, find the corresponding product ID and add it to cart.`,
      tools: {
        add_to_cart: {
          description:
            "Execute this tool when user mentions product names or 'add to cart' related expressions. This tool will find the product by name and add it to the shopping cart. Examples: 'add wireless headphones to cart', 'buy smart rice cooker', 'add smart refrigerator to my cart'. The tool will automatically find the correct product ID based on the product name.",
          parameters: {
            type: "object",
            properties: {
              productId: {
                type: "number",
                description:
                  "The ID of the product to add to cart (1: Wireless Headphones, 2: Smart Rice Cooker, 3: Smart Refrigerator)",
              },
              quantity: {
                type: "number",
                description: "The quantity of the product to add (default: 1)",
              },
            },
            required: ["productId"],
          },
          execute: async (args: { productId: number; quantity?: number }) => {
            window.dispatchEvent(
              new CustomEvent("add_to_cart", {
                detail: {
                  productId: args.productId,
                  quantity: args.quantity || 1,
                },
              }),
            );
            return { success: true };
          },
        } as Tool<any, any>,
      },
    };

    return assistantRuntime.registerModelContextProvider({
      getModelContext: () => value,
    });
  }, [assistantRuntime]);

  // Register tool UI
  useAssistantToolUI({
    toolName: "add_to_cart",
    render: AddToCartTool,
  });
};
