# IPTV Manager - Firebase

Projeto já convertido de Supabase para Firebase e configurado com seu projeto Firebase.

## Firebase usado

Project ID: `iptv-manager-96283`

UID autorizado no Firestore:

```txt
6xLFMmdkUHWpb8iIqkrCyyj0tvl2
```

## O que ativar no Firebase

1. Authentication
   - Entre em **Authentication > Sign-in method**
   - Ative **Email/password**
   - Confirme que o usuário administrador tem o UID acima

2. Firestore Database
   - Entre em **Firestore Database**
   - Clique em **Create database**
   - Pode escolher **Production mode**
   - Região pode ser a mais próxima disponível

## Regras do Firestore

Cole o conteúdo abaixo em **Firestore Database > Rules** e publique:

```txt
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function isAdmin() {
      return request.auth != null
        && request.auth.uid == "6xLFMmdkUHWpb8iIqkrCyyj0tvl2";
    }

    match /clients/{clientId} {
      allow read, create, update, delete: if isAdmin();
    }
  }
}
```

Essas regras fazem com que somente o usuário com esse UID consiga ler, criar, editar e apagar clientes.

## Netlify

Build command:

```txt
npm run build
```

Publish directory:

```txt
dist
```

## Variáveis de ambiente no Netlify

Se subir pelo GitHub, coloque estas variáveis em:

**Site configuration > Environment variables**

```txt
VITE_FIREBASE_API_KEY=AIzaSyBMsbpGsXUJPPGNXmFOho39sxOmUjTVSAk
VITE_FIREBASE_AUTH_DOMAIN=iptv-manager-96283.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=iptv-manager-96283
VITE_FIREBASE_STORAGE_BUCKET=iptv-manager-96283.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=517886801010
VITE_FIREBASE_APP_ID=1:517886801010:web:b99e33c48a1a1985f4feeb
VITE_FIREBASE_MEASUREMENT_ID=G-MBQQKJ0EV3
```

## Observação

O app salva os clientes na coleção `clients` do Firestore. O login usa Firebase Authentication.
