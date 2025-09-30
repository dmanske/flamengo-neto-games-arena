
import React from "react";
import { UseFormReturn } from "react-hook-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { PersonalInfoFields } from "./PersonalInfoFields";
import { ContactInfoFields } from "./ContactInfoFields";
import { AddressFields } from "./AddressFields";
import { ReferralFields } from "./ReferralFields";
import { ClienteFormData } from "./ClienteFormSchema";

interface ClienteFormSectionsProps {
  form: UseFormReturn<ClienteFormData>;
}

export const ClienteFormSections: React.FC<ClienteFormSectionsProps> = ({ form }) => {
  return (
    <>
      {/* Dados Pessoais */}
      <Card>
        <CardHeader>
          <CardTitle>Dados Pessoais</CardTitle>
          <CardDescription>
            Informações básicas do cliente
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PersonalInfoFields form={form} />
          
          {/* 🆕 NOVO: Seção de cadastramento facial */}
          <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg border mt-4">
            <Checkbox 
              id="cadastro_facial"
              checked={form.watch('cadastro_facial') || false}
              onCheckedChange={(checked) => form.setValue('cadastro_facial', !!checked)}
            />
            <div className="flex flex-col">
              <Label htmlFor="cadastro_facial" className="text-sm font-medium cursor-pointer">
                Possui cadastramento facial
              </Label>
              <span className="text-xs text-gray-500">
                Marque se o cliente já realizou o cadastramento facial
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contato */}
      <Card>
        <CardHeader>
          <CardTitle>Contato</CardTitle>
          <CardDescription>
            Informações de contato do cliente
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ContactInfoFields form={form} />
        </CardContent>
      </Card>

      {/* Endereço */}
      <Card>
        <CardHeader>
          <CardTitle>Endereço</CardTitle>
          <CardDescription>
            Informações do endereço do cliente
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AddressFields form={form} />
        </CardContent>
      </Card>

      {/* Como conheceu e observações */}
      <Card>
        <CardHeader>
          <CardTitle>Informações Adicionais</CardTitle>
          <CardDescription>
            Como o cliente conheceu a empresa e observações
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ReferralFields form={form} />
        </CardContent>
      </Card>
    </>
  );
};
