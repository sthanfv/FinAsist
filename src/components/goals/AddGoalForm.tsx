"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Goal } from "./GoalsList";

const formSchema = z.object({
  title: z.string().min(1, "El título es requerido."),
  targetAmount: z.coerce.number().positive("El monto objetivo debe ser positivo."),
  savedAmount: z.coerce.number().min(0, "El monto ahorrado no puede ser negativo."),
  deadline: z.string().min(1, "La fecha límite es requerida."),
});

type AddGoalFormProps = {
  onAddGoal: (goal: Omit<Goal, 'id'>) => void;
};

export default function AddGoalForm({ onAddGoal }: AddGoalFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      targetAmount: 0,
      savedAmount: 0,
      deadline: new Date().toISOString().split('T')[0],
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    onAddGoal(values);
    form.reset();
  }

  return (
    <Card className="shadow-soft">
      <CardHeader>
        <CardTitle>Añadir Nueva Meta</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Título de la meta</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: Viaje a la playa" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="targetAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Monto Objetivo</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
                <FormField
                control={form.control}
                name="savedAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Monto Ahorrado Inicial</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="deadline"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fecha Límite</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <Button type="submit">Guardar Meta</Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
