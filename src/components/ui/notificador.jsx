import { useToast } from "@/hooks/use-toast";
import { Notificacao, FecharNotificacao, DescricaoNotificacao, ProvedorNotificacao, TituloNotificacao, VisualizacaoNotificacao } from "@/components/ui/notificacao";

export function Notificador() {
  const { toasts } = useToast();

  return (
    <ProvedorNotificacao>
      {toasts.map(function ({ id, title, description, action, ...props }) {
        return (
          <Notificacao key={id} {...props}>
            <div className="grid gap-1">
              {title && <TituloNotificacao>{title}</TituloNotificacao>}
              {description && <DescricaoNotificacao>{description}</DescricaoNotificacao>}
            </div>
            {action}
            <FecharNotificacao />
          </Notificacao>
        );
      })}
      <VisualizacaoNotificacao />
    </ProvedorNotificacao>
  );
}

