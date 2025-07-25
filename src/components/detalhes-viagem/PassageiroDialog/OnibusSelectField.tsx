
import React, { useState, useEffect } from "react";
import { AlertCircle, Bus, Users, CheckCircle2 } from "lucide-react";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger 
} from "@/components/ui/tooltip";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { OnibusOption } from "./types";

interface OnibusSelectFieldProps {
  control: any;
  form: any;
  viagemId: string;
  defaultOnibusId?: string | null;
}

export function OnibusSelectField({ control, form, viagemId, defaultOnibusId }: OnibusSelectFieldProps) {
  const [onibusList, setOnibusList] = useState<OnibusOption[]>([]);
  const [onibusLotados, setOnibusLotados] = useState<Record<string, boolean>>({});

  useEffect(() => {
    let isMounted = true;
    
    const initializeOnibus = async () => {
      try {
        await fetchOnibus();
        
        if (!isMounted) return;
        
        if (defaultOnibusId && form.getValues("onibus_id") !== defaultOnibusId) {
          const onibusExiste = onibusList.some(o => o.id === defaultOnibusId);
          if (onibusExiste && isMounted) {
            form.setValue("onibus_id", defaultOnibusId);
          }
        } else if (!defaultOnibusId && onibusList.length === 1 && !form.getValues("onibus_id") && isMounted) {
          form.setValue("onibus_id", onibusList[0].id);
        }
      } catch (error) {
        if (isMounted) {
          console.error("Erro ao inicializar ônibus:", error);
        }
      }
    };

    initializeOnibus();
    
    return () => {
      isMounted = false;
    };
  }, [defaultOnibusId, form, onibusList]);

  const fetchOnibus = async () => {
    try {
      const { data: onibusData, error: onibusError } = await supabase
        .from("viagem_onibus")
        .select("id, numero_identificacao, tipo_onibus, empresa, capacidade_onibus, lugares_extras")
        .eq("viagem_id", viagemId)
        .order("created_at");

      if (onibusError) throw onibusError;
      
      if (!onibusData || onibusData.length === 0) {
        return;
      }
      
      const onibusWithCounts: OnibusOption[] = [];
      const lotadosMap: Record<string, boolean> = {};
      
      for (const onibus of onibusData) {
        const { data: passageirosData, error: passageirosError } = await supabase
          .from('viagem_passageiros')
          .select('id')
          .eq('onibus_id', onibus.id);
          
        if (passageirosError) throw passageirosError;
        
        const passageirosCount = passageirosData ? passageirosData.length : 0;
        const capacidadeTotal = onibus.capacidade_onibus + (onibus.lugares_extras || 0);
        const disponivel = passageirosCount < capacidadeTotal;
        
        onibusWithCounts.push({
          ...onibus,
          passageiros_count: passageirosCount,
          disponivel: disponivel,
          capacidade_total: capacidadeTotal
        });
        
        lotadosMap[onibus.id] = !disponivel;
      }
      
      setOnibusList(onibusWithCounts);
      setOnibusLotados(lotadosMap);
      
      if (onibusWithCounts.length === 1) {
        form.setValue("onibus_id", onibusWithCounts[0].id);
      }
      
    } catch (error) {
      console.error("Erro ao buscar ônibus:", error);
      toast.error("Erro ao carregar a lista de ônibus");
    }
  };

  const selectedOnibus = form.watch('onibus_id') 
    ? onibusList.find(o => o.id === form.watch('onibus_id')) 
    : null;

  const ocupacaoInfo = selectedOnibus ? {
    atual: selectedOnibus.passageiros_count || 0,
    total: selectedOnibus.capacidade_total || selectedOnibus.capacidade_onibus,
    disponivel: selectedOnibus.disponivel
  } : null;

  return (
    <FormField
      control={control}
      name="onibus_id"
      render={({ field }) => (
        <FormItem>
          <FormLabel className="flex items-center gap-2 text-gray-700">
            <Bus className="h-4 w-4 text-blue-600" />
            Ônibus
            {ocupacaoInfo && !ocupacaoInfo.disponivel && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <AlertCircle className="h-4 w-4 text-red-500" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Este ônibus está lotado</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </FormLabel>
          <Select
            onValueChange={field.onChange}
            defaultValue={field.value}
            disabled={onibusList.length === 1}
          >
            <FormControl>
              <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                <SelectValue placeholder="Selecione um ônibus" />
              </SelectTrigger>
            </FormControl>
            <SelectContent className="bg-white border-gray-200">
              {onibusList.map((onibus) => (
                <SelectItem 
                  key={onibus.id} 
                  value={onibus.id}
                  disabled={!onibus.disponivel}
                  className="hover:bg-blue-50 data-[state=checked]:bg-blue-600 data-[state=checked]:text-white"
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-2">
                      <Bus className="h-4 w-4" />
                      <span>
                        {onibus.numero_identificacao || `Ônibus ${onibus.tipo_onibus}`} ({onibus.empresa})
                      </span>
                    </div>
                    <div className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full ${!onibus.disponivel ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                      <Users className="h-3 w-3" />
                      {onibus.passageiros_count || 0}/{onibus.capacidade_total || onibus.capacidade_onibus}
                    </div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormDescription className="text-gray-600 flex items-center gap-2">
            {ocupacaoInfo ? (
              <>
                <Users className="h-4 w-4 text-blue-500" />
                <span>Ocupação atual: <strong>{ocupacaoInfo.atual}</strong> de <strong>{ocupacaoInfo.total}</strong> passageiros</span>
                {ocupacaoInfo.disponivel ? (
                  <span className="text-green-600 flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" /> Disponível
                  </span>
                ) : (
                  <span className="text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" /> Lotado
                  </span>
                )}
              </>
            ) : (
              <>
                <Bus className="h-4 w-4 text-blue-500" />
                <span>Selecione o ônibus para o passageiro</span>
              </>
            )}
          </FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
