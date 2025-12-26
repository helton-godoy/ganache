"use client";

import {
  useConfigureCluster,
  useGetClusterStatus,
} from "@/api/generated/default/default";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ArrowRight, CheckCircle2, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { TwinViewTopology } from "./TwinViewTopology";

export function ClusterJoinWizard() {
  const [step, setStep] = useState(1);
  const [peerIp, setPeerIp] = useState("");

  // Always fetch status to check if already configured
  const { data: axiosResponse } = useGetClusterStatus({
    query: {
      refetchInterval: 2000,
    },
  });

  const status = axiosResponse?.data;

  useEffect(() => {
    if (
      status?.state &&
      ["syncing", "ready", "failover"].includes(status.state)
    ) {
      if (step !== 3) setStep(3);
    }
  }, [status?.state, step]);

  const joinMutation = useConfigureCluster({
    mutation: {
      onSuccess: (axiosRes) => {
        setStep(3);
        toast.success("Cluster Linked Successfully", {
          description: axiosRes.data.message,
        });
      },
      onError: (err: any) => {
        toast.error("Cluster Join Failed", {
          description: err.response?.data?.message || err.message,
        });
      },
    },
  });

  const handleJoin = () => {
    if (!peerIp) {
      toast.error("Peer IP is required");
      return;
    }
    setStep(2);
    joinMutation.mutate({
      data: {
        mode: "compatibility",
        node_id: 1,
        peer_ip: peerIp,
        network_interface: "eth0",
        vip_address: "",
      },
    });
  };

  return (
    <Card className="w-full max-w-4xl mx-auto border-none shadow-none bg-transparent">
      <CardHeader className="text-center">
        <CardTitle className="text-3xl font-extrabold tracking-tight">
          Twin-Node Cluster Setup
        </CardTitle>
        <CardDescription className="text-lg">
          Initialize the high-availability link between your primary and
          secondary nodes.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {step === 1 && (
          <div className="space-y-6 max-w-md mx-auto pt-8">
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none">
                Secondary Node IP Address
              </label>
              <Input
                placeholder="e.g. 10.0.0.2"
                value={peerIp}
                onChange={(e) => setPeerIp(e.target.value)}
                className="text-lg py-6"
              />
              <p className="text-xs text-muted-foreground">
                Ensure the secondary node is powered on and accessible via the
                management network.
              </p>
            </div>
            <Button
              className="w-full py-6 text-lg font-bold bg-emerald-600 hover:bg-emerald-700 transition-colors"
              onClick={handleJoin}
              disabled={joinMutation.isPending}
            >
              {joinMutation.isPending ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                <ArrowRight className="mr-2 h-5 w-5" />
              )}
              Connect to Peer Node
            </Button>
          </div>
        )}

        {(step === 2 || step === 3) && (
          <TwinViewTopology
            state={step === 2 ? "configuring" : status?.state || "syncing"}
            progress={status?.progress || 0.1}
          />
        )}
      </CardContent>
      {step === 3 && (
        <CardFooter className="flex justify-center flex-col space-y-4">
          <div className="flex items-center gap-2 text-emerald-600 font-medium">
            <CheckCircle2 className="h-5 w-5" />
            Reproduction link established. Blocks are being mirrored.
          </div>
          <Button
            variant="outline"
            onClick={() => (window.location.href = "/")}
          >
            Go to Dashboard
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
