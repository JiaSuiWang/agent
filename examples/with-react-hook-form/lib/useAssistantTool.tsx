import {
  useAssistantRuntime,
  useAssistantToolUI,
  Tool,
} from "@assistant-ui/react";
import { useEffect } from "react";
import { useCartStore } from "@/lib/store";

const AddToCartTool = () => {
  return (
    <p className="text-center font-mono text-sm font-bold text-blue-500">
      add_to_cart(...)
    </p>
  );
};

const GoToCartTool = () => {
  return (
    <p className="text-center font-mono text-sm font-bold text-green-500">
      go_to_cart(...)
    </p>
  );
};

const GetCartItemsTool = () => {
  return (
    <p className="text-center font-mono text-sm font-bold text-purple-500">
      get_cart_items(...)
    </p>
  );
};

const ProcessOrderTool = () => {
  return (
    <p className="text-center font-mono text-sm font-bold text-orange-500">
      process_order(...)
    </p>
  );
};

export const useAssistantTools = () => {
  const assistantRuntime = useAssistantRuntime();
  const { items } = useCartStore();

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

When user mentions a product name, find the corresponding product ID and add it to cart.
When user wants to view their cart or checkout, navigate to the cart page.
When user asks about their cart contents, check the cart and inform them of what items are in their cart.
When user wants to proceed with order or checkout, navigate to the order form page.`,
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
        go_to_cart: {
          description:
            "Execute this tool when user expresses desire to view cart, checkout, or proceed to cart page. Examples: 'go to cart', 'view my cart', 'checkout', 'show me what's in my cart', 'I want to see my cart'.",
          parameters: {
            type: "object",
            properties: {},
            required: [],
          },
          execute: async () => {
            window.dispatchEvent(new CustomEvent("go_to_cart"));
            return { success: true };
          },
        } as Tool<any, any>,
        get_cart_items: {
          description:
            "Execute this tool when user asks about what's in their cart or wants to know cart contents. Examples: 'what's in my cart?', 'what items do I have?', 'show me my cart contents', 'what have I added so far?'",
          parameters: {
            type: "object",
            properties: {},
            required: [],
          },
          execute: async () => {
            const cartItems = items.map((item) => ({
              id: item.id,
              name: item.name,
              price: item.price,
              quantity: item.quantity,
            }));

            const totalQuantity = items.reduce(
              (sum, item) => sum + item.quantity,
              0,
            );
            const totalPrice = items.reduce(
              (sum, item) =>
                sum + parseFloat(item.price.replace("¥", "")) * item.quantity,
              0,
            );

            return {
              success: true,
              cartItems,
              totalItems: cartItems.length,
              totalQuantity,
              totalPrice: `¥${totalPrice.toFixed(2)}`,
            };
          },
        } as Tool<any, any>,
        process_order: {
          description:
            "Execute this tool when user wants to process their order, proceed to checkout, or fill shipping information. Examples: 'process my order', 'proceed to checkout', 'complete my purchase', 'I want to order these items', 'fill shipping information'.User still need to fill the shipping information. so user's order is not completed yet.",
          parameters: {
            type: "object",
            properties: {},
            required: [],
          },
          execute: async () => {
            window.dispatchEvent(new CustomEvent("process_order"));
            return { success: true };
          },
        } as Tool<any, any>,
      },
    };

    return assistantRuntime.registerModelContextProvider({
      getModelContext: () => value,
    });
  }, [assistantRuntime, items]);

  // Register tool UI
  useAssistantToolUI({
    toolName: "add_to_cart",
    render: AddToCartTool,
  });

  useAssistantToolUI({
    toolName: "go_to_cart",
    render: GoToCartTool,
  });

  useAssistantToolUI({
    toolName: "get_cart_items",
    render: GetCartItemsTool,
  });

  useAssistantToolUI({
    toolName: "process_order",
    render: ProcessOrderTool,
  });
};
