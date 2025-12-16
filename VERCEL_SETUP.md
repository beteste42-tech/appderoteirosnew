# 🚀 Guia de Configuração - Variáveis de Ambiente na Vercel

Este guia explica como configurar as variáveis de ambiente do Supabase na Vercel para que o banco de dados funcione corretamente em produção.

## ⚠️ Problema Comum

Se o Supabase funciona no **localhost** mas não funciona após o deploy na **Vercel**, é porque as variáveis de ambiente não estão configuradas no painel da Vercel.

## 📋 Passo a Passo Detalhado

### 1. Obter as Credenciais do Supabase

1. Acesse [https://app.supabase.com](https://app.supabase.com)
2. Faça login na sua conta
3. Selecione seu projeto
4. No menu lateral, clique em **Settings** (⚙️)
5. Clique em **API**
6. Você verá duas informações importantes:
   - **Project URL**: Algo como `https://xxxxxxxxxxxxx.supabase.co`
   - **anon public** key: Uma chave longa que começa com `eyJ...`

### 2. Configurar na Vercel

1. Acesse [https://vercel.com/dashboard](https://vercel.com/dashboard)
2. Faça login na sua conta
3. Encontre e clique no projeto **appderoteirosnew**
4. No topo da página, clique na aba **Settings**
5. No menu lateral esquerdo, clique em **Environment Variables**

### 3. Adicionar as Variáveis

Você precisa adicionar **2 variáveis**:

#### Variável 1: VITE_SUPABASE_URL

1. Clique em **Add New**
2. No campo **Key**, digite: `VITE_SUPABASE_URL`
3. No campo **Value**, cole a **Project URL** do Supabase (ex: `https://xxxxxxxxxxxxx.supabase.co`)
4. Marque as caixas:
   - ✅ **Production**
   - ✅ **Preview** (recomendado)
   - ✅ **Development** (opcional)
5. Clique em **Save**

#### Variável 2: VITE_SUPABASE_ANON_KEY

1. Clique em **Add New** novamente
2. No campo **Key**, digite: `VITE_SUPABASE_ANON_KEY`
3. No campo **Value**, cole a chave **anon public** do Supabase
4. Marque as caixas:
   - ✅ **Production**
   - ✅ **Preview** (recomendado)
   - ✅ **Development** (opcional)
5. Clique em **Save**

### 4. Fazer um Novo Deploy

**⚠️ IMPORTANTE:** Após adicionar as variáveis, você DEVE fazer um novo deploy para que as mudanças tenham efeito.

#### Opção 1: Redeploy Manual

1. Na Vercel, vá para a aba **Deployments**
2. Encontre o último deployment
3. Clique nos três pontos (**...**) ao lado do deployment
4. Selecione **Redeploy**
5. Aguarde o deploy concluir

#### Opção 2: Deploy Automático (Recomendado)

1. Faça uma pequena alteração no código (ex: adicione um comentário)
2. Faça commit e push:
   ```bash
   git add .
   git commit -m "Atualizar configurações"
   git push origin main
   ```
3. A Vercel fará o deploy automaticamente

### 5. Verificar se Funcionou

1. Após o deploy concluir, acesse sua aplicação na Vercel
2. Abra o **Console do Navegador** (F12 > Console)
3. Você deve ver mensagens como:
   - ✅ `🔍 Supabase URL configurada: https://...`
   - ✅ `🔍 Supabase Key configurada: eyJ...`
   - ✅ `✅ Cliente Supabase inicializado com sucesso`

Se você ver essas mensagens, está tudo funcionando! 🎉

## 🔍 Verificação de Problemas

### Se ainda não funcionar:

1. **Verifique os nomes das variáveis:**
   - Deve ser exatamente: `VITE_SUPABASE_URL` (não `SUPABASE_URL`)
   - Deve ser exatamente: `VITE_SUPABASE_ANON_KEY` (não `SUPABASE_ANON_KEY`)
   - O prefixo `VITE_` é obrigatório para aplicações Vite

2. **Verifique se fez um novo deploy:**
   - As variáveis só são incluídas em novos builds
   - Um redeploy é necessário após adicionar/modificar variáveis

3. **Verifique os valores:**
   - A URL deve começar com `https://` e terminar com `.supabase.co`
   - A chave deve ser a chave **anon public**, não a **service_role** (que é secreta)

4. **Verifique os ambientes selecionados:**
   - Certifique-se de que **Production** está marcado
   - Se estiver testando em preview, marque também **Preview**

## 📝 Resumo Rápido

```
Vercel Dashboard → Seu Projeto → Settings → Environment Variables
→ Adicionar VITE_SUPABASE_URL
→ Adicionar VITE_SUPABASE_ANON_KEY
→ Marcar Production, Preview, Development
→ Salvar
→ Fazer Redeploy
```

## 🆘 Precisa de Ajuda?

Se ainda tiver problemas:
1. Verifique os logs do deploy na Vercel
2. Verifique o console do navegador na aplicação em produção
3. Compare os valores com os do arquivo `.env` local (que funciona)
