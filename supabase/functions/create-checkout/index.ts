
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { tripId, clientId, price, description } = await req.json();
    
    if (!tripId) {
      throw new Error("Parâmetros obrigatórios: tripId");
    }

    const supabaseUrl = 'https://uroukakmvanyeqxicuzw.supabase.co';
    const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVyb3VrYWttdmFueWVxeGljdXp3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY4MzMzOTYsImV4cCI6MjA2MjQwOTM5Nn0.fFRtqvpf7kwbJyAh5JHYjTU2zbEI9BvAjDp2rXikrO8';
    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
    
    // Obter dados da viagem
    const { data: tripData, error: tripError } = await supabaseClient
      .from('viagens')
      .select('*')
      .eq('id', tripId)
      .single();
    
    if (tripError || !tripData) {
      throw new Error(`Erro ao buscar informações da viagem: ${tripError?.message || 'Viagem não encontrada'}`);
    }

    // Inicializar o Stripe
    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeSecretKey) {
      throw new Error("STRIPE_SECRET_KEY não configurada");
    }

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: "2023-10-16",
    });

    // Criar a sessão de checkout usando o valor da viagem em vez de um ID de preço fixo
    // Isso é mais flexível e evita problemas de modo de teste vs produção
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: 'brl',
            product_data: {
              name: `Viagem para ${tripData.adversario || 'jogo do Flamengo'}`,
              description: `Rota: ${tripData.rota || ''}`,
            },
            unit_amount: Math.round(tripData.valor_padrao * 100), // Convertendo para centavos como exigido pelo Stripe
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${req.headers.get("origin")}/pagamento-sucesso?session_id={CHECKOUT_SESSION_ID}&viagem=${tripId}${clientId ? `&cliente=${clientId}` : ''}`,
      cancel_url: `${req.headers.get("origin")}/cadastro-publico?viagem=${tripId}${clientId ? `&cliente=${clientId}` : ''}&cancel=true`,
      metadata: {
        viagem_id: tripId,
        cliente_id: clientId || '',
      }
    });

    // Salvar informações do pagamento no banco de dados
    const { error: paymentError } = await supabaseClient.from('payments').insert({
      viagem_id: tripId,
      cliente_id: clientId,
      amount: tripData.valor_padrao,
      currency: 'brl',
      status: 'pending',
      session_id: session.id
    });

    if (paymentError) {
      console.error("Erro ao registrar pagamento:", paymentError);
    }

    // Retornar URL de checkout
    return new Response(
      JSON.stringify({ url: session.url }),
      { 
        headers: { 
          ...corsHeaders,
          "Content-Type": "application/json"
        },
        status: 200 
      }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Erro ao criar sessão de checkout:", errorMessage);
    
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        headers: { 
          ...corsHeaders,
          "Content-Type": "application/json"
        },
        status: 500
      }
    );
  }
});
