
import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Mail, Phone } from "lucide-react";
import { toast } from "sonner";

const formSchema = z.object({
  name: z.string().min(2, { message: "Nome deve ter pelo menos 2 caracteres" }),
  email: z.string().email({ message: "Email inválido" }),
  message: z.string().min(10, { message: "Mensagem deve ter pelo menos 10 caracteres" }),
});

type FormData = z.infer<typeof formSchema>;

const ContactSection = () => {
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      message: "",
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      // Here you'd typically send this to your backend/Supabase
      console.log("Form submitted:", data);
      
      // Show success message
      toast.success("Mensagem enviada com sucesso! Entraremos em contato em breve.");
      
      // Reset the form
      form.reset();
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("Erro ao enviar mensagem. Tente novamente.");
    }
  };

  const openWhatsApp = () => {
    // Replace with your actual WhatsApp number
    window.open("https://wa.me/5521999999999", "_blank");
  };

  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">Contato Rápido</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div>
            <h3 className="text-2xl font-bold mb-6">Envie sua mensagem</h3>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome</FormLabel>
                      <FormControl>
                        <Input placeholder="Seu nome" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="seu@email.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mensagem</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Escreva sua mensagem aqui..." 
                          className="min-h-[120px]"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="bg-red-600 hover:bg-red-700 w-full">
                  Enviar Mensagem
                </Button>
              </form>
            </Form>
          </div>
          
          <div>
            <h3 className="text-2xl font-bold mb-6">Fale Conosco</h3>
            <p className="text-gray-600 mb-8">
              Tem dúvidas ou precisa de mais informações sobre nossas excursões? Entre em contato conosco e teremos prazer em ajudar.
            </p>
            
            <div className="space-y-6">
              <Button 
                onClick={openWhatsApp}
                variant="outline" 
                className="w-full h-16 border-2 border-gray-200 hover:border-red-600"
              >
                <Phone className="h-5 w-5 mr-2 text-green-600" />
                <span>Conversar pelo WhatsApp</span>
              </Button>
              
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="flex items-center mb-2">
                  <Mail className="h-5 w-5 mr-2 text-red-600" />
                  <h4 className="font-bold">Email</h4>
                </div>
                <p className="text-gray-600">contato@netotours.com.br</p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h4 className="font-bold mb-2">Horário de Atendimento</h4>
                <p className="text-gray-600">Segunda a Sexta: 09:00 - 18:00<br />Sábado: 09:00 - 13:00</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
