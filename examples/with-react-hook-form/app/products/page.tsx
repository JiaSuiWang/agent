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

  return (
    <AssistantSidebar>
      <div className="h-full overflow-y-scroll">
        <div className="container mx-auto py-8">
          <div className="mb-8 flex items-center justify-between">
            <h1 className="text-3xl font-bold">产品展示</h1>
            <Link href="/">
              <Button variant="outline" className="flex items-center gap-2">
                <InfoIcon className="h-4 w-4" />
                填写表单
              </Button>
            </Link>
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
                  <Button className="mt-4 flex w-full items-center gap-2">
                    <ShoppingCart className="h-4 w-4" />
                    加入购物车
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </AssistantSidebar>
  );
}
