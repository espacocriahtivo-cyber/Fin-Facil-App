# ⚡ Como Publicar o Fin Fácil App na Hostinger em 3 Passos Simples

O projeto agora gera automaticamente o arquivo pronto para a Hostinger: **`finfacil-hostinger.zip`**.

---

### 🟢 PASSO 1: Gerar o arquivo limpo
No terminal do projeto, execute:
```bash
npm run package
```
*Isso compila a aplicação e cria o arquivo **`finfacil-hostinger.zip`** (menos de 1 MB), contendo apenas os 9 arquivos essenciais do site e a configuração `.htaccess`.*

---

### 🟢 PASSO 2: Enviar para a Hostinger
1. Acesse o painel da Hostinger (**hPanel**).
2. Vá em **Sites** ➔ selecione seu domínio ➔ **Gerenciador de Arquivos**.
3. Abra a pasta **`public_html`**.
4. Clique no ícone de **Upload** no topo e envie o arquivo **`finfacil-hostinger.zip`**.
5. Clique com o botão direito no arquivo enviado e escolha **Extrair** (ou *Extract*).
6. Confirme a extração diretamente na pasta `public_html`.
*(Se desejar, pode apagar o arquivo .zip após extrair).*

---

### 🟢 PASSO 3: Liberar seu Domínio no Firebase
Para que o login e a sincronização em tempo real funcionem no seu domínio:
1. Abra o [Firebase Console](https://console.firebase.google.com).
2. Vá em **Authentication** ➔ **Configurações** ➔ **Domínios autorizados**.
3. Clique em **Adicionar domínio** e digite o seu domínio da Hostinger (ex: `seusite.com.br`).

---

### 💡 Dica Extra (SSL/HTTPS):
No painel da Hostinger, garanta que o **SSL** (Let's Encrypt) gratuito esteja ativo e com a opção **Forçar HTTPS** ligada. Isso garante que as notificações push e o modo offline PWA funcionem no celular dos seus clientes.

**Pronto! Seu Fin Fácil App estará funcionando 100% online na Hostinger.**
