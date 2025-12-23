"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { cn, formatDate, formatDuration } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import type { Session } from "@/types";
import {
  Calendar,
  Clock,
  User,
  Stethoscope,
  CheckCircle2,
  FileSignature,
  AlertTriangle,
  Loader2,
} from "lucide-react";

interface SessionHeaderProps {
  session: Session;
  needsConfirmationCount: number;
  onSignNote: () => Promise<void>;
}

export function SessionHeader({
  session,
  needsConfirmationCount,
  onSignNote,
}: SessionHeaderProps) {
  const [isSignDialogOpen, setIsSignDialogOpen] = useState(false);
  const [isSigning, setIsSigning] = useState(false);
  const [signError, setSignError] = useState<string | null>(null);

  const isSigned = session.status === "signed";

  const handleSign = async () => {
    setIsSigning(true);
    setSignError(null);

    try {
      await onSignNote();
      setIsSignDialogOpen(false);
    } catch (error) {
      setSignError(
        error instanceof Error ? error.message : "Failed to sign note"
      );
    } finally {
      setIsSigning(false);
    }
  };

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="border-b border-border/50 bg-gradient-to-r from-slate-50 via-white to-indigo-50/30"
    >
      <div className="px-6 py-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          {/* Left side - Session info */}
          <div className="space-y-3">
            {/* Title row */}
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                Session Notes
              </h1>
              {isSigned ? (
                <Badge variant="success" className="gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Signed
                </Badge>
              ) : (
                <Badge variant="secondary" className="gap-1.5">
                  <FileSignature className="h-3.5 w-3.5" />
                  Draft
                </Badge>
              )}
            </div>

            {/* Meta info */}
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <User className="h-4 w-4" />
                <span className="font-medium text-foreground">
                  {session.patientName}
                </span>
              </span>
              <span className="flex items-center gap-1.5">
                <Stethoscope className="h-4 w-4" />
                {session.clinicianName}
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                {formatDate(session.sessionDate)}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="h-4 w-4" />
                {formatDuration(session.duration)}
              </span>
            </div>
          </div>

          {/* Right side - Actions */}
          <div className="flex items-center gap-3">
            {needsConfirmationCount > 0 && !isSigned && (
              <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                <span className="text-sm font-medium text-amber-800">
                  {needsConfirmationCount} item
                  {needsConfirmationCount > 1 ? "s" : ""} need review
                </span>
              </div>
            )}

            <AlertDialog
              open={isSignDialogOpen}
              onOpenChange={setIsSignDialogOpen}
            >
              <AlertDialogTrigger asChild>
                <Button
                  variant={isSigned ? "secondary" : "success"}
                  size="lg"
                  disabled={isSigned}
                  className={cn(
                    "gap-2 shadow-md",
                    !isSigned && "hover:shadow-lg"
                  )}
                >
                  {isSigned ? (
                    <>
                      <CheckCircle2 className="h-4 w-4" />
                      Note Signed
                    </>
                  ) : (
                    <>
                      <FileSignature className="h-4 w-4" />
                      Sign Note
                    </>
                  )}
                </Button>
              </AlertDialogTrigger>

              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle className="flex items-center gap-2">
                    <FileSignature className="h-5 w-5 text-primary" />
                    Sign Clinical Note
                  </AlertDialogTitle>
                  <AlertDialogDescription className="space-y-3">
                    <p>
                      You are about to sign the clinical note for{" "}
                      <strong>{session.patientName}</strong>&apos;s session on{" "}
                      {formatDate(session.sessionDate)}.
                    </p>

                    {needsConfirmationCount > 0 && (
                      <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3">
                        <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-600" />
                        <p className="text-sm text-amber-800">
                          <strong>Warning:</strong> This note has{" "}
                          {needsConfirmationCount} claim
                          {needsConfirmationCount > 1 ? "s" : ""} without
                          supporting evidence. Please review before signing.
                        </p>
                      </div>
                    )}

                    <p className="text-sm">
                      By signing, you confirm that you have reviewed the note
                      and verify its accuracy. This action cannot be undone.
                    </p>

                    {signError && (
                      <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3">
                        <p className="text-sm text-destructive">{signError}</p>
                      </div>
                    )}
                  </AlertDialogDescription>
                </AlertDialogHeader>

                <AlertDialogFooter>
                  <AlertDialogCancel disabled={isSigning}>
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={(e) => {
                      e.preventDefault();
                      handleSign();
                    }}
                    disabled={isSigning}
                    className={cn(
                      "bg-emerald-600 hover:bg-emerald-700",
                      isSigning && "opacity-70"
                    )}
                  >
                    {isSigning ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Signing...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        Confirm & Sign
                      </>
                    )}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </div>

      {/* Signed timestamp */}
      {isSigned && session.signedAt && (
        <div className="border-t border-emerald-200 bg-emerald-50/50 px-6 py-2">
          <p className="text-sm text-emerald-700">
            <CheckCircle2 className="mr-1.5 inline-block h-4 w-4" />
            Signed by {session.clinicianName} on{" "}
            {new Date(session.signedAt).toLocaleString()}
          </p>
        </div>
      )}
    </motion.header>
  );
}
