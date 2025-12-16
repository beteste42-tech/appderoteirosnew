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

## 🚀 Deploy na Vercel

### Configurar Variáveis de Ambiente na Vercel

**IMPORTANTE:** Após fazer o deploy na Vercel, você **DEVE** configurar as variáveis de ambiente no painel da Vercel para que o Supabase funcione em produção.

#### Passo a Passo:

1. Acesse o [Dashboard da Vercel](https://vercel.com/dashboard)
2. Selecione seu projeto (`appderoteirosnew`)
3. Vá em **Settings** (Configurações)
4. Clique em **Environment Variables** (Variáveis de Ambiente)
5. Adicione as seguintes variáveis:

   ```
   Nome: VITE_SUPABASE_URL
   Valor: https://seu-projeto.supabase.co
   ```

   ```
   Nome: VITE_SUPABASE_ANON_KEY
   Valor: sua-chave-anon-aqui
   ```

6. **IMPORTANTE:** Selecione os ambientes onde as variáveis devem estar disponíveis:
   - ✅ **Production** (obrigatório)
   - ✅ **Preview** (recomendado)
   - ✅ **Development** (opcional)

7. Clique em **Save** (Salvar)

8. **Após adicionar as variáveis, você DEVE fazer um novo deploy:**
   - Vá em **Deployments**
   - Clique nos três pontos (...) do último deployment
   - Selecione **Redeploy**
   - Ou faça um novo commit e push para o GitHub (deploy automático)

#### ⚠️ Por que isso é necessário?

- No **localhost**, o arquivo `.env` funciona porque o Vite lê essas variáveis durante o desenvolvimento
- Na **Vercel**, o arquivo `.env` não é enviado (está no `.gitignore` por segurança)
- As variáveis precisam ser configuradas no painel da Vercel para serem incluídas no build de produção

## Solução de Problemas

### Erro: "Timeout ao conectar com Supabase" ou "Supabase não configurado" na Vercel
- ✅ **Verifique se as variáveis de ambiente estão configuradas na Vercel** (veja seção acima)
- ✅ **Confirme que fez um novo deploy após adicionar as variáveis**
- ✅ Verifique se os nomes das variáveis estão corretos: `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`
- ✅ Confirme que as variáveis estão habilitadas para o ambiente **Production**

### Erro: "Timeout ao conectar com Supabase" (localhost)
- Verifique se o arquivo `.env` existe e está na raiz do projeto
- Confirme que as variáveis `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` estão preenchidas
- Reinicie o servidor de desenvolvimento após criar/modificar o `.env`
- Verifique sua conexão com a internet
- Confirme que o projeto Supabase está ativo e acessível

### Erro: "Supabase não configurado" (localhost)
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