# Roteiriza GDM - Sistema de Roteirização Inteligente

## Configuração Inicial

### 1. Instalar Dependências
```bash
npm install
```

### 2. Configurar Supabase

Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anon-aqui
```

**Como obter as credenciais:**
1. Acesse [https://app.supabase.com](https://app.supabase.com)
2. Selecione seu projeto
3. Vá em **Settings > API**
4. Copie a **URL do projeto** e a chave **anon public**

### 3. Executar o Projeto
```bash
npm run dev
```

## Solução de Problemas

### Erro: "Timeout ao conectar com Supabase"
- Verifique se o arquivo `.env` existe e está na raiz do projeto
- Confirme que as variáveis `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` estão preenchidas
- Reinicie o servidor de desenvolvimento após criar/modificar o `.env`
- Verifique sua conexão com a internet
- Confirme que o projeto Supabase está ativo e acessível

### Erro: "Supabase não configurado"
- Certifique-se de que o arquivo `.env` existe
- Verifique se as variáveis começam com `VITE_` (obrigatório no Vite)
- Reinicie o servidor após criar o arquivo `.env`

### Erro de Login
- Verifique se o usuário existe no Supabase
- Confirme que o e-mail foi confirmado (se necessário)
- Verifique as políticas RLS no Supabase

## Usuários Padrão

Após configurar o Supabase, você pode criar os usuários padrão clicando em "Primeiro Acesso? Restaurar Usuários Padrão" na tela de login.

---

This project was generated through Alpha. For more information, visit [dualite.dev](https://dualite.dev).