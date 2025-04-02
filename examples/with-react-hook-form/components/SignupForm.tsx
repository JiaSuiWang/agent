"use client";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { type FC, useState, useEffect } from "react";
import { useFormContext } from "react-hook-form";
import { submitSignup } from "../lib/submitSignup";
import Link from "next/link";
import { CheckCircle2, AlertCircle } from "lucide-react";
import { useCartStore } from "@/lib/store";

const SetFormFieldTool = () => {
  return (
    <p className="text-center font-mono text-sm font-bold text-blue-500">
      set_form_field(...)
      {/* set_form_field(hello) */}
    </p>
  );
};

const SubmitFormTool = () => {
  return (
    <p className="text-center font-mono text-sm font-bold text-blue-500">
      submit_form(...)
    </p>
  );
};

export const SignupForm: FC = () => {
  const form = useFormContext();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { clearCart } = useCartStore();

  const onSubmit = async (values: object) => {
    try {
      setIsSubmitting(true);
      setError(null);
      await submitSignup(values);
      setIsSubmitted(true);
      clearCart(); // 清空购物车
    } catch (error) {
      console.error("Error submitting form:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Submission failed. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitting)
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <p className="text-lg font-semibold text-green-600">Submitting...</p>
      </div>
    );

  if (error)
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <AlertCircle className="mb-4 h-16 w-16 text-red-500" />
        <h2 className="mb-2 text-2xl font-bold text-red-600">
          Submission Failed
        </h2>
        <p className="mb-6 text-gray-600">{error}</p>
        <Button onClick={() => setError(null)}>Try Again</Button>
      </div>
    );

  if (isSubmitted)
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <CheckCircle2 className="mb-4 h-16 w-16 text-green-500" />
        <h2 className="mb-2 text-2xl font-bold text-green-600">
          Order Submitted Successfully!
        </h2>
        <p className="mb-6 text-gray-600">
          Thank you for your order. We will contact you shortly.
        </p>
        <Link href="/products">
          <Button>Continue Shopping</Button>
        </Link>
      </div>
    );

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <input type="hidden" {...form.register("hidden")} />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>First Name *</FormLabel>
                <FormDescription>Enter your first name</FormDescription>
                <FormControl>
                  <Input placeholder="John" {...field} />
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
                <FormLabel>Last Name *</FormLabel>
                <FormDescription>Enter your last name</FormDescription>
                <FormControl>
                  <Input placeholder="Doe" {...field} />
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
                <FormLabel>Email *</FormLabel>
                <FormDescription>For order notifications</FormDescription>
                <FormControl>
                  <Input
                    placeholder="john.doe@example.com"
                    type="email"
                    {...field}
                  />
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
                <FormLabel>Phone Number *</FormLabel>
                <FormDescription>For delivery notifications</FormDescription>
                <FormControl>
                  <Input
                    placeholder="+1 (555) 000-0000"
                    type="tel"
                    {...field}
                  />
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
              <FormLabel>Address *</FormLabel>
              <FormDescription>Enter your delivery address</FormDescription>
              <FormControl>
                <Input placeholder="123 Main St" {...field} />
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
                <FormLabel>City *</FormLabel>
                <FormDescription>Enter your city</FormDescription>
                <FormControl>
                  <Input placeholder="New York" {...field} />
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
                <FormLabel>Postal Code *</FormLabel>
                <FormDescription>Enter your postal code</FormDescription>
                <FormControl>
                  <Input placeholder="10001" {...field} />
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
              <FormLabel>Note (Optional)</FormLabel>
              <FormDescription>
                Any special instructions for delivery?
              </FormDescription>
              <FormControl>
                <Input
                  placeholder="e.g., Please deliver during business hours"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full">
          Submit Order
        </Button>
      </form>
    </Form>
  );
};
