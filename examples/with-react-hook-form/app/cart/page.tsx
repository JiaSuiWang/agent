"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowLeft, ShoppingCart, Trash2 } from "lucide-react";
import Link from "next/link";
import { AssistantSidebar } from "@/components/ui/assistant-ui/assistant-sidebar";
import { useAssistantInstructions } from "@assistant-ui/react";
import { useCartStore } from "@/lib/store";

export default function CartPage() {
  useAssistantInstructions("帮助用户管理购物车。");
  const { items, removeItem, updateQuantity } = useCartStore();

  const total = items.reduce((sum, item) => {
    const price = parseInt(item.price.replace("¥", ""));
    return sum + price * item.quantity;
  }, 0);

  return (
    <AssistantSidebar>
      <div className="h-full overflow-y-scroll">
        <div className="container mx-auto py-8">
          <div className="mb-8 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/products">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </Link>
              <h1 className="text-3xl font-bold">购物车</h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative">
                <ShoppingCart className="h-6 w-6" />
                {items.length > 0 && (
                  <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                    {items.reduce((sum, item) => sum + item.quantity, 0)}
                  </span>
                )}
              </div>
            </div>
          </div>

          {items.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-gray-500">购物车是空的</p>
              <Link href="/products">
                <Button className="mt-4">继续购物</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <Card
                  key={item.id}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-4 p-4">
                    <div className="relative h-20 w-20 overflow-hidden rounded-lg">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">{item.name}</h3>
                      <p className="text-gray-600">{item.price}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-4">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => updateQuantity(item.id, -1)}
                      >
                        -
                      </Button>
                      <span className="w-8 text-center">{item.quantity}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => updateQuantity(item.id, 1)}
                      >
                        +
                      </Button>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeItem(item.id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </Card>
              ))}

              <Card className="mt-6">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-semibold">总计:</span>
                    <span className="text-primary text-2xl font-bold">
                      ¥{total}
                    </span>
                  </div>
                  <Button className="mt-4 w-full">结算</Button>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </AssistantSidebar>
  );
}
