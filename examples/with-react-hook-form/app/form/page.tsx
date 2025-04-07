
"use client";

import { SignupForm } from "./SignupForm";
import { AssistantSidebar } from "@/components/ui/assistant-ui/assistant-sidebar";
import { Form } from "@/components/ui/form";
import { useAssistantInstructions } from "@assistant-ui/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useAssistantTools } from "../../lib/useAssistantTools";
import { useFormTools } from "../../lib/useFormTools";
import { useEventListeners } from "../../lib/eventListeners";
import { useState } from "react";

export default function FormPage() {
  const [isSubmitted, setIsSubmitted] = useState(false);

  useAssistantInstructions(
    "Help the user complete the order shipping information form.",
  );

  // 使用分离的工具 - 表单工具单独处理
  const form = useFormTools(
    {
      firstName: "John",
      lastName: "Doe",
      email: "john.doe@example.com",
      phone: "+1 (555) 123-4567",
      address: "123 Main Street, Apt 4B",
      city: "New York",
      postalCode: "10001",
      note: "Please deliver in the afternoon if possible",
    },
    setIsSubmitted,
  );

  // 电商相关工具
  useAssistantTools();

  useEventListeners([], undefined);

  return (
    <AssistantSidebar>
      <div className="h-full overflow-y-scroll">
        <main className="container py-8">
          <div className="mb-8 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/cart">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </Link>
              <div>
                <h1 className="mb-2 text-2xl font-semibold">填写配送信息</h1>
              </div>
            </div>
          </div>

          <Form {...form}>
            <SignupForm
              isSubmitted={isSubmitted}
              setIsSubmitted={setIsSubmitted}
            />
          </Form>
        </main>
      </div>
    </AssistantSidebar>
  );
}


