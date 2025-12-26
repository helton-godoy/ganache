"use client";

import { useRollbackConfig } from "@/api/generated/default/default";
import { GitCommit } from "@/api/generated/model/gitCommit";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { RotateCcw } from "lucide-react";
import { useState } from "react";

/**
 * RollbackButton Component
 *
 * @ref Story-3.3 - Implements one-click config rollback UI
 */
interface RollbackButtonProps {
  commit: GitCommit;
  onSuccess?: () => void;
}

export function RollbackButton({ commit, onSuccess }: RollbackButtonProps) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const { toast } = useToast();

  const { mutate: rollback, isPending } = useRollbackConfig({
    mutation: {
      onSuccess: (data) => {
        toast({
          title: "Rollback Successful",
          description: data.data.message,
          variant: "default",
        });
        setOpen(false);
        setReason("");
        onSuccess?.();
      },
      onError: (error: any) => {
        toast({
          title: "Rollback Failed",
          description:
            error.response?.data ||
            error.message ||
            "Failed to rollback configuration",
          variant: "destructive",
        });
      },
    },
  });

  const handleRollback = () => {
    if (!reason.trim()) {
      toast({
        title: "Reason Required",
        description: "Please provide a reason for this rollback",
        variant: "destructive",
      });
      return;
    }

    rollback({
      data: {
        commit_id: commit.id,
        reason: reason.trim(),
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="border-orange-500/50 text-orange-400 hover:bg-orange-500/10 hover:text-orange-300 transition-colors"
        >
          <RotateCcw size={14} className="mr-2" />
          Rollback to this Point
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl bg-slate-950 border-slate-800 text-slate-100">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <RotateCcw size={20} className="text-orange-400" />
            Confirm Configuration Rollback
          </DialogTitle>
          <DialogDescription className="text-slate-400 text-base mt-2">
            You are about to rollback the configuration to commit{" "}
            <code className="bg-slate-900 px-2 py-0.5 rounded text-blue-400 font-mono text-sm">
              {commit.id.substring(0, 7)}
            </code>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-4 space-y-2">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-semibold text-sm text-slate-300">
                  Target Commit
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  Created by {commit.author}
                </p>
              </div>
              <code className="text-xs bg-slate-900 px-2 py-1 rounded border border-slate-800 text-blue-400">
                {commit.id.substring(0, 7)}
              </code>
            </div>
            <p className="text-sm text-slate-200">{commit.message}</p>
            <p className="text-xs text-slate-500">
              {new Date(commit.date).toLocaleString()}
            </p>
          </div>

          <div className="bg-orange-950/20 border border-orange-900/50 rounded-lg p-4">
            <h4 className="font-semibold text-sm text-orange-400 mb-2 flex items-center gap-2">
              ⚠️ Warning
            </h4>
            <ul className="text-xs text-slate-300 space-y-1 list-disc list-inside">
              <li>
                This will restore all configuration files to their state at the
                selected commit
              </li>
              <li>
                The current configuration will be preserved in a new "rollback
                commit"
              </li>
              <li>
                You may need to manually restart affected services after
                rollback
              </li>
            </ul>
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="reason"
              className="text-sm font-medium text-slate-300"
            >
              Reason for Rollback <span className="text-red-400">*</span>
            </Label>
            <Textarea
              id="reason"
              placeholder="e.g., Bad network configuration causing connectivity issues"
              value={reason}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setReason(e.target.value)
              }
              className="bg-slate-950/50 border-slate-800 text-slate-200 placeholder:text-slate-600 min-h-[80px]"
              disabled={isPending}
            />
            <p className="text-xs text-slate-500">
              This will be logged in the audit trail for compliance and
              troubleshooting
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isPending}
            className="border-slate-800 hover:bg-slate-800"
          >
            Cancel
          </Button>
          <Button
            onClick={handleRollback}
            disabled={isPending || !reason.trim()}
            className="bg-orange-600 hover:bg-orange-500 text-white"
          >
            {isPending ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Rolling back...
              </>
            ) : (
              <>
                <RotateCcw size={14} className="mr-2" />
                Confirm Rollback
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
