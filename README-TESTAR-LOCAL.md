# Como testar local antes de subir

1. Abra esta pasta no VS Code.
2. No terminal, rode:

```bash
npm install
npm run dev
```

3. Abra o link que aparecer, normalmente:

```txt
http://localhost:5173
```

## O que foi adicionado

- Nova tela **Apps / Links**.
- Cadastro de nome do app, link e observação.
- Lupa dentro do cadastro do cliente para buscar app/link cadastrado.
- Campos extras no cliente: usuário IPTV, servidor, player, MAC, código, site/link e valor.
- Botões rápidos na lista de clientes: WhatsApp, Site, Copiar MAC e Copiar Código.
- Filtros: Todos, Em dia, Vence hoje, Vencidos e Desativados.

## Regras do Firestore

Cole o arquivo `firestore.rules` no Firebase. Ele já libera as coleções `clients` e `apps` somente para o seu UID.
