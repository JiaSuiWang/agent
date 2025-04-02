"use client";

import { useCartStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { InfoIcon, ShoppingCart } from "lucide-react";
import Link from "next/link";
import { AssistantSidebar } from "@/components/ui/assistant-ui/assistant-sidebar";
import { useAssistantInstructions } from "@assistant-ui/react";
import { useState, useEffect } from "react";
import { Toast } from "@/components/ui/toast";
import { useAssistantTools } from "../../lib/useAssistantTool";

type Product = {
  id: number;
  name: string;
  description: string;
  price: string;
  image: string;
  quantity?: number;
};

const products = [
  {
    id: 1,
    name: "无线耳机",
    description: "高品质无线蓝牙耳机，支持主动降噪",
    price: "¥999",
    image: "/headphones.jpg",
  },
  {
    id: 2,
    name: "智能电饭煲",
    description: "多功能智能电饭煲，支持多种烹饪模式",
    price: "¥599",
    image: "/rice-cooker.jpg",
  },
  {
    id: 3,
    name: "智能冰箱",
    description: "大容量智能冰箱，支持温度智能调节",
    price: "¥3999",
    image: "/fridge.jpg",
  },
];

export default function ProductsPage() {
  useAssistantInstructions("帮助用户了解产品信息并填写表单。");
  useAssistantTools();
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const { items, addItem } = useCartStore();
  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const handleAddToCart = (product: Product, quantity: number = 1) => {
    addItem({ ...product, quantity });
    setToastMessage(`Added ${quantity} ${product.name} to cart`);
    setShowToast(true);
  };

  // Listen for add_to_cart command
  useEffect(() => {
    const handleAddToCartEvent = (event: CustomEvent) => {
      const { productId, quantity = 1 } = event.detail;
      const product = products.find((p) => p.id === productId);
      if (product) {
        handleAddToCart(product, quantity);
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
  }, []);

  return (
    <AssistantSidebar>
      <div className="h-full overflow-y-scroll">
        <div className="container mx-auto max-w-7xl py-8">
          <div className="mb-8 flex items-center justify-between">
            <h1 className="text-3xl font-bold">产品展示</h1>
            <div className="flex items-center gap-4">
              <Link href="/cart">
                <div className="relative cursor-pointer">
                  <ShoppingCart className="h-6 w-6" />
                  {cartCount > 0 && (
                    <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                      {cartCount}
                    </span>
                  )}
                </div>
              </Link>
              <Link href="/">
                <Button variant="outline" className="flex items-center gap-2">
                  <InfoIcon className="h-4 w-4" />
                  填写表单
                </Button>
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <Card
                key={product.id}
                className="group relative overflow-hidden border border-gray-100 bg-white/50 backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] hover:shadow-xl"
              >
                <div className="aspect-square w-full overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
                  <div className="h-full w-full bg-gradient-to-br from-gray-100 to-gray-200" />
                </div>
                <CardHeader className="space-y-1">
                  <CardTitle className="line-clamp-1 text-lg font-semibold tracking-tight">
                    {product.name}
                  </CardTitle>
                  <CardDescription className="text-primary text-lg font-medium">
                    {product.price}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-muted-foreground/80 line-clamp-2 text-sm">
                    {product.description}
                  </p>
                  <Button
                    className="bg-primary/90 hover:bg-primary mt-2 w-full transition-colors hover:shadow-md"
                    onClick={() => handleAddToCart(product)}
                  >
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    加入购物车
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
      <Toast
        show={showToast}
        onClose={() => setShowToast(false)}
        message={toastMessage}
      />
    </AssistantSidebar>
  );
}
