# SambaTune - Spec Driven Development

Ultima revisao: 2026-05-17

Este documento descreve o que o SambaTune faz, como o projeto esta organizado e quais contratos tecnicos devem ser preservados em evolucoes futuras. Ele deve ser usado como referencia antes de implementar novas features, refatoracoes ou alteracoes de produto.

## 1. Visao Do Produto

SambaTune e uma aplicacao web para estudo de cavaquinho e banjo com foco em samba, pagode, sequencias harmonicas, dicionario de acordes, diagramas personalizados, treino com ritmo e comunidade.

O produto combina:

- Landing page publica para aquisicao e apresentacao do produto.
- Area autenticada em `/app` para ferramentas musicais.
- Autenticacao via Supabase.
- Dicionario interativo de acordes.
- Editor de sequencias harmonicas com templates e encadeamento de voicings.
- Criador de diagramas personalizados exportaveis.
- Construtor de exercicios.
- Salvamento privado local por usuario.
- Publicacao publica na comunidade via Supabase.
- Abertura de criacoes salvas/publicadas de volta na ferramenta de origem.
- Curtidas e comentarios publicos em criacoes da comunidade.
- Playback de sequencias com sintetizador, metronomo e loops de percussao.

## 2. Stack Tecnica

- React 19.
- Vite 7.
- TypeScript.
- TanStack Router.
- Tailwind CSS v4.
- Radix UI primitives via componentes locais em `src/components/ui`.
- Lucide React para icones.
- Tone.js para audio sintetizado.
- Supabase para autenticacao, perfis e comunidade.
- GitHub Actions para build e deploy.
- Hostinger via FTP como hosting de producao.

Scripts principais:

```bash
npm run dev
npm run build
npm run preview
npm run lint
```

## 3. Estrutura De Pastas

```txt
src/routes
  __root.tsx      Provider global e Outlet
  index.tsx       Landing page publica
  login.tsx       Login
  register.tsx    Cadastro
  app.tsx         Aplicacao autenticada

src/components
  ChordDictionaryPage.tsx
  ChordSearch.tsx
  CommunityTab.tsx
  CreationSavePanel.tsx
  ExercisesTab.tsx
  PercussionPlayers.tsx
  ProfileTab.tsx
  ProgressionEditor.tsx
  ProgressionGrid.tsx
  UserMenu.tsx
  WelcomeTour.tsx
  VoicingMiniSvg.tsx

src/lib
  auth-context.tsx
  audio.ts
  chord-finder.ts
  creations.ts
  degree-progressions.ts
  harmony.ts
  music-theory.ts
  progression.ts
  supabase.ts
  voicing-search.ts

src/config
  audio-loops.ts
  cavaquinho-dictionary.json
  ukulele-dictionary.json
  violao-dictionary.json

public
  hero-cavaquinho.png
  audio/loops/*.mp3

.github/workflows
  deploy.yml
  extract-chords.yml
```

## 4. Rotas E Acesso

### `/`

Landing page publica. Mostra:

- Hero com proposta: acordes, arpejos, escalas, sequencias e muito mais.
- Beneficios do dicionario interativo, sequencias, diagramas, ritmo e comunidade.
- CTA para experimentar.
- UserMenu no topo, mostrando botoes de login/cadastro quando deslogado.

### `/login`

Tela publica de login.

Fluxos:

- Login por email e senha.
- Login com Google via Supabase OAuth.
- Redireciona para `/app` apenas quando `isAuthenticated` estiver confirmado no contexto.
- Exibe erro amigavel para credenciais invalidas ou email nao confirmado.

### `/register`

Tela publica de cadastro em duas etapas.

Etapa 1:

- Nome completo.
- Email.
- Senha.
- Confirmacao de senha.

Etapa 2:

- Foto/avatar opcional.
- Nome artistico.
- WhatsApp.
- Idade.
- Sexo.
- Instrumento principal.

Regras:

- Email e normalizado com `trim().toLowerCase()`.
- Cadastro por email exige confirmacao de email.
- Mesmo que Supabase crie sessao automaticamente, o app faz logout e mostra mensagem de confirmacao.
- Cadastro salva perfil na tabela `profiles`.
- Usuario so entra depois de confirmar email e fazer login.

### `/app`

Area autenticada.

Regras:

- Se `isLoading`, mostra tela de carregamento.
- Se nao autenticado, redireciona para `/`.
- Qualquer URL direta como `/app?tab=dictionary` deve ser bloqueada sem sessao.
- Abas controladas por query param `tab`.

Tabs:

- `dictionary`: Dicionario Interativo.
- `progression`: Sequencias Harmonicas.
- `diagram`: Criador de Diagramas.
- `exercises`: Escalas e Arpejos.
- `plan`: Plano de Estudos.
- `community`: Comunidade.
- `profile`: Meu Perfil.

## 5. Autenticacao E Perfil

Arquivo central: `src/lib/auth-context.tsx`.

Estado exposto:

```ts
user: UserProfile | null
supabaseUser: User | null
session: Session | null
isAuthenticated: boolean
isLoading: boolean
```

Operacoes:

- `login(email, password)`
- `loginWithGoogle()`
- `register(data)`
- `logout()`
- `updateProfile(data)`

Tabela esperada: `profiles`.

Campos usados:

- `id`
- `email`
- `name`
- `artistic_name`
- `phone_whatsapp`
- `age`
- `gender`
- `instrument`
- `avatar_url`
- `updated_at`

Storage esperado:

- Bucket `avatars`.
- Upload em `avatars/{userId}.{ext}`.
- O codigo usa URL publica do arquivo.

Regras importantes:

- `mapSupabaseUser` monta o `UserProfile` usando perfil do banco e fallback para metadata/email.
- `fetchProfile` usa `maybeSingle()`.
- `logout` limpa tambem o estado local, nao depende apenas do evento do Supabase.
- Rotas internas nao devem usar apenas UI escondida para seguranca; devem checar autenticacao.

## 6. Landing Page

Arquivo: `src/routes/index.tsx`.

Objetivo:

- Apresentar SambaTune de forma comercial e convidativa.
- Destacar sequencias de samba, dicionario interativo, diagramas, ritmo, arpejos, escalas e comunidade.
- Evitar promessa de gratuidade permanente.
- Usar linguagem "Experimente gratis".

Elementos visuais:

- Estilo neobrutalista.
- Fundo `neo-bg`.
- Cores `neo-orange` e `neo-yellow`.
- Hero com imagem `public/hero-cavaquinho.png?v=20260515`.
- Circulos em marca d'agua no hero.
- Cards com borda forte e sombra.

## 7. Aplicacao Interna

Arquivo: `src/routes/app.tsx`.

Responsabilidades:

- Shell autenticado da aplicacao.
- Sidebar.
- Header.
- Modo escuro/claro.
- Protecao de acesso.
- Alternancia de abas.
- Estado global do criador de diagramas.

Modo escuro:

- Aplica no container principal.
- Aplica em sidebar, header, brand area e user menu.
- Usa classes condicionais em vez de `bg-white` fixo no shell.

Alinhamento:

- Header e topo da sidebar usam altura fixa de `72px`.
- Bordas do topo usam a mesma espessura e variavel de tema.

## 8. Dicionario Interativo

Arquivos:

- `src/components/ChordDictionaryPage.tsx`
- `src/lib/voicing-search.ts`
- `src/config/cavaquinho-dictionary.json`
- `src/components/VoicingMiniSvg.tsx`

Fluxo:

1. Usuario escolhe instrumento.
2. Digita acorde.
3. `parseChord` interpreta o acorde.
4. `searchVoicings` busca shapes.
5. Resultados aparecem como mini diagramas.
6. Usuario pode salvar no perfil ou publicar na comunidade.

Regras:

- Instrumentos atuais: cavaquinho e banjo, ambos DGBD.
- Dicionario real existe para cavaquinho.
- Banjo usa a mesma afinacao e pode cair no fallback algoritmico quando nao houver dicionario especifico.
- Se acorde esta no dicionario, `voicing-search` retorna apenas voicings do dicionario.
- Se nao esta no dicionario, usa `findVoicings` como fallback.

## 9. Parser Musical

Arquivo: `src/lib/music-theory.ts`.

Responsabilidades:

- Normalizar notas enarmonicas.
- Definir formulas de acordes.
- Aceitar notacoes brasileiras e alternativas.
- Interpretar acordes com barra.
- Retornar `ParsedChord`.

Exemplos suportados:

- `C`
- `Am`
- `G7`
- `F#m7`
- `C7b9`
- `m6/9`
- `7M`
- `7/9`
- `7(13)`
- `C/G`

Pontos tecnicos:

- `parseQualityModular` cobre combinacoes nao listadas diretamente.
- `parseChord` converte notacoes como `11#` para `#11` e `-` para menor ou bemol conforme contexto.

## 10. Busca E Encadeamento De Voicings

Arquivos:

- `src/lib/voicing-search.ts`
- `src/lib/chord-finder.ts`

`findVoicings`:

- Faz backtracking por corda/traste.
- Considera afinacao ativa.
- Limita traste maximo.
- Detecta pestanas.
- Conta dedos.
- Remove duplicados.
- Ordena por completude, cordas mudas, dedos e regiao.

`searchVoicings`:

- Tenta dicionario antes do algoritmo.
- Agrupa fallback por regioes do braco.
- Para instrumentos pequenos permite omitir quinta/fundamental em alguns casos.

`resolveAutoVoicings`:

- Resolve voicings para uma sequencia.
- No primeiro acorde prefere posicao baixa.
- Nos proximos acordes escolhe menor movimento em relacao ao shape anterior.

## 11. Sequencias Harmonicas

Arquivos:

- `src/components/ProgressionEditor.tsx`
- `src/components/ProgressionGrid.tsx`
- `src/lib/progression.ts`
- `src/lib/harmony.ts`
- `src/lib/degree-progressions.ts`

Funcionalidades:

- Escolha de categoria de sequencia.
- Escolha de template.
- Escolha de tom.
- Transposicao de graus para acordes reais.
- Edicao livre de progressao.
- Separacao por compassos usando `|`.
- `||` repete o compasso anterior.
- Analise harmonica por tonalidade detectada.
- Grade visual de compassos e acordes.
- Selecao manual de voicings por acorde.
- Auto-voicing com encadeamento.
- Playback com metronomo/sintese/loops.
- Salvamento privado e publicacao na comunidade.

Analise harmonica:

- `src/lib/harmony.ts` detecta a tonalidade antes de gerar graus romanos e funcoes.
- A deteccao usa pontuacao hibrida: perfil Krumhansl-Schmuckler, raizes dos acordes, encaixe diatonico, qualidade esperada do grau, dominantes resolvendo e peso de primeiro/ultimo acorde.
- A rotacao do perfil tonal deve preservar a raiz candidata como centro; progresses claras em do maior como `C | F | G | C`, `C7M | Dm7 G7 | C7M` e `C | Am | F | G` devem retornar `C maior`, nao `F maior`.
- Casos de referencia: `F | Bb | C7 | F` deve retornar `F maior`; `Am | Dm | E7 | Am` deve retornar `A menor`.

Categorias atuais:

- Quadradas Maiores.
- Quadradas Menores.
- Maiores.
- Menores.
- Dissonante Maior.
- Dissonante Menor.

## 12. Audio E Ritmo

Arquivos:

- `src/lib/audio.ts`
- `src/config/audio-loops.ts`
- `src/components/PercussionPlayers.tsx`
- `public/audio/loops`

Audio sintetizado:

- Tone.js.
- PolySynth FMSynth.
- Pad/comping harmonico por acorde.
- Metronomo com MembraneSynth.

Loops:

- Batucada.
- Samba-enredo.
- Outros estilos previstos no codigo: jazz, bossanova, metronome.

Modos de audio:

- `harmony`
- `percussion`
- `both`

Observacao:

- `ProgressionEditor` atualmente chama `startPlayback` com estilo `"metronome"` no botao principal.
- `PercussionPlayers` oferece players separados para loops.

## 13. Criador De Diagramas

Arquivo principal: `src/routes/app.tsx`.

Funcionalidades:

- Renderiza SVG editavel.
- Permite definir titulo.
- Traste inicial.
- Quantidade de trastes.
- Quantidade de cordas.
- Afinacao/string names.
- Orientacao vertical/horizontal.
- Conicidade.
- Tamanho de nota.
- Espessura de linha.
- Tamanho de fonte.
- Tamanho de marcador.
- Formas: circulo, quadrado, triangulo.
- Cores: principal, marcador, fundo.
- Marcadores por clique.
- Pestanas por drag.
- Cordas abertas/mudas no nut.
- Exporta SVG.
- Exporta PNG via canvas.

Dependencias internas:

- `ChordSearch` permite buscar acorde e carregar um voicing no diagrama principal.

## 14. Exercicios, Escalas E Arpejos

Arquivo: `src/components/ExercisesTab.tsx`.

Estado atual:

- Construtor simples de rotina.
- Campos:
  - titulo;
  - foco;
  - roteiro de pratica;
  - BPM;
  - minutos.
- Permite salvar no perfil ou publicar na comunidade.

Direcao de produto:

- Evoluir para aplicar arpejos e escalas por regiao do acorde.
- Integrar com sequencias e dicionario para treino contextual.
- Integrar com metrônomo/batucada.

## 15. Comunidade

Arquivos:

- `src/components/CommunityTab.tsx`
- `src/lib/creations.ts`
- `supabase-community-creations.sql`

Tabelas esperadas:

- `community_creations`
- `community_creation_likes`
- `community_creation_comments`

Campos:

- `id`
- `type`
- `title`
- `description`
- `payload`
- `author_id`
- `author_name`
- `created_at`

Tipos:

- `dictionary`
- `progression`
- `exercise`

Fluxo:

1. Usuario cria algo em Dicionario, Sequencias ou Exercicios.
2. Pode salvar localmente no perfil.
3. Pode publicar na comunidade.
4. Publicacao publica usa `author_name`, derivado de:
   - nome artistico;
   - nome;
   - prefixo do email;
   - fallback "Musico".
5. Comunidade abre em dashboard responsivo por assunto: Sequencias, Dicionario, Escalas e Arpejos.
6. Cada cartao do dashboard mostra quantidade de publicacoes, total de curtidas, total de comentarios e publicacao mais quente da secao.
7. Ao clicar em uma secao, a comunidade exibe as publicacoes em lista.
8. Publicacoes de `exercise` sao exibidas como Escalas ou Arpejos conforme conteudo salvo.
9. Usuario pode abrir uma publicacao na ferramenta de origem dentro da propria area `/app`.
10. Ao clicar no icone de comentario, os comentarios e a caixa de resposta aparecem abaixo da publicacao.
11. Comentarios feitos em publicacoes publicas ficam visiveis para a comunidade.

Seguranca RLS esperada:

- Usuarios autenticados podem ler todos os itens.
- Usuarios autenticados podem inserir apenas com `author_id = auth.uid()`.
- Usuarios autenticados podem excluir apenas os proprios itens.
- Usuarios autenticados podem ler curtidas e comentarios.
- Usuarios autenticados podem curtir apenas como `user_id = auth.uid()`.
- Usuarios autenticados podem comentar apenas como `author_id = auth.uid()`.
- Usuarios autenticados podem excluir apenas as proprias curtidas/comentarios.

SQL esta em:

```txt
supabase-community-creations.sql
```

## 16. Salvamento Privado

Arquivo: `src/lib/creations.ts`.

O salvamento privado usa `localStorage`, separado por usuario:

```txt
sambatune_creations:{userId}
```

Consequencias:

- Funciona sem criar tabelas extras.
- Fica no navegador/dispositivo atual.
- Nao sincroniza entre dispositivos.
- Nao aparece para outros usuarios.

Para sincronizar privado entre dispositivos no futuro, criar tabela `user_creations` no Supabase.

## 17. Deploy

Arquivo: `.github/workflows/deploy.yml`.

Fluxo:

1. Push na branch `main`.
2. GitHub Actions baixa codigo.
3. Configura Node 20.
4. Roda `npm install`.
5. Roda `npm run build`.
6. Usa secrets:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `FTP_SERVER`
   - `FTP_USERNAME`
   - `FTP_PASSWORD`
7. Envia `./dist/` por FTP para:

```txt
/public_html/
```

Dominio atual:

```txt
sambatune.com
```

Repositorio atual:

```txt
https://github.com/dududrummer/sambatune.git
```

## 18. Configuracoes Externas Necessarias

### GitHub Secrets

Obrigatorios:

```txt
FTP_SERVER
FTP_USERNAME
FTP_PASSWORD
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
```

### Supabase Auth

Configuracoes esperadas:

```txt
Site URL:
https://sambatune.com

Redirect URLs:
https://sambatune.com/**
https://www.sambatune.com/**
```

Cadastro por email:

- Confirmacao de email deve estar ativa se o produto exigir verificacao.
- O app ja mostra mensagem para confirmar email.

### Supabase SQL

Necessario para comunidade:

```txt
supabase-community-creations.sql
```

Necessario para perfis:

- Tabela `profiles`.
- Bucket `avatars`, se avatar for usado.

## 19. Design System

Arquivo: `src/styles.css`.

Base:

- Tailwind CSS v4.
- Variaveis OKLCH.
- Variantes dark.
- Fontes:
  - display: Luckiest Guy;
  - heading: Bebas Neue;
  - body: Inter;
  - accent: Gochi Hand.

Tokens principais:

- `neo-bg`
- `neo-orange`
- `neo-yellow`
- `neo-border`
- `neo-shadow`

Direcao visual:

- Neobrutalista.
- Bordas fortes.
- Sombras deslocadas.
- Cards simples.
- UI interna mais utilitaria, mas alinhada visualmente a landing.

## 20. Requisitos Funcionais

### RF-001 Autenticacao

O sistema deve permitir login por email/senha e Google.

### RF-002 Confirmacao de email

O sistema deve exigir confirmacao de email antes do acesso por conta criada manualmente.

### RF-003 Protecao da aplicacao

O sistema deve impedir acesso a `/app` para usuarios sem sessao.

### RF-004 Perfil

O usuario deve poder visualizar e editar dados basicos de perfil.

### RF-005 Dicionario interativo

O usuario deve poder buscar acordes e visualizar posicoes.

### RF-006 Sequencias harmonicas

O usuario deve poder montar sequencias por templates ou texto livre.

### RF-007 Encadeamento de voicings

O sistema deve sugerir voicings com movimento reduzido entre acordes.

### RF-008 Diagramas personalizados

O usuario deve poder criar e exportar diagramas em SVG/PNG.

### RF-009 Audio

O usuario deve poder praticar com metronomo, sintese harmonica e loops.

### RF-010 Salvamento privado

O usuario deve poder salvar criacoes localmente no proprio perfil/navegador.

### RF-011 Publicacao publica

O usuario deve poder publicar criacoes na comunidade com nickname.

### RF-012 Comunidade

Usuarios autenticados devem poder visualizar criacoes publicas.

### RF-013 Interacao social

Usuarios autenticados devem poder curtir e comentar publicacoes da comunidade.

## 21. Requisitos Nao Funcionais

- O build de producao deve passar com `npm run build`.
- O deploy deve ser automatico em push para `main`.
- A aplicacao deve funcionar como SPA publicada em Hostinger.
- Dados sensiveis devem vir de secrets/env vars.
- O app nao deve expor service keys no frontend.
- Rotas privadas devem validar sessao.
- UI deve funcionar em desktop e mobile.
- O modo escuro deve cobrir shell, header, sidebar, user menu e conteudo.

## 22. Contratos De Dados

### UserProfile

```ts
interface UserProfile {
  id: string;
  email: string;
  name: string;
  artisticName?: string;
  phoneWhatsapp?: string;
  age?: number;
  gender?: "male" | "female" | "other" | "prefer_not_to_say";
  instrument?: string;
  avatarUrl?: string;
  createdAt: string;
}
```

### SavedCreation

```ts
interface SavedCreation {
  id: string;
  type: "dictionary" | "progression" | "exercise";
  title: string;
  description?: string;
  payload: Record<string, unknown>;
  visibility: "private" | "public";
  authorId: string;
  authorName: string;
  createdAt: string;
}
```

### CommunityCreation

```ts
interface CommunityCreation extends SavedCreation {
  likesCount: number;
  commentsCount: number;
  viewerHasLiked: boolean;
}
```

### CreationComment

```ts
interface CreationComment {
  id: string;
  creationId: string;
  authorId: string;
  authorName: string;
  body: string;
  createdAt: string;
}
```

### Voicing

```ts
interface Voicing {
  frets: number[];
  startingFret: number;
  barres: BarreDef[];
  mutedStrings: number[];
  omitted: string[];
  fingerCount: number;
  isPriority?: boolean;
}
```

## 23. Pontos De Atencao

1. Existem textos com caracteres corrompidos/mojibake em alguns arquivos, provavelmente por encoding antigo.
2. O salvamento privado e localStorage, nao banco.
3. Comunidade depende da tabela `community_creations`.
4. `profiles` e bucket `avatars` nao possuem SQL versionado neste repo.
5. O app usa `dist/` para deploy; nao commitar `dist` se nao fizer parte do fluxo.
6. O chunk principal esta acima de 500 kB; Vite emite warning.
7. `ProgressionEditor` e `app.tsx` concentram muita logica e podem ser divididos futuramente.
8. Existem dicionarios `ukulele` e `violao` no repo, mas a UI atual foca em cavaquinho/banjo.
9. Google OAuth depende de configuracao no Supabase e Google Cloud.
10. Recuperacao de senha aparece como link visual, mas ainda nao ha fluxo implementado.

## 24. Roadmap Tecnico Recomendado

### Curto prazo

- Criar SQL versionado para `profiles` e bucket/policies de `avatars`.
- Adicionar fluxo real de recuperacao de senha.
- Permitir carregar uma criacao salva de volta na ferramenta.
- Adicionar exclusao de criacoes privadas e publicas pela UI.
- Melhorar mensagens de erro de Supabase na publicacao.
- Corrigir encoding/mojibake dos arquivos.

### Medio prazo

- Criar tabela `user_creations` para salvar privado no Supabase.
- Adicionar curtidas/favoritos na comunidade.
- Adicionar filtros na comunidade por tipo.
- Adicionar pagina de detalhe para publicacoes.
- Integrar exercicios diretamente com sequencias e dicionario.
- Adicionar testes automatizados unitarios para parser musical.

### Longo prazo

- Code splitting por abas da aplicacao.
- Editor completo de arpejos e escalas por regiao.
- Sistema de planos de estudo persistente.
- Ranking ou curadoria de sequencias.
- Biblioteca de repertorio/musicas.

## 25. Checklist Antes De Alterar O Projeto

Antes de qualquer mudanca relevante:

1. Identificar qual fluxo sera afetado.
2. Verificar se a rota e publica ou autenticada.
3. Verificar se dados ficam em localStorage ou Supabase.
4. Verificar se precisa de nova tabela/policy RLS.
5. Preservar `npm run build`.
6. Evitar quebrar o deploy em `.github/workflows/deploy.yml`.
7. Atualizar este documento se a mudanca alterar comportamento ou contrato.

## 26. Definicao De Pronto

Uma feature esta pronta quando:

- Funciona no fluxo principal.
- Respeita autenticacao quando aplicavel.
- Exibe erro ou estado vazio claro.
- Funciona em modo claro e escuro.
- Passa em `npm run build`.
- Nao exige secrets hardcoded.
- Tem SQL/policies documentados quando altera Supabase.
- Este spec foi atualizado quando necessario.
