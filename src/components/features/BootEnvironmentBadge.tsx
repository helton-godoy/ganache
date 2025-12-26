"use client";

import { Badge } from "@/components/ui/badge";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useGetBootEnvironments } from "@/api/generated/default/default";
import { History } from "lucide-react";
import { BootEnvironmentList } from "./BootEnvironmentList";

export function BootEnvironmentBadge() {
  const { data: axiosResponse } = useGetBootEnvironments({
    query: {
      refetchInterval: 30000,
    },
  });

  const bes = axiosResponse?.data;
  const currentBE = bes?.find((be) => be.active.includes("N"));

  if (!currentBE) return null;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="outline-none">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge
                  variant="outline"
                  className="gap-2 bg-emerald-50 text-emerald-700 border-emerald-200 cursor-pointer hover:bg-emerald-100 transition-colors"
                >
                  <History className="w-3 h-3" />
                  <span>Booted from: {currentBE.name}</span>
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <div className="space-y-1">
                  <p className="font-semibold text-sm">
                    Active Boot Environment
                  </p>
                  <div className="text-xs text-muted-foreground flex flex-col gap-0.5">
                    <span>Created: {currentBE.created}</span>
                    <span>Space Used: {currentBE.space}</span>
                    <span>Active Flags: {currentBE.active}</span>
                    <span className="text-emerald-600 font-medium mt-1">
                      Click to Manage
                    </span>
                  </div>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </button>
      </DialogTrigger>
      <BootEnvironmentList />
    </Dialog>
  );
}
