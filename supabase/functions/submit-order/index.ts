import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.76.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface OrderPayload {
  orderData: {
    numero_pedido: string;
    nome: string;
    telefone: string;
    cep: string;
    estado: string;
    bairro: string;
    rua: string;
    numero: string;
    complemento: string;
    itens: any[];
    forma_pagamento: string;
    taxa_entrega: number;
    subtotal: number;
    desconto: number;
    cupom: string | null;
    total: number;
    status: string;
    user_id: string | null;
  };
  items: any[];
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { orderData, items }: OrderPayload = await req.json();

    // Insert order into database
    const { data: insertedOrder, error: insertError } = await supabase
      .from('pedidos')
      .insert([orderData])
      .select()
      .single();

    if (insertError) {
      console.error('Error inserting order:', insertError);
      throw insertError;
    }

    // Update coupon usage if applicable
    if (orderData.cupom) {
      await supabase.rpc('increment_cupom_uso', { cupom_code: orderData.cupom.toUpperCase() });
    }

    // Send to webhook
    const webhookUrl = 'https://n8n-n8n.pmmdpz.easypanel.host/webhook/9d7f629b-320c-41bb-9d1b-d4aafb704eea';
    
    if (webhookUrl) {
      const webhookPayload = {
        id: insertedOrder.id,
        numero_pedido: orderData.numero_pedido || insertedOrder.numero_pedido,
        cliente: {
          nome: orderData.nome || insertedOrder.nome,
          telefone: orderData.telefone || insertedOrder.telefone
        },
        endereco: {
          cep: orderData.cep || insertedOrder.cep,
          estado: orderData.estado || insertedOrder.estado,
          bairro: orderData.bairro || insertedOrder.bairro,
          rua: orderData.rua || insertedOrder.rua,
          numero: orderData.numero || insertedOrder.numero,
          complemento: orderData.complemento || insertedOrder.complemento || ''
        },
        itens: items.map(item => ({
          id: item.id || null,
          nome: item.name || 'Produto',
          tamanho: item.size || 'M',
          quantidade: item.quantity || 1,
          preco_unitario: item.price || 0,
          preco_total: (item.price || 0) * (item.quantity || 1),
          observacoes: item.observations || ''
        })),
        pagamento: {
          forma: orderData.forma_pagamento || insertedOrder.forma_pagamento || 'Não informado'
        },
        valores: {
          taxa_entrega: orderData.taxa_entrega || insertedOrder.taxa_entrega || 0,
          subtotal: orderData.subtotal || insertedOrder.subtotal || 0,
          desconto: orderData.desconto || insertedOrder.desconto || 0,
          cupom: orderData.cupom || insertedOrder.cupom || null,
          total: orderData.total || insertedOrder.total || 0
        },
        status: orderData.status || insertedOrder.status || 'pendente',
        created_at: insertedOrder.created_at
      };

      try {
        const webhookResponse = await fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(webhookPayload),
        });

        if (!webhookResponse.ok) {
          console.error('Webhook failed:', await webhookResponse.text());
        }
      } catch (webhookError) {
        console.error('Webhook error:', webhookError);
        // Don't fail the order if webhook fails
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        order: insertedOrder 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );
  } catch (error) {
    console.error('Error submitting order:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
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
