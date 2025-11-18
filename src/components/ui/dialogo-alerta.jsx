import * as React from "react";
import * as AlertDialogPrimitive from "@radix-ui/react-alert-dialog";

import { cn } from "@/lib/utils";
import { variantesBotao } from "@/components/ui/botao";

const DialogoAlerta = AlertDialogPrimitive.Root;

const GatilhoDialogoAlerta = AlertDialogPrimitive.Trigger;

const PortalDialogoAlerta = AlertDialogPrimitive.Portal;

const SobreposicaoDialogoAlerta = React.forwardRef(
  ({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Overlay
    className={cn(
      "fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className,
    )}
    {...props}
    ref={ref}
  />
));
SobreposicaoDialogoAlerta.displayName = AlertDialogPrimitive.Overlay.displayName;

const ConteudoDialogoAlerta = React.forwardRef(
  ({ className, ...props }, ref) => (
  <PortalDialogoAlerta>
    <SobreposicaoDialogoAlerta />
    <AlertDialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg",
        className,
      )}
      {...props}
    />
  </PortalDialogoAlerta>
));
ConteudoDialogoAlerta.displayName = AlertDialogPrimitive.Content.displayName;

const CabecalhoDialogoAlerta = ({ className, ...props }) => (
  <div className={cn("flex flex-col space-y-2 text-center sm:text-left", className)} {...props} />
);
CabecalhoDialogoAlerta.displayName = "CabecalhoDialogoAlerta";

const RodapeDialogoAlerta = ({ className, ...props }) => (
  <div className={cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className)} {...props} />
);
RodapeDialogoAlerta.displayName = "RodapeDialogoAlerta";

const TituloDialogoAlerta = React.forwardRef(
  ({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Title ref={ref} className={cn("text-lg font-semibold", className)} {...props} />
));
TituloDialogoAlerta.displayName = AlertDialogPrimitive.Title.displayName;

const DescricaoDialogoAlerta = React.forwardRef(
  ({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Description ref={ref} className={cn("text-sm text-muted-foreground", className)} {...props} />
));
DescricaoDialogoAlerta.displayName = AlertDialogPrimitive.Description.displayName;

const AcaoDialogoAlerta = React.forwardRef(
  ({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Action ref={ref} className={cn(variantesBotao(), className)} {...props} />
));
AcaoDialogoAlerta.displayName = AlertDialogPrimitive.Action.displayName;

const CancelarDialogoAlerta = React.forwardRef(
  ({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Cancel
    ref={ref}
    className={cn(variantesBotao({ variant: "outline" }), "mt-2 sm:mt-0", className)}
    {...props}
  />
));
CancelarDialogoAlerta.displayName = AlertDialogPrimitive.Cancel.displayName;

export {
  DialogoAlerta,
  PortalDialogoAlerta,
  SobreposicaoDialogoAlerta,
  GatilhoDialogoAlerta,
  ConteudoDialogoAlerta,
  CabecalhoDialogoAlerta,
  RodapeDialogoAlerta,
  TituloDialogoAlerta,
  DescricaoDialogoAlerta,
  AcaoDialogoAlerta,
  CancelarDialogoAlerta,
};

