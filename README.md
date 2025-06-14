# Sistema de Quiz com Firebase

Um sistema completo de quiz desenvolvido com React, TypeScript, Tailwind CSS e Firebase.

## Funcionalidades

### 🔐 Autenticação
- Login e registro com email/senha
- Autenticação segura via Firebase Auth
- Gerenciamento de sessão de usuário

### 📝 Criação de Quizzes
- Interface intuitiva para criar quizzes
- Múltiplas perguntas com 4 opções cada
- Definição de resposta correta
- Validação de dados

### 🎮 Jogabilidade
- Interface moderna e responsiva
- Timer de 30 segundos por pergunta
- Barra de progresso visual
- Feedback imediato das respostas

### 📊 Resultados e Estatísticas
- Pontuação detalhada após cada quiz
- Histórico completo de resultados
- Estatísticas pessoais (média, total de quizzes, etc.)
- Visualização de respostas corretas/incorretas

### 🎨 Design
- Interface moderna com Tailwind CSS
- Animações e micro-interações
- Design responsivo para todos os dispositivos
- Tema consistente e profissional

## Tecnologias Utilizadas

- **React 18** - Framework frontend
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Estilização
- **Firebase** - Backend as a Service
  - Authentication (autenticação)
  - Firestore (banco de dados)
- **Vite** - Build tool e dev server

## Configuração do Firebase

1. Crie um projeto no [Firebase Console](https://console.firebase.google.com/)
2. Ative a Authentication com email/senha
3. Crie um banco Firestore
4. Configure as regras de segurança do Firestore:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Quizzes podem ser lidos por todos, criados apenas por usuários autenticados
    match /quizzes/{document} {
      allow read: if true;
      allow create: if request.auth != null;
    }
    
    // Resultados só podem ser acessados pelo próprio usuário
    match /results/{document} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
    }
  }
}
```

5. Copie as configurações do Firebase e atualize o arquivo `src/App.tsx`:

```typescript
const firebaseConfig = {
  apiKey: "sua-api-key",
  authDomain: "seu-projeto.firebaseapp.com",
  projectId: "seu-project-id",
  storageBucket: "seu-projeto.appspot.com",
  messagingSenderId: "123456789",
  appId: "seu-app-id"
};
```

## Como Usar

### Para Usuários

1. **Registro/Login**: Crie uma conta ou faça login
2. **Explorar Quizzes**: Veja os quizzes disponíveis no dashboard
3. **Jogar Quiz**: Clique em "Jogar Quiz" e responda as perguntas
4. **Ver Resultados**: Acompanhe seu desempenho na aba "Resultados"
5. **Criar Quiz**: Use a aba "Criar Quiz" para adicionar novos quizzes

### Para Desenvolvedores

1. Clone o repositório
2. Instale as dependências: `npm install`
3. Configure o Firebase (veja seção acima)
4. Execute o projeto: `npm run dev`

## Estrutura do Projeto

```
src/
├── components/          # Componentes React
│   ├── AuthComponent.tsx       # Autenticação
│   ├── QuizCreator.tsx        # Criação de quizzes
│   ├── QuizDashboard.tsx      # Dashboard principal
│   ├── QuizPlayer.tsx         # Interface de jogo
│   └── QuizResults.tsx        # Resultados e estatísticas
├── contexts/           # Contextos React
│   ├── AuthContext.tsx        # Contexto de autenticação
│   └── FirebaseContext.tsx    # Contexto do Firebase
├── App.tsx            # Componente principal
├── main.tsx           # Ponto de entrada
└── index.css          # Estilos globais
```

## Funcionalidades Técnicas

### Segurança
- Regras de segurança do Firestore
- Validação de dados no frontend
- Autenticação obrigatória para ações sensíveis

### Performance
- Lazy loading de componentes
- Otimização de queries do Firestore
- Caching de dados quando apropriado

### UX/UI
- Loading states em todas as operações
- Feedback visual para ações do usuário
- Design responsivo e acessível
- Animações suaves e profissionais

## Próximas Funcionalidades

- [ ] Categorias de quizzes
- [ ] Ranking global de usuários
- [ ] Compartilhamento de quizzes
- [ ] Modo multiplayer
- [ ] Importação/exportação de quizzes
- [ ] Análise detalhada de performance

## Contribuição

Contribuições são bem-vindas! Por favor, abra uma issue ou pull request.

## Licença

MIT License - veja o arquivo LICENSE para detalhes.