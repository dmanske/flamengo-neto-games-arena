
import React from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import { formatCEP, fetchAddressByCEP } from "@/utils/cepUtils";
import { toast } from "sonner";

// Lista de estados brasileiros para o dropdown
const estadosBrasileiros = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", 
  "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN", 
  "RS", "RO", "RR", "SC", "SP", "SE", "TO"
];

interface AddressFieldsProps {
  form: UseFormReturn<any>;
}

export const AddressFields: React.FC<AddressFieldsProps> = ({ form }) => {
  const [loadingCep, setLoadingCep] = React.useState(false);

  const handleCepBlur = async (cep: string) => {
    if (cep.length < 8) return;
    
    setLoadingCep(true);
    try {
      const addressData = await fetchAddressByCEP(cep);
      if (addressData) {
        form.setValue("endereco", addressData.logradouro);
        form.setValue("cidade", addressData.localidade);
        
        // Set the state correctly by directly using setValue with the state from the API
        form.setValue("estado", addressData.uf);
        form.setValue("bairro", addressData.bairro || "");
        
        // Trigger a re-render of the form
        form.trigger();
        
        // Se tiver complemento, adiciona ao campo complemento
        if (addressData.complemento) {
          form.setValue("complemento", addressData.complemento);
        }
        
        toast.success("Endereço encontrado com sucesso!");
      }
    } catch (error) {
      toast.error("Erro ao buscar endereço. Verifique o CEP informado.");
    } finally {
      setLoadingCep(false);
    }
  };

  return (
    <>
      <FormField
        control={form.control}
        name="cep"
        render={({ field }) => (
          <FormItem>
            <FormLabel>CEP*</FormLabel>
            <div className="relative">
              <FormControl>
                <Input 
                  placeholder="00000-000" 
                  {...field} 
                  onChange={(e) => {
                    const formattedCEP = formatCEP(e.target.value);
                    field.onChange(formattedCEP);
                  }}
                  onBlur={() => handleCepBlur(field.value)}
                />
              </FormControl>
              {loadingCep && (
                <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                </div>
              )}
            </div>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-2 gap-2">
        <FormField
          control={form.control}
          name="endereco"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Endereço*</FormLabel>
              <FormControl>
                <Input placeholder="Rua, Avenida, etc." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="numero"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Número*</FormLabel>
              <FormControl>
                <Input placeholder="123" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <FormField
          control={form.control}
          name="cidade"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cidade*</FormLabel>
              <FormControl>
                <Input placeholder="Cidade" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="bairro"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bairro*</FormLabel>
              <FormControl>
                <Input placeholder="Bairro" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="complemento"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Complemento</FormLabel>
            <FormControl>
              <Input placeholder="Apto, bloco, etc." {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="estado"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Estado*</FormLabel>
            <Select 
              onValueChange={field.onChange} 
              value={field.value}
              defaultValue={field.value}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o estado" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {estadosBrasileiros.map((estado) => (
                  <SelectItem key={estado} value={estado}>
                    {estado}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
};
