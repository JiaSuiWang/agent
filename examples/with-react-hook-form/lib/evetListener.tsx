import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/lib/store";

type Product = {
  id: number;
  name: string;
  description: string;
  price: string;
  image: string;
  quantity?: number;
};

/**
 * Custom hook to manage all event listeners in one place
 */
export const useEventListeners = (
  products: Product[],
  onAddToCart?: (product: Product, quantity: number) => void,
) => {
  const router = useRouter();
  const { items } = useCartStore();

  // Listen for add_to_cart command
  useEffect(() => {
    if (!products || !onAddToCart) return;

    const handleAddToCartEvent = (event: CustomEvent) => {
      const { productId, quantity = 1 } = event.detail;
      const product = products.find((p) => p.id === productId);
      if (product) {
        onAddToCart(product, quantity);
      }
    };

    window.addEventListener(
      "add_to_cart",
      handleAddToCartEvent as EventListener,
    );
    return () => {
      window.removeEventListener(
        "add_to_cart",
        handleAddToCartEvent as EventListener,
      );
    };
  }, [products, onAddToCart]);

  // Listen for go_to_cart command
  useEffect(() => {
    const handleGoToCart = () => {
      router.push("/cart");
    };

    window.addEventListener("go_to_cart", handleGoToCart as EventListener);
    return () => {
      window.removeEventListener("go_to_cart", handleGoToCart as EventListener);
    };
  }, [router]);

  // Listen for process_order command
  useEffect(() => {
    const handleProcessOrder = () => {
      router.push("/"); // Navigate to the order form page
    };

    window.addEventListener(
      "process_order",
      handleProcessOrder as EventListener,
    );
    return () => {
      window.removeEventListener(
        "process_order",
        handleProcessOrder as EventListener,
      );
    };
  }, [router]);

  // Custom hook for get_cart_items functionality
  // This doesn't need an event listener, as it's directly called from the tool
  const getCartItems = () => {
    const cartItems = items.map((item) => ({
      id: item.id,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
    }));

    const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
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
  };

  return { getCartItems };
};
