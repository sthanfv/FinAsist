
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
import { Goal } from "@/store/useAppStore";

const formSchema = z.object({
  name: z.string().min(1, "El título es requerido."),
  targetAmount: z.coerce.number().positive("El monto objetivo debe ser positivo."),
  deadline: z.string().min(1, "La fecha límite es requerida."),
});

type EditGoalFormProps = {
  goal: Goal;
  onUpdate: (data: Partial<Goal>) => void;
};

export default function EditGoalForm({ goal, onUpdate }: EditGoalFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: goal.name,
      targetAmount: goal.targetAmount,
      deadline: goal.deadline,
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    // Solo enviar los valores que han cambiado
    const changedValues: Partial<Goal> = {};
    if (values.name !== goal.name) changedValues.name = values.name;
    if (values.targetAmount !== goal.targetAmount) changedValues.targetAmount = values.targetAmount;
    if (values.deadline !== goal.deadline) changedValues.deadline = values.deadline;

    if (Object.keys(changedValues).length > 0) {
        onUpdate(changedValues);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Título de la meta</FormLabel>
                <FormControl>
                    <Input {...field} />
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
        <Button type="submit">Actualizar Meta</Button>
      </form>
    </Form>
  );
}
