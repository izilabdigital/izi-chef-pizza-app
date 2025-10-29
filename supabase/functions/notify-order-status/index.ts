import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.76.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface OrderStatusPayload {
  pedido_id: string;
  numero_pedido: string;
  status_novo: string;
  telefone_cliente: string;
  nome_cliente: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const payload: OrderStatusPayload = await req.json();
    console.log('Notificação de status:', payload);

    // Enviar para o webhook externo
    const webhookUrl = 'https://n8n-n8n.pmmdpz.easypanel.host/webhook/9d7f629b-320c-41bb-9d1b-d4aafb704eea';
    
    const webhookPayload = {
      tipo: 'status_atualizado',
      pedido_id: payload.pedido_id,
      numero_pedido: payload.numero_pedido,
      status_novo: payload.status_novo,
      telefone_cliente: payload.telefone_cliente,
      nome_cliente: payload.nome_cliente,
      timestamp: new Date().toISOString()
    };

    console.log('Enviando para webhook:', webhookPayload);

    const webhookResponse = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(webhookPayload),
    });

    if (!webhookResponse.ok) {
      console.error('Erro ao enviar para webhook:', await webhookResponse.text());
      throw new Error(`Webhook falhou: ${webhookResponse.status}`);
    }

    console.log('Webhook enviado com sucesso');

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Notificação enviada com sucesso' 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );
  } catch (error) {
    console.error('Erro ao processar notificação:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: errorMessage 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
