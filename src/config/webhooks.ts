// Configurações de Webhooks
// Modifique essas URLs conforme necessário antes de publicar

export const WEBHOOK_CONFIG = {
  // URL do webhook N8N para receber pedidos
  n8nWebhookUrl: 'https://seu-webhook-n8n.com/webhook/pedidos',
  
  // Outras configurações de webhook podem ser adicionadas aqui
  enableWebhook: true,
  
  // Timeout para requisições de webhook (em milissegundos)
  webhookTimeout: 10000,
};
