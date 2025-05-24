import React from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Control } from "react-hook-form";

interface ReferralFieldsProps {
  control: Control<any>;
  watchComoConheceu: string;
}

export function ReferralFields({ control, watchComoConheceu }: ReferralFieldsProps) {
  return (
    <>
      <FormField
        control={control}
        name="como_conheceu"
        render={({ field }) => (
          <FormItem className="space-y-4">
            <FormLabel className="text-sm font-medium text-gray-700">Como conheceu a FLAVIAGENS?<span className="text-red-600">*</span></FormLabel>
            <FormControl>
              <RadioGroup
                onValueChange={field.onChange}
                defaultValue={field.value}
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
              >
                <div className="bg-slate-50 border-2 border-slate-200 rounded-xl p-4 cursor-pointer hover:bg-slate-100 transition-all duration-200">
                  <div className="flex items-center gap-3">
                    <RadioGroupItem value="Instagram" id="instagram" className="text-red-600" />
                    <label htmlFor="instagram" className="font-medium text-gray-700 cursor-pointer flex items-center gap-2">
                      <span className="text-xl">📱</span>
                      <span>Instagram</span>
                    </label>
                  </div>
                </div>

                <div className="bg-slate-50 border-2 border-slate-200 rounded-xl p-4 cursor-pointer hover:bg-slate-100 transition-all duration-200">
                  <div className="flex items-center gap-3">
                    <RadioGroupItem value="Facebook" id="facebook" className="text-red-600" />
                    <label htmlFor="facebook" className="font-medium text-gray-700 cursor-pointer flex items-center gap-2">
                      <span className="text-xl">👥</span>
                      <span>Facebook</span>
                    </label>
                  </div>
                </div>

                <div className="bg-slate-50 border-2 border-slate-200 rounded-xl p-4 cursor-pointer hover:bg-slate-100 transition-all duration-200">
                  <div className="flex items-center gap-3">
                    <RadioGroupItem value="Google" id="google" className="text-red-600" />
                    <label htmlFor="google" className="font-medium text-gray-700 cursor-pointer flex items-center gap-2">
                      <span className="text-xl">🔍</span>
                      <span>Google</span>
                    </label>
                  </div>
                </div>

                <div className="bg-slate-50 border-2 border-slate-200 rounded-xl p-4 cursor-pointer hover:bg-slate-100 transition-all duration-200">
                  <div className="flex items-center gap-3">
                    <RadioGroupItem value="WhatsApp" id="whatsapp" className="text-red-600" />
                    <label htmlFor="whatsapp" className="font-medium text-gray-700 cursor-pointer flex items-center gap-2">
                      <span className="text-xl">💬</span>
                      <span>WhatsApp</span>
                    </label>
                  </div>
                </div>

                <div className="bg-slate-50 border-2 border-slate-200 rounded-xl p-4 cursor-pointer hover:bg-slate-100 transition-all duration-200">
                  <div className="flex items-center gap-3">
                    <RadioGroupItem value="Indicação" id="indicacao" className="text-red-600" />
                    <label htmlFor="indicacao" className="font-medium text-gray-700 cursor-pointer flex items-center gap-2">
                      <span className="text-xl">👥</span>
                      <span>Indicação</span>
                    </label>
                  </div>
                </div>

                <div className="bg-slate-50 border-2 border-slate-200 rounded-xl p-4 cursor-pointer hover:bg-slate-100 transition-all duration-200">
                  <div className="flex items-center gap-3">
                    <RadioGroupItem value="Outro" id="outro" className="text-red-600" />
                    <label htmlFor="outro" className="font-medium text-gray-700 cursor-pointer flex items-center gap-2">
                      <span className="text-xl">📝</span>
                      <span>Outro</span>
                    </label>
                  </div>
                </div>
              </RadioGroup>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {watchComoConheceu === "Indicação" && (
        <FormField
          control={control}
          name="indicacao_nome"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium text-gray-700">Quem indicou?<span className="text-red-600">*</span></FormLabel>
              <FormControl>
                <Input 
                  placeholder="Nome de quem indicou" 
                  className="h-12 px-4 rounded-xl border-2 focus:border-red-500 focus:ring-red-500"
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      <FormField
        control={control}
        name="observacoes"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-sm font-medium text-gray-700">Observações</FormLabel>
            <FormControl>
              <Textarea 
                placeholder="Informações adicionais que gostaria de compartilhar..." 
                className="min-h-[120px] px-4 py-3 rounded-xl border-2 focus:border-red-500 focus:ring-red-500"
                {...field} 
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
}
