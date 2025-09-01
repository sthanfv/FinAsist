"use client";

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function BackButton() {
  return (
    <Button variant="outline" size="icon" asChild>
      <Link href="/dashboard">
        <ArrowLeft className="h-4 w-4" />
        <span className="sr-only">Volver al Dashboard</span>
      </Link>
    </Button>
  );
}
