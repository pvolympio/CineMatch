# Plano de Redesign: CineMatch Sem Cara de IA

## Visão Geral
Transformar o CineMatch em uma experiência que respire autenticidade cinematográfica, com identidade única e sem padrões genéricos de IA.

## Temática: CineMatch Atelier de Cinema

**Assunto**: Uma experiência de descoberta cinematográfica personalizada que se apresenta como um ateliê de curadoria especializada, não como um algoritmo genérico.

**Público**: Cinéfilos que valorizam cultura e quero um sistema que "entenda" seu gosto como um curador experiente.

**Função Única**: O cinema como forma de processamento cultural e pessoal.

---

## Paleta de Cores (Rejeitando padrões de IA comuns)

### Paleta Autêntica - "Cineclube Privado"
```
-cinza-profundo:   #0A0A0C  (muro de filmes antigos)
-cinza-textura:    #1A1A1D  (capa de caixa de filmes vintage)
-cinza-metal:      #2D2D33  (metal de projeção)
-bege-filme:       #3C372E  (cenário de filme preto-and-branco)
-cinza-selos:      #5A5A5A  (selos de estúdio)
-ouro-dourador:    #C9A36F  (dourador de filmes)
-verde-velvet:     #1E4D3E  (capa de filme verde)
-bordô-taca:       #53262A  (vinil de filme clássico)
```

### Destaque Único - "Luz de Projeção"
```
-luz-cinematográfica: #F0E6D2 (como contraste suave de projeção 35mm)
-accent-vinil:        #C9A36F (dourado vintage de anéis de filme)
-hover-selos:         #F0E6D2 (brilho de selo de verificação)
```

---

## Tipografia Personalizada

### Display - "Face de Exibição"
**Zilla Dak** (ou alternativa comfortably similar como **Alfa Slab**) - uma face de reforço com textura única que evoca capas de filmes vintage.

```css
--font-display: 'Zilla Slab', serif;
--font-display-alt: 'Alfa Slab', serif; (backup)
```

### Body - "Carta de Crítica"
**Libre Franklin** - uma fonte sem serifa moderna com personalidade editorial, como se fosse escrita à mão com caneta tinta.

```css
--font-body: 'Libre Franklin', sans-serif;
--font-bio: 'Cormorant Garamond', serif; (para citações)
```

### Mono - "Dados Técnicos"
**Space Mono** - mais comunicativo que JetBrains Mono, evoca rótulos de filmes.

```css
--font-mono: 'Space Mono', monospace;
```

### Escala Tipográfica
```
-display-hero:  clamp(2.5rem, 8vw, 5rem) - título principal
-display-section: 2.25rem / 1.8rem - nomes de seções
-display-card-title: 1.25rem - títulos de filmes
-body-large: 1.125rem - textos principais
-body-base: 1rem - textos padrão
-body-sm: 0.875rem - labels
-label: 0.8rem - detalhes técnicos
-badge: 0.7rem - tags de gênero
```

---

## Layout e Estrutura

### Conceito: "Cenário de Filme"

O layout respira como uma sala de cinema vintage - com profundidade, texturas sutis e uma sensação de espaço real.

#### Wireframe
```
┌────────────────────────────────────────┐
│   HERO: Capa de filme destacada       │
│   (título em destaque, CTA principal) │
│                                        │
│   CAPA DE FILME (poster-card estilo    │
│   - sombra de filme projetado)         │
│   ┌────────────────────────────────┐ │
│   │ TÍTULO                           │ │
│   │ Ano • Gênero • Rating            │ │
│   │ Motivo da recomendação          │ │
│   │ [Botão: Ver detalhes]           │ │
│   └────────────────────────────────┘ │
│                                        │
│   SEÇÃO DE RECOMENDAÇÕES              │
│   ┌───────┬───────┬───────┬───────┐   │
│   │ Filme │ Filme │ Filme │ Filme │   │
│   │ Poster│ Poster│ Poster│ Poster│   │
│   │ Card  │ Card  │ Card  │ Card  │   │
│   └───────┴───────┴───────┴───────┘   │
│                                        │
│   FOOTER: Informações do filme        │
│   "Você viu [Filme]? Veja similar..." │
└────────────────────────────────────────┘
```

---

## Elemento Único: TEXTURA VINTAGE

### "Filme Antigo" Overlay
Um efeito sutil de textura de filme vintage (não grain clássico de IA):

```
.film-vintage {
  position: relative;
}
.film-vintage::before {
  content: "";
  position: absolute;
  inset: 0;
  background: 
    linear-gradient(135deg, #f5f1e6 0%, #e8e0d1 25%, #d4cbc0 50%, #c9c1b5 75%),
    radial-gradient(circle at 20% 30%, rgba(201, 163, 111, 0.1) 0%, transparent 20%),
    radial-gradient(circle at 80% 70%, rgba(30, 77, 62, 0.08) 0%, transparent 20%);
  opacity: 0.4;
  pointer-events: none;
  background-size: 400% 400%;
  animation: filmTextureDrift 25s ease-in-out infinite;
}
```

---

## Microinterações Autênticas

### Transições de Filme
```css
/* Transição cinematográfica - "corte de filme" */
transition-film {
  transition: all 0.45s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

/* Fade de prédio de filme */
@keyframes fadeFilm {
  0% { opacity: 0; transform: translateY(20px) rotateX(5deg); }
  100% { opacity: 1; transform: translateY(0) rotateX(0); }
}
```

### Hover de Projeto
- Quando o cursor passa sobre um filme: suavize a luz como se a projeção estivesse sendo focada
- O card "respira" com uma leve elevação e aumento de contraste

---

## Componentes a Reescrever

### 1. MovieCard.tsx - A CENTERAL
**Problema**: Usa Tailwind padrão com gradientes genéricos de IA.

**Solução**:
- Remover `text-gradient-crimson` e `text-gradient-ember`
- Usar sombra de filme projetado: `box-shadow: 0 4px 20px rgba(0,0,0,0.3), 0 0 0 1px rgba(201,163,111,0.1)`
- Border mais sutil: `1px solid rgba(201,163,111,0.15)`
- Hover: aumento de contraste com luz natural

### 2. Navbar.tsx - A IDENTIDADE
**Problema**: Logo genérica com gradiente de IA.

**Solução**:
- Remover gradiente. Usar verde-velvet (#1E4D3E) como background do ícone
- Texto "CINEMATCH" em cinza-oso com leve brilho
- Ou "CINEMA" em dourado com "MATCH" em cinza

### 3. globals.css - A BASE
**Problema**: Design system completo, mas com toques de IA (crimson, ember, reel).

**Solução**:
- Substituir paleta completa
- Manter estrutura, substituir cores e texturas
- Adicionar textura de vinil sutil como background

---

## Botões e CTAs

### Botão Principal: "Dourado Vinil"
```css
.btn-vinyl {
  background: linear-gradient(135deg, #C9A36F 0%, #B8945E 100%);
  color: #0A0A0C;
  border: 1px solid rgba(201, 163, 111, 0.3);
  box-shadow: 0 4px 24px rgba(201, 163, 111, 0.2), 0 0 0 1px rgba(201, 163, 117, 0.1);
}
.btn-vinyl:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 32px rgba(201, 163, 117, 0.3);
}
```

### Botão Secundário: "Cinza Metal"
```css
.btn-metal {
  background: #2D2D33;
  color: #F0E6D2;
  border: 1px solid #5A5A5A;
}
.btn-metal:hover {
  background: #3A3A40;
  border-color: #C9A36F;
  color: #F0E6D2;
}
```

---

## Animações Autênticas

### "Projector Flicker" - Sutil piscar de luz
```css
@keyframes projectorFlicker {
  0%, 100% { opacity: 1; }
  5% { opacity: 0.98; }
  15% { opacity: 1.02; }
  25% { opacity: 0.99; }
  95% { opacity: 1.01; }
}

.film-grain-authentic {
  animation: projectorFlicker 3s infinite;
}
```

---

## Checklist de "NÃO é IA"

- [ ] Substituir todos os gradientes por cores sólidas ou sprites sazonais
- [ ] Remover animações de "pulsação" genéricas
- [ ] Usar texturas reais de filme (não algoritmos de ruído)
- [ ] Tipografia única, não padrões de empresa
- [ ] Paleta baseada no tema, não em tendências atuais
- [ ] Microinterações com narrativa (como se o cinema "respondesse")

---

## Implementação

1. **globals.css** - Atualizar paleta e texturas base
2. **Navbar.tsx** - Redesenhar logo e navegação
3. **MovieCard.tsx** - Novo visual de filme
4. **Homepage** - Hero e seções reimaginadas
5. **Componentes UI** - Botões, badges novos
6. **Animation** - CSS new keyframes autênticos

---

## Resultado Esperado

Um sistema que:
- Não se parece com nenhum outro serviço de streaming
- Inspira confiança de curadoria especializada
- Cada filme parece ter sido escolhido com cuidado editorial
- A experiência toda respira "sala de cinema privada"