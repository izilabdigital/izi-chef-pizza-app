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
    const webhookUrl = Deno.env.get('N8N_WEBHOOK_URL');
    if (webhookUrl) {
      const webhookPayload = {
        id: insertedOrder.id,
        numero_pedido: orderData.numero_pedido,
        cliente: {
          nome: orderData.nome,
          telefone: orderData.telefone
        },
        endereco: {
          cep: orderData.cep,
          estado: orderData.estado,
          bairro: orderData.bairro,
          rua: orderData.rua,
          numero: orderData.numero,
          complemento: orderData.complemento
        },
        itens: items.map(item => ({
          id: item.id,
          nome: item.name,
          tamanho: item.size,
          quantidade: item.quantity,
          preco: item.price
        })),
        forma_pagamento: orderData.forma_pagamento,
        taxa_entrega: orderData.taxa_entrega,
        subtotal: orderData.subtotal,
        desconto: orderData.desconto,
        cupom: orderData.cupom,
        total: orderData.total,
        status: orderData.status,
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
