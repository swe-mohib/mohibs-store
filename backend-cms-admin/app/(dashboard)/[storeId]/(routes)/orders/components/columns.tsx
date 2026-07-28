"use client";

import { ColumnDef } from "@tanstack/react-table";

export type OrderColumn = {
  id: string;
  razorpay_order_id: string;
  razorpay_payment_id: string;
  isPaid: boolean;
  totalPrice: string;
  products: string;
  createdAt: string;
};

export const columns: ColumnDef<OrderColumn>[] = [
  {
    accessorKey: "products",
    header: "Product",
  },
  {
    accessorKey: "totalPrice",
    header: "Total Price",
  },
  {
    accessorKey: "isPaid",
    header: "Paid",
  },
  {
    accessorKey: "razorpay_order_id",
    header: "Order Id",
  },
  {
    accessorKey: "razorpay_payment_id",
    header: "Payment Id",
  },
  {
    accessorKey: "createdAt",
    header: "Created At",
  },
];
