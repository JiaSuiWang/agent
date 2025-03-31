"use client";
import { Button } from "@/components/ui/button";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { type FC, useState } from "react";
import { useFormContext } from "react-hook-form";
import { submitSignup } from "../lib/submitSignup";
import Link from "next/link";
import { CheckCircle2, AlertCircle } from "lucide-react";

export const SignupForm: FC = () => {
  const form = useFormContext();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (values: object) => {
    try {
      setIsSubmitting(true);
      setError(null);
      await submitSignup(values);
      setIsSubmitted(true);
    } catch (error) {
      console.error("提交失败:", error);
      setError(error instanceof Error ? error.message : "提交失败，请重试");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitting)
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <p className="text-lg font-semibold text-green-600">正在提交...</p>
      </div>
    );

  if (error)
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <AlertCircle className="mb-4 h-16 w-16 text-red-500" />
        <h2 className="mb-2 text-2xl font-bold text-red-600">提交失败</h2>
        <p className="mb-6 text-gray-600">{error}</p>
        <Button onClick={() => setError(null)}>重试</Button>
      </div>
    );

  if (isSubmitted)
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <CheckCircle2 className="mb-4 h-16 w-16 text-green-500" />
        <h2 className="mb-2 text-2xl font-bold text-green-600">
          订单提交成功！
        </h2>
        <p className="mb-6 text-gray-600">感谢您的购买，我们会尽快为您发货。</p>
        <Link href="/products">
          <Button>继续购物</Button>
        </Link>
      </div>
    );

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <input type="hidden" {...form.register("hidden")} />

      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="firstName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>名字</FormLabel>
              <FormDescription>请输入您的名字</FormDescription>
              <FormControl>
                <Input placeholder="名字" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="lastName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>姓氏</FormLabel>
              <FormDescription>请输入您的姓氏</FormDescription>
              <FormControl>
                <Input placeholder="姓氏" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>邮箱</FormLabel>
              <FormDescription>用于接收订单通知</FormDescription>
              <FormControl>
                <Input placeholder="邮箱" type="email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>手机号码</FormLabel>
              <FormDescription>用于接收配送通知</FormDescription>
              <FormControl>
                <Input placeholder="手机号码" type="tel" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="address"
        render={({ field }) => (
          <FormItem>
            <FormLabel>详细地址</FormLabel>
            <FormDescription>请输入您的详细收货地址</FormDescription>
            <FormControl>
              <Input placeholder="例如：北京市朝阳区xxx街道xxx号" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="city"
          render={({ field }) => (
            <FormItem>
              <FormLabel>城市</FormLabel>
              <FormDescription>请输入您所在的城市</FormDescription>
              <FormControl>
                <Input placeholder="城市" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="postalCode"
          render={({ field }) => (
            <FormItem>
              <FormLabel>邮政编码</FormLabel>
              <FormDescription>请输入邮政编码</FormDescription>
              <FormControl>
                <Input placeholder="邮政编码" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="note"
        render={({ field }) => (
          <FormItem>
            <FormLabel>备注</FormLabel>
            <FormDescription>其他需要说明的信息（选填）</FormDescription>
            <FormControl>
              <Input placeholder="例如：请在工作时间配送" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <Button type="submit" className="w-full">
        提交订单
      </Button>
    </form>
  );
};
