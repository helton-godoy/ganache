"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  useGetBootEnvironments,
  useActivateBootEnvironment,
} from "@/api/generated/default/default";
import { Check, Loader2, Power } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { getGetBootEnvironmentsQueryKey } from "@/api/generated/default/default";

export function BootEnvironmentList() {
  const queryClient = useQueryClient();

  const { data: axiosResponse, isLoading } = useGetBootEnvironments({
    query: {
      refetchOnMount: true,
      refetchOnWindowFocus: true,
    },
  });

  const bes = axiosResponse?.data;

  const activateMutation = useActivateBootEnvironment({
    mutation: {
      onSuccess: (axiosRes) => {
        toast.success("Boot Environment Activated", {
          description: axiosRes.data,
        });
        // Invalidate query to refresh list
        void queryClient.invalidateQueries({
          queryKey: getGetBootEnvironmentsQueryKey(),
        });
      },
      onError: (err: any) => {
        toast.error("Activation Failed", {
          description: err.response?.data?.message || err.message,
        });
      },
    },
  });

  const handleActivate = (name: string) => {
    activateMutation.mutate({ data: { name } });
  };

  return (
    <DialogContent className="sm:max-w-3xl">
      <DialogHeader>
        <DialogTitle>Boot Environments</DialogTitle>
        <DialogDescription>
          Manage ZFS Boot Environments. The active environment will be used on
          the next system boot.
        </DialogDescription>
      </DialogHeader>

      {isLoading ? (
        <div className="flex justify-center p-8">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Space</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bes?.map((be) => {
              const isNow = be.active.includes("N");
              const isReboot = be.active.includes("R");

              return (
                <TableRow key={be.name}>
                  <TableCell className="font-medium">
                    {be.name}
                    {isNow && (
                      <span className="ml-2 text-xs text-muted-foreground">
                        (Current)
                      </span>
                    )}
                  </TableCell>
                  <TableCell>{be.created}</TableCell>
                  <TableCell>{be.space}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {isNow && <Badge variant="secondary">Now</Badge>}
                      {isReboot && <Badge variant="default">Reboot</Badge>}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    {!isReboot && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleActivate(be.name)}
                        disabled={activateMutation.isPending}
                      >
                        {activateMutation.isPending ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Power className="w-4 h-4 mr-2" />
                        )}
                        Activate
                      </Button>
                    )}
                    {isReboot && (
                      <span className="text-sm text-muted-foreground flex items-center justify-end gap-1">
                        <Check className="w-4 h-4" /> Active
                      </span>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}
    </DialogContent>
  );
}
