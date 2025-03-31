"use client";

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
import { useState } from "react";
import { Toast } from "@/components/ui/toast";
import { useCartStore } from "@/lib/store";

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
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const { items, addItem } = useCartStore();
  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const handleAddToCart = (product: (typeof products)[0]) => {
    addItem(product);
    setToastMessage(`${product.name} 已添加到购物车`);
    setShowToast(true);
  };

  return (
    <AssistantSidebar>
      <div className="h-full overflow-y-scroll">
        <div className="container mx-auto py-8">
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

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <Card
                key={product.id}
                className="transition-shadow hover:shadow-lg"
              >
                <CardHeader>
                  <CardTitle>{product.name}</CardTitle>
                  <CardDescription>{product.price}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">{product.description}</p>
                  <Button
                    className="mt-4 flex w-full items-center gap-2"
                    onClick={() => handleAddToCart(product)}
                  >
                    <ShoppingCart className="h-4 w-4" />
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
