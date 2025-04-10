import {
  useAssistantRuntime,
  useAssistantToolUI,
  Tool,
  ModelContext,
} from "@assistant-ui/react";
import { useEffect, useState } from "react";
import { useCartStore } from "@/lib/store";
import Image from "next/image";
import { Loader2 } from "lucide-react";

// 定义加载状态类型
type LoadingStatus = {
  toolName: string;
  isLoading: boolean;
  question?: string;
  instanceId?: string; // 添加实例ID用于区分不同问题
};

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
  const { items } = useCartStore();
  const totalPrice = items.reduce(
    (sum, item) =>
      sum + parseFloat(item.price.replace("¥", "")) * item.quantity,
    0,
  );

  if (items.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 p-4">
        <p className="text-center text-gray-500">Your cart is empty</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-gray-200 p-4">
      <h3 className="mb-3 font-medium text-purple-600">Cart Items:</h3>
      <div className="max-h-96 space-y-4 overflow-y-auto">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex items-center gap-6 rounded-md border border-gray-100 bg-white/50 p-3"
          >
            <div className="relative mr-2 h-20 w-20 flex-shrink-0 overflow-hidden rounded-md border border-gray-200 shadow-sm">
              <Image
                src={item.image}
                alt={item.name}
                width={80}
                height={80}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="min-w-0 flex-1 px-2">
              <p className="mb-3 truncate text-base font-medium">{item.name}</p>
              <div className="flex flex-col space-y-2">
                <p className="text-sm text-gray-500">
                  {item.price} × {item.quantity}
                </p>
                <p className="text-sm font-semibold text-purple-700">
                  小计: ¥
                  {(
                    parseFloat(item.price.replace("¥", "")) * item.quantity
                  ).toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 flex justify-between border-t border-gray-100 pt-3">
        <p className="font-medium">Total:</p>
        <p className="font-bold text-purple-600">¥{totalPrice.toFixed(2)}</p>
      </div>
    </div>
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
  // 添加加载状态
  const [loadingStatuses, setLoadingStatuses] = useState<LoadingStatus[]>([]);

  // 将CSV解析逻辑抽取为独立函数
  const fetchHeadphoneReviews = async (): Promise<string> => {
    try {
      const commentsResponse = await fetch("/comments/headset-comments.csv");
      if (!commentsResponse.ok) {
        throw new Error("Failed to load headphone comments");
      }

      const csvText = await commentsResponse.text();

      // 解析CSV文本获取评论内容
      const rows = csvText.split("\n");
      const comments = [];

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

        // 找到评论内容的列索引 (a-size-base 3)
        const contentIndex = headers.indexOf("a-size-base 3");

        // 从第二行开始解析数据行，获取评论内容
        for (let i = 1; i < rows.length; i++) {
          const row = rows[i] || "";
          if (!row.trim()) continue;

          const values = parseCSVRow(row);

          // 如果行解析结果不为空且包含足够的值
          if (
            values.length > 0 &&
            contentIndex >= 0 &&
            contentIndex < values.length
          ) {
            const content = values[contentIndex];
            if (content && content.trim()) {
              comments.push(content.trim());
            }
          }
        }
      }

      // 将评论内容拼接成文本
      return comments.join("\n");
    } catch (error) {
      console.error("Error fetching headphone reviews:", error);
      return "无法获取耳机评论数据。";
    }
  };

  // 辅助函数：检测问题语言
  const detectLanguage = (text: string): string => {
    // 简单检测语言类型
    const chineseRegex = /[\u4e00-\u9fa5]/;
    const japaneseRegex = /[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff]/;
    const englishRegex = /^[a-zA-Z0-9\s.,?!;:()'"-]+$/;

    if (chineseRegex.test(text)) {
      return "Chinese";
    } else if (japaneseRegex.test(text) && !chineseRegex.test(text)) {
      return "Japanese";
    } else if (englishRegex.test(text)) {
      return "English";
    }

    // 默认返回英语
    return "English";
  };

  useEffect(() => {
    const toolsConfig = {
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
          "Execute this tool when user wants to process their order, proceed to checkout, or fill shipping information. Examples: 'process my order', 'proceed to checkout', 'complete my purchase', 'I want to order these items', 'fill shipping information'. This will navigate the user to the form page where they can fill shipping information.",
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
      headphone_question: {
        description:
          "Execute this tool when user asks questions about the wireless headphones product (ID: 1). This will search through customer reviews and provide relevant information. IMPORTANT: You MUST answer in the SAME language as the question. If the question is in Chinese, answer in Chinese. If the question is in English, answer in English. If the question is in Japanese, answer in Japanese.",
        parameters: {
          type: "object",
          properties: {
            question: {
              type: "string",
              description: "The user's question about headphones",
            },
          },
          required: ["question"],
        },
        execute: async (args: { question: string }) => {
          console.log("Headphone question started:", args.question);
          console.log("Loading status: started");

          // 生成唯一实例ID
          const instanceId = Date.now().toString();
          console.log("Generated instanceId:", instanceId);

          // 添加新的加载状态
          setLoadingStatuses((prev) => {
            const newState = [
              ...prev,
              {
                toolName: "headphone_question",
                isLoading: true,
                question: args.question,
                instanceId,
              },
            ];
            console.log("Updated loading statuses:", newState);
            return newState;
          });

          // 这一行很重要：等待一小段时间让React渲染更新加载状态
          await new Promise((resolve) => setTimeout(resolve, 100));

          try {
            // 调用独立函数获取评论数据
            const headphoneReviews = await fetchHeadphoneReviews();
            console.log(
              "Headphone reviews loaded, length:",
              headphoneReviews.length,
            );
            console.log("Loading status: fetching reviews completed");

            // 检测问题的语言
            const questionLanguage = detectLanguage(args.question);
            console.log("Detected question language:", questionLanguage);

            // 创建特定语言的指令
            const langInstructions = {
              Chinese: "请用中文回答以下关于耳机的问题",
              English:
                "Please answer the following headphone question in English",
              Japanese:
                "以下のヘッドフォンについての質問を日本語で答えてください",
            };

            console.log(
              `${langInstructions[questionLanguage as keyof typeof langInstructions]}: "${args.question}" based on these customer reviews:`,
            );
            // 直接调用OpenAI API
            console.log("Loading status: calling OpenAI API");
            const response = await fetch(
              "https://api.openai.com/v1/chat/completions",
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${process.env["NEXT_PUBLIC_OPENAI_API_KEY"]}`,
                },
                body: JSON.stringify({
                  model: "gpt-3.5-turbo",
                  messages: [
                    {
                      role: "system",
                      content: `You are a helpful shopping assistant that helps customers understand product information based on customer reviews. 
                        
IMPORTANT INSTRUCTIONS:
1. You MUST answer in the SAME language as the question. ${langInstructions[questionLanguage as keyof typeof langInstructions]}
2. When answering, QUOTE ACTUAL USER COMMENTS and provide EXACT NUMERICAL counts, such as "7 users mentioned that the headphones hurt their ears after prolonged use".
3. DO NOT use vague statistical language like "majority of users", "several users", "a few users". ALWAYS use EXACT NUMBERS (e.g., "8 users", "3 users", "1 user").
4. Structure your answer clearly with bullet points if needed.
5. Be honest about both positive and negative aspects mentioned in the reviews.
6. Count each distinct user comment separately when calculating statistics.`,
                    },
                    {
                      role: "user",
                      content: `${langInstructions[questionLanguage as keyof typeof langInstructions]}: "${args.question}" 
                      
Based on these customer reviews, please analyze and respond with:
1. SPECIFIC QUOTES from actual users
2. EXACT NUMBER of users who mentioned each aspect (e.g., "7 users mentioned sound quality")
3. DO NOT use vague terms like "several", "many", "a few" - only use precise numbers

Customer reviews:
${headphoneReviews}`,
                    },
                  ],
                  temperature: 0,
                }),
              },
            );

            if (!response.ok) {
              console.log(
                "Loading status: API error",
                response.status,
                response.statusText,
              );
              // 更新加载状态为false
              setLoadingStatuses((prev) =>
                prev.map((status) =>
                  status.instanceId === instanceId
                    ? { ...status, isLoading: false }
                    : status,
                ),
              );
              throw new Error(`API error: ${response.statusText}`);
            }

            console.log("Loading status: parsing response");
            // 解析服务器响应
            const data = await response.json();
            // 处理不同格式的响应
            const answer =
              data.choices?.[0]?.message?.content ||
              data.text ||
              "无法获取关于耳机的信息。";

            console.log("Loading status: completed");
            // 更新加载状态为false
            setLoadingStatuses((prev) =>
              prev.map((status) =>
                status.instanceId === instanceId
                  ? { ...status, isLoading: false }
                  : status,
              ),
            );

            return {
              success: true,
              answer,
              instanceId, // 返回实例ID以便UI组件可以匹配
            };
          } catch (error) {
            console.error("Loading status: error", error);
            console.error("Error processing headphone question:", error);
            // 更新加载状态为false
            setLoadingStatuses((prev) =>
              prev.map((status) =>
                status.instanceId === instanceId
                  ? { ...status, isLoading: false }
                  : status,
              ),
            );

            return {
              success: false,
              error:
                "Failed to process your question about headphones. Please try again.",
              instanceId, // 返回实例ID以便UI组件可以匹配
            };
          }
        },
      } as Tool<any, any>,
    };

    // Create system message
    const systemMessage = `Help users operate the product page. Available products:
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
When user wants to proceed with order or checkout, navigate to the form page where they can fill shipping information.`;

    const value: ModelContext = {
      system: systemMessage,
      tools: toolsConfig,
    };

    return assistantRuntime.registerModelContextProvider({
      getModelContext: () => value,
    });
  }, [assistantRuntime, items]);

  // Register common tool UIs
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

  useAssistantToolUI({
    toolName: "headphone_question",
    render: (props: any) => {
      console.log("HeadphoneQuestionTool render props:", props);

      // 首次渲染时，检查是否有活跃的加载状态
      const hasActiveLoading = loadingStatuses.some(
        (status) => status.isLoading,
      );
      console.log("Has active loading statuses:", hasActiveLoading);

      // 检查是否有结果
      const hasResult = !!props.result?.answer;
      console.log("Has result:", hasResult);

      // 如果组件处于running状态或全局有任何加载中的headphone问题，显示加载状态
      if (
        props.status?.type === "running" ||
        (!hasResult && hasActiveLoading)
      ) {
        console.log("Showing loading UI");
        return (
          <div className="my-2 rounded-lg bg-blue-50 p-4">
            <div className="flex flex-col items-center justify-center py-6">
              <Loader2
                className="mb-4 h-16 w-16 animate-spin text-purple-600"
                strokeWidth={2}
              />
              <p className="text-gray-600">分析中...</p>
            </div>
          </div>
        );
      }

      // 确保我们有结果才显示结果组件
      if (hasResult) {
        return null;
      }

      return null;
    },
  });
};
