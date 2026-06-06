"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/shared/form-field";
import { generatePrepTasks, togglePrepTask } from "@/lib/actions/prep";
import type { PrepTask } from "@/lib/supabase/types";
import { cn } from "@/lib/utils/cn";
import { ChefHat, RefreshCw, CheckCircle2, Circle, Loader2, PartyPopper } from "lucide-react";

type Props = { initialTasks: PrepTask[] };

export function PrepPageClient({ initialTasks }: Props) {
  const t = useTranslations("prep");
  const tCommon = useTranslations("common");

  const [generating, setGenerating] = useState(false);

  const totalTasks = initialTasks.length;
  const completedTasks = initialTasks.filter((t) => t.is_completed).length;
  const progressPct = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
  const allDone = totalTasks > 0 && completedTasks === totalTasks;

  async function handleGenerate() {
    setGenerating(true);
    await generatePrepTasks();
    setGenerating(false);
  }

  async function handleToggle(taskId: string, currentState: boolean) {
    await togglePrepTask(taskId, !currentState);
  }

  return (
    <div className="px-4 py-4 space-y-4">
      {/* Generate button */}
      <Button
        variant="primary"
        onClick={handleGenerate}
        disabled={generating}
        className="w-full flex items-center justify-center gap-2"
      >
        {generating ? <Loader2 size={20} className="animate-spin" /> : <RefreshCw size={20} />}
        {t("generateList")}
      </Button>

      {/* Progress bar */}
      {totalTasks > 0 && (
        <div className="bg-[var(--card)] rounded-2xl border border-[var(--border)] p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold">{t("progress")}</span>
            <span className="text-sm text-[var(--muted-foreground)]">
              {completedTasks} / {totalTasks}
            </span>
          </div>
          <div className="w-full h-3 bg-[var(--muted)] rounded-full overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-500",
                allDone ? "bg-[var(--success)]" : "bg-[var(--primary)]"
              )}
              style={{ width: `${progressPct}%` }}
            />
          </div>
          {allDone && (
            <p className="text-center text-sm font-semibold text-[var(--success)] mt-2 flex items-center justify-center gap-1">
              <PartyPopper size={16} /> {t("allDone")}
            </p>
          )}
        </div>
      )}

      {/* Task list */}
      <div className="space-y-2">
        {initialTasks.map((task) => (
          <button
            key={task.id}
            onClick={() => handleToggle(task.id, task.is_completed)}
            className={cn(
              "w-full flex items-center gap-3 p-4 rounded-2xl border text-left transition-all touch-target-lg",
              task.is_completed
                ? "bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800"
                : "bg-[var(--card)] border-[var(--border)]"
            )}
          >
            {task.is_completed ? (
              <CheckCircle2 size={28} className="text-[var(--success)] flex-shrink-0" />
            ) : (
              <Circle size={28} className="text-[var(--muted-foreground)] flex-shrink-0" />
            )}
            <div className="flex-1 min-w-0">
              <p className={cn(
                "font-semibold text-base",
                task.is_completed && "line-through text-[var(--muted-foreground)]"
              )}>
                {task.item_name_es}
              </p>
            </div>
            <span className={cn(
              "text-2xl font-bold flex-shrink-0",
              task.is_completed ? "text-[var(--success)]" : "text-[var(--foreground)]"
            )}>
              x{task.total_quantity}
            </span>
          </button>
        ))}
      </div>

      {/* Empty state */}
      {totalTasks === 0 && (
        <div className="flex flex-col items-center justify-center py-16">
          <ChefHat size={48} className="text-[var(--muted-foreground)] mb-3" />
          <p className="text-[var(--muted-foreground)]">{t("noTasks")}</p>
          <p className="text-sm text-[var(--muted-foreground)] mt-1">
            Presiona &quot;{t("generateList")}&quot; para crear la lista desde los pedidos confirmados
          </p>
        </div>
      )}
    </div>
  );
}
