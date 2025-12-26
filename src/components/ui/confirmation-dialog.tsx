"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { useState } from "react";

interface ConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: React.ReactNode;
  confirmKeyword?: string; // Default: "CONFIRM"
  onConfirm: () => void;
  triggerLabel?: string;
  variant?: "destructive" | "default";
}

export function ConfirmationDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmKeyword = "CONFIRM",
  onConfirm,
  variant = "destructive",
}: ConfirmationDialogProps) {
  const [inputValue, setInputValue] = useState("");

  const handleConfirm = () => {
    if (inputValue === confirmKeyword) {
      onConfirm();
      onOpenChange(false);
      setInputValue("");
    }
  };

  const isMatch = inputValue === confirmKeyword;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-4 text-sm text-muted-foreground">
              <div>{description}</div>
              <div className="bg-slate-100 p-3 rounded-md border border-slate-200">
                Type <strong>{confirmKeyword}</strong> below to proceed.
              </div>
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={confirmKeyword}
                className="font-mono"
              />
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => setInputValue("")}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={!isMatch}
            className={
              variant === "destructive"
                ? "bg-red-600 hover:bg-red-700 focus:ring-red-600"
                : ""
            }
          >
            Confirm Action
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
