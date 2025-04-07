"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Star, ShoppingCart, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useCartStore } from "@/lib/store";
import { AssistantSidebar } from "@/components/ui/assistant-ui/assistant-sidebar";
import { useAssistantInstructions } from "@assistant-ui/react";
import { Toast } from "@/components/ui/toast";

// 添加滚动样式
const scrollbarStyles = `
  .scrollable-content {
    height: calc(100vh - 40px);
    overflow-y: auto;
  }
`;

interface HeadsetInfo {
  productName: string; // 商品名
  brand: string; // ブランド
  features: string[]; // 特徴
  warrantyPeriod: string; // 保証期間
  description: string; // 商品説明
}

interface Comment {
  rating: string;
  title: string;
  date: string;
  url: string;
  purchaseVerification: string;
  content: string;
  helpfulCount: string;
  hasJapaneseText?: boolean;
  username?: string;
}

export default function HeadsetDetailPage() {
  useAssistantInstructions(
    "Help the user understand the headset product details and reviews.",
  );

  const [headsetInfo, setHeadsetInfo] = useState<HeadsetInfo | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const commentsPerPage = 5;

  const { addItem } = useCartStore();

  useEffect(() => {
    // 加载耳机介绍信息
    fetch("/introduction/headset.json")
      .then((response) => response.json())
      .then((data) => {
        // 将JSON数据中的日文键名映射到英文键名，但保留日文内容
        const mappedData: HeadsetInfo = {
          productName: data.商品名,
          brand: data.ブランド,
          features: data.特徴,
          warrantyPeriod: data.保証期間,
          description: data.商品説明,
        };
        setHeadsetInfo(mappedData);
      })
      .catch((error) =>
        console.error("Error loading headset information:", error),
      );

    // 加载评论信息
    fetch("/comments/headset-comments.csv")
      .then((response) => response.text())
      .then((csvText) => {
        // 解析CSV文本
        const rows = csvText.split("\n");

        // 解析标题行获取列索引
        if (rows.length > 0) {
          const headerRow = rows[0] || "";
          // 使用一个辅助函数解析CSV行
          const parseCSVRow = (row: string): string[] => {
            const matches = row.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g);
            if (!matches) return [];
            return matches.map((val) => val.replace(/"/g, ""));
          };

          const headers = parseCSVRow(headerRow);

          // 找到需要的列索引
          const usernameIndex = headers.indexOf("a-profile-name");
          const contentIndex = headers.indexOf("a-size-base 3");
          const ratingIndex = headers.indexOf("a-icon-alt");
          const titleIndex = headers.indexOf("a-size-base");
          const dateIndex = headers.indexOf("a-size-base 2");
          const purchaseIndex = headers.indexOf("a-size-mini");

          console.log("列索引:", {
            usernameIndex,
            contentIndex,
            ratingIndex,
            titleIndex,
            dateIndex,
          });

          // 解析评论数据
          const parsedComments: Comment[] = [];

          // 从第二行开始解析数据行
          for (let i = 1; i < rows.length; i++) {
            const row = rows[i] || "";
            if (!row.trim()) continue;

            const values = parseCSVRow(row);

            // 如果行解析结果不为空且包含足够的值
            if (values.length > 0) {
              // 安全地获取值，确保不会得到undefined
              const getValueSafely = (index: number): string => {
                return index >= 0 && index < values.length && values[index]
                  ? values[index]
                  : "";
              };

              const username = getValueSafely(usernameIndex) || "ユーザー";
              const content = getValueSafely(contentIndex);

              // 跳过没有内容的评论
              if (!content) continue;

              const rating = getValueSafely(ratingIndex) || "5つ星のうち5.0";
              const title = getValueSafely(titleIndex) || "レビュー";
              const date =
                getValueSafely(dateIndex) || "2024年に日本でレビュー済み";
              const purchaseVerification =
                getValueSafely(purchaseIndex) || "Amazonで購入";

              // 创建评论对象
              parsedComments.push({
                username,
                content,
                rating,
                title,
                date,
                purchaseVerification,
                url: "#",
                helpfulCount: "",
                hasJapaneseText: true,
              });
            }
          }

          console.log(`成功解析 ${parsedComments.length} 条评论`);
          setComments(parsedComments);
        } else {
          console.error("CSV文件为空");
          setComments([]);
        }

        setLoading(false);
      })
      .catch((error) => {
        console.error("Error loading comments:", error);
        setLoading(false);
      });
  }, []);

  const handleAddToCart = () => {
    const product = {
      id: 1,
      name: "无线耳机",
      description: "高品质无线蓝牙耳机，支持主动降噪",
      price: "¥999",
      image: "/images/headphone.jpg",
      quantity: 1,
    };

    addItem(product);
    setToastMessage(`Added ${product.quantity} ${product.name} to cart`);
    setShowToast(true);
  };

  // 星级评分展示组件
  const RatingStars = ({ rating }: { rating: string }) => {
    // 从评分字符串中提取数字
    const match = rating.match(/(\d+\.?\d*)/);
    const ratingNumber = match ? parseFloat(match[0]) : 0;
    const starCount = Math.round(ratingNumber);

    return (
      <div className="flex">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`h-4 w-4 ${i < starCount ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
          />
        ))}
      </div>
    );
  };

  // 计算当前页显示的评论
  const indexOfLastComment = currentPage * commentsPerPage;
  const indexOfFirstComment = indexOfLastComment - commentsPerPage;
  const currentComments = comments.slice(
    indexOfFirstComment,
    indexOfLastComment,
  );

  // 计算总页数
  const totalPages = Math.ceil(comments.length / commentsPerPage);

  // 分页按钮处理函数
  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    // 滚动到评论部分顶部
    const reviewsSection = document.getElementById("reviews-section");
    if (reviewsSection) {
      reviewsSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <AssistantSidebar>
      <style jsx global>
        {scrollbarStyles}
      </style>

      <div className="scrollable-content">
        <div className="container mx-auto max-w-7xl px-4 py-8">
          <div className="mb-6">
            <Link
              href="/products"
              className="flex items-center text-blue-600 hover:text-blue-800"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              製品一覧に戻る
            </Link>
          </div>

          {loading ? (
            <div className="flex h-64 items-center justify-center">
              <div className="border-primary h-8 w-8 animate-spin rounded-full border-b-2 border-t-2"></div>
            </div>
          ) : (
            <>
              <div className="mb-12 grid grid-cols-1 gap-8 md:grid-cols-2">
                {/* 产品图片 */}
                <div
                  className="aspect-square cursor-pointer overflow-hidden rounded-lg bg-gradient-to-br from-gray-50 to-gray-100"
                  onClick={() => setImageModalOpen(true)}
                >
                  <Image
                    src="/images/headphone.jpg"
                    alt="Wireless Headset"
                    width={600}
                    height={600}
                    className="h-full w-full object-contain"
                  />
                </div>

                {/* 产品信息区域 */}
                <div className="flex flex-col justify-between">
                  <div className="flex flex-col">
                    <h1 className="mb-2 text-3xl font-bold">
                      ワイヤレスヘッドセット
                    </h1>
                    <p className="text-primary mb-4 text-2xl font-medium">
                      ¥999
                    </p>

                    {headsetInfo && (
                      <div className="space-y-4">
                        <div>
                          <h2 className="text-lg font-semibold">商品名</h2>
                          <p className="text-gray-700">
                            {headsetInfo.productName}
                          </p>
                        </div>

                        <div>
                          <h2 className="text-lg font-semibold">仕様</h2>
                          <ul className="ml-5 list-disc text-gray-700">
                            <li>接続: USB Type-C (Type-Aアダプタ付き)</li>
                            <li>スピーカータイプ: オンイヤー</li>
                            <li>マイク: ノイズキャンセリング</li>
                            <li>ケーブル長: 1.8m</li>
                            <li>重量: 180g</li>
                            <li>対応: Windows、Mac、Android、iOS</li>
                          </ul>
                        </div>
                      </div>
                    )}
                  </div>

                  <Button
                    className="mt-6 w-full py-6 text-lg"
                    onClick={handleAddToCart}
                  >
                    <ShoppingCart className="mr-2 h-5 w-5" />
                    カートに追加
                  </Button>
                </div>
              </div>

              {/* 评论部分 */}
              <div id="reviews-section" className="mb-16 mt-16">
                <h2 className="mb-8 text-2xl font-bold">
                  カスタマーレビュー ({comments.length})
                </h2>

                <div className="space-y-6">
                  {currentComments.map((comment, index) => (
                    <Card
                      key={index}
                      className="overflow-hidden border border-gray-200 transition-all hover:border-gray-300"
                    >
                      <CardContent className="p-6">
                        <div className="mb-2 flex items-center">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                            {comment.username
                              ? comment.username.charAt(0).toUpperCase()
                              : "U"}
                          </div>
                          <span className="ml-2 font-medium">
                            {comment.username || "User"}
                          </span>
                        </div>

                        <div className="mb-4 flex items-center justify-between">
                          <div className="flex items-center">
                            <RatingStars rating={comment.rating} />
                            <span className="ml-2 font-medium text-gray-700">
                              {comment.title}
                            </span>
                          </div>
                          <span className="text-sm text-gray-500">
                            {comment.date}
                          </span>
                        </div>

                        <p className="mb-2 leading-relaxed text-gray-700">
                          {comment.content}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* 分页导航 */}
                {totalPages > 1 && (
                  <div className="mt-8 flex justify-center">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() =>
                          handlePageChange(Math.max(1, currentPage - 1))
                        }
                        disabled={currentPage === 1}
                        className={`flex h-10 w-10 items-center justify-center rounded-md ${
                          currentPage === 1
                            ? "cursor-not-allowed bg-gray-100 text-gray-400"
                            : "bg-white text-gray-700 hover:bg-gray-100"
                        } border border-gray-300`}
                      >
                        前へ
                      </button>

                      {[...Array(totalPages)].map((_, i) => (
                        <button
                          key={i}
                          onClick={() => handlePageChange(i + 1)}
                          className={`flex h-10 w-10 items-center justify-center rounded-md ${
                            currentPage === i + 1
                              ? "bg-blue-600 text-white"
                              : "bg-white text-gray-700 hover:bg-gray-100"
                          } border border-gray-300`}
                        >
                          {i + 1}
                        </button>
                      ))}

                      <button
                        onClick={() =>
                          handlePageChange(
                            Math.min(totalPages, currentPage + 1),
                          )
                        }
                        disabled={currentPage === totalPages}
                        className={`flex h-10 w-10 items-center justify-center rounded-md ${
                          currentPage === totalPages
                            ? "cursor-not-allowed bg-gray-100 text-gray-400"
                            : "bg-white text-gray-700 hover:bg-gray-100"
                        } border border-gray-300`}
                      >
                        次へ
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* 添加底部间距 */}
              <div className="h-16"></div>
            </>
          )}
        </div>
      </div>

      {/* 图片放大模态窗口 */}
      {imageModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80 p-4">
          <div className="relative max-h-[90vh] max-w-[90vw]">
            <button
              onClick={() => setImageModalOpen(false)}
              className="absolute -right-4 -top-4 rounded-full bg-white p-2 text-gray-800 shadow-md hover:bg-gray-100"
            >
              <X className="h-6 w-6" />
            </button>
            <div className="overflow-hidden rounded-lg bg-white p-2">
              <Image
                src="/images/headphone.jpg"
                alt="Wireless Headset"
                width={1200}
                height={1200}
                className="h-auto max-h-[80vh] w-auto"
              />
            </div>
          </div>
        </div>
      )}

      <Toast
        show={showToast}
        onClose={() => setShowToast(false)}
        message={toastMessage}
      />
    </AssistantSidebar>
  );
}
