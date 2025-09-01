"use client";

import { Card, CardContent } from "@/components/ui/card";

export const TransactionLoader = () => (
  <div className="space-y-3">
    {Array.from({ length: 5 }).map((_, i) => (
      <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 bg-muted animate-pulse rounded-full" />
          <div className="space-y-2">
            <div className="h-4 w-32 bg-muted animate-pulse rounded" />
            <div className="h-3 w-20 bg-muted animate-pulse rounded" />
          </div>
        </div>
        <div className="h-6 w-16 bg-muted animate-pulse rounded" />
      </div>
    ))}
  </div>
);
export const DashboardLoader = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 p-4">
    {Array.from({ length: 4 }).map((_, i) => (
      <Card key={i}>
        <CardContent className="p-6">
          <div className="h-8 w-24 bg-muted animate-pulse rounded mb-2" />
          <div className="h-12 w-20 bg-muted animate-pulse rounded" />
        </CardContent>
      </Card>
    ))}
  </div>
);
