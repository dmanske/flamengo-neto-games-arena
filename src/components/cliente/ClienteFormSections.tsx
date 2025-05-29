
import React from "react";
import { UseFormReturn } from "react-hook-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
