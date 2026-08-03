# Plano de Implementação: Ambilight / Efeito de Aura (Cores Dinâmicas)

Agora vamos construir a segunda funcionalidade visual: O **Efeito de Aura Dinâmica**. O objetivo é que os cartões de filmes emitam um brilho ao redor de si próprios cuja cor é extraída automaticamente da paleta dominante do pôster do filme (efeito *Ambilight*).

## 🔴 User Review Required

> [!WARNING]
> Para conseguir essa mágica visual com excelente performance no navegador, precisarei instalar a biblioteca **`fast-average-color`** no seu frontend. Ela é super leve e recomendada para este exato uso.
> Você aprova a instalação desta dependência no frontend?

---

## 🛠️ Proposed Changes

### [NEW] Dependência
- Instalar `fast-average-color` no diretório `frontend`.

### [NEW] `frontend/hooks/useImageColor.ts`
- Criação de um Custom Hook no React responsável por instanciar a `FastAverageColor`.
- O hook receberá a URL da imagem (neste caso, o pôster do TMDB), extrairá a cor dominante assincronamente e a retornará (por exemplo, `rgba(215, 45, 12, 0.6)`).
- Implementaremos um cache simples interno no hook para garantir que, se o filme aparecer várias vezes, a cor só seja calculada uma vez por sessão.

### [MODIFY] `frontend/components/ui/MovieCard.tsx`
- Vamos refatorar o `MovieCard` para consumir o `useImageColor(movie.poster_url)`.
- Alteraremos o estilo de hover do cartão (`onMouseEnter`). Quando o mouse passar sobre o filme, o `box-shadow` e possivelmente um pseudo-elemento de brilho no fundo (`::before` ou um `<div absolute>`) não emitirão mais o roxo padrão do tema, mas sim a **cor real do filme**.
- Usaremos o `framer-motion` (já integrado no `MovieCard`) para animar a transição de cor do brilho de forma suave.

---

## 🧪 Verification Plan

### Manual Verification
1. Entrar na página **"Recomendações"** (`/discover`) onde existem vários `MovieCard` listados em Grid.
2. Passar o mouse sobre filmes com pôsteres distintamente diferentes (ex: um filme escuro/azul, contra um filme muito claro/vermelho).
3. Confirmar se a aura/sombra que aparece por trás do cartão corresponde perfeitamente com a paleta do filme em vez da cor padrão.
