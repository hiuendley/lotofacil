# 🍀 Mentalidade de Sorte — Analisador Estatístico da Lotofácil

> **Aposte com lógica, não apenas com sorte.**

Aplicação full-stack com backend Node.js/Express e frontend React/Vite para análise estatística de jogos da Lotofácil.

---

## 📁 Estrutura do Projeto

```
lotofacil/
├── backend/
│   ├── src/
│   │   ├── server.js                  ← Ponto de entrada (Express)
│   │   ├── routes/
│   │   │   └── lotofacil.js           ← Definição de rotas
│   │   ├── controllers/
│   │   │   └── lotofacilController.js ← Recebe requests, valida, delega
│   │   ├── services/
│   │   │   ├── caixaService.js        ← Busca resultado real (API Caixa + cache)
│   │   │   ├── statsService.js        ← Dados históricos estáticos (somente-leitura)
│   │   │   └── scoreService.js        ← Motor de análise — função pura
│   │   └── utils/
│   │       └── lotofacilCalc.js       ← Cálculos matemáticos puros
│   ├── .env.example
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx                    ← Componente raiz
│   │   ├── main.jsx                   ← Entry point React
│   │   ├── index.css                  ← Todos os estilos (sem CSS-in-JS)
│   │   ├── components/
│   │   │   ├── Ajuda.jsx              ← Modal explicativo (?)
│   │   │   ├── Aviso.jsx              ← Alerta "faça a simulação primeiro"
│   │   │   ├── BannerResultado.jsx    ← Último resultado ao vivo
│   │   │   ├── Bola.jsx               ← Dezena clicável
│   │   │   ├── Dica.jsx               ← Caixa de dica dourada
│   │   │   ├── FiltroCard.jsx         ← Card expansível de filtro
│   │   │   ├── ScoreMeter.jsx         ← Medidor circular de pontuação
│   │   │   ├── TabSimulador.jsx       ← Aba "Meu Jogo"
│   │   │   ├── TabResultado.jsx       ← Aba "Resultado"
│   │   │   └── TabEstatisticas.jsx    ← Abas "Frequência" e "Estatísticas"
│   │   ├── hooks/
│   │   │   ├── useDashboard.js        ← Carrega dashboard da API
│   │   │   └── useSimulador.js        ← Gerencia seleção e análise
│   │   ├── services/
│   │   │   └── api.js                 ← Única camada de chamadas ao backend
│   │   └── utils/
│   │       └── formatters.js          ← Formatação de números e datas
│   ├── index.html
│   ├── vite.config.js                 ← Proxy /api → backend em dev
│   ├── .env.example
│   └── package.json
│
└── README.md
```

---

## 🚀 Como rodar localmente

### Pré-requisitos
- Node.js >= 18
- npm >= 9

### 1. Instalar dependências

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Configurar variáveis de ambiente

```bash
# Backend
cd backend
cp .env.example .env
# Edite .env se necessário (padrão: PORT=3001)

# Frontend
cd ../frontend
cp .env.example .env
# Em desenvolvimento, VITE_API_BASE_URL fica vazio (proxy do Vite cuida disso)
```

### 3. Rodar em modo desenvolvimento

Abra **dois terminais**:

```bash
# Terminal 1 — Backend
cd backend
npm run dev
# Rodando em http://localhost:3001

# Terminal 2 — Frontend
cd frontend
npm run dev
# Rodando em http://localhost:5173
```

Acesse: **http://localhost:5173**

---

## 📡 Endpoints da API

| Método | Rota                          | Descrição                                      |
|--------|-------------------------------|------------------------------------------------|
| GET    | `/health`                     | Health check                                   |
| GET    | `/api/lotofacil/ultimo`       | Último resultado oficial (cache 10min)         |
| GET    | `/api/lotofacil/dashboard`    | Estatísticas históricas + último resultado     |
| POST   | `/api/lotofacil/analisar`     | Analisa 15 dezenas e retorna score + filtros   |

### Exemplo POST `/api/lotofacil/analisar`

**Request:**
```json
{
  "dezenas": [1, 3, 5, 7, 9, 11, 13, 15, 17, 18, 20, 21, 22, 24, 25]
}
```

**Response:**
```json
{
  "dezenas": [1, 3, 5, ...],
  "score": 78,
  "classificacao": { "label": "BOM", "emoji": "✅", "descricao": "..." },
  "resumo": { "aprovados": 6, "atencao": 2, "reprovados": 1, "total": 9 },
  "filtros": [
    {
      "id": 1,
      "nome": "Soma dos Números",
      "status": "aprovado",
      "valor": "Soma total = 190",
      "detalhe": "✔ Ótimo! Sua soma está na faixa mais frequente.",
      "faixa": "Zona ideal: 180–210",
      "explicacao": "..."
    }
  ]
}
```

---

## 🌐 Deploy no Hostinger (Node.js)

### Backend

1. Faça upload da pasta `backend/` para o Hostinger via Git ou painel.

2. No painel Node.js do Hostinger, configure:
   - **Entry point:** `src/server.js`
   - **Node version:** 18+

3. Configure as variáveis de ambiente no painel:
   ```
   NODE_ENV=production
   FRONTEND_URL=https://seudominio.com.br
   ```
   > O Hostinger define `PORT` automaticamente — não precisa configurar.

4. No terminal do Hostinger:
   ```bash
   cd backend
   npm install --omit=dev
   npm start
   ```

### Frontend

1. Gere o build de produção:
   ```bash
   cd frontend
   # Configure o .env de produção:
   echo "VITE_API_BASE_URL=https://api.seudominio.com.br" > .env
   npm run build
   ```

2. Faça upload da pasta `frontend/dist/` para o **public_html** do Hostinger.

3. Crie um arquivo `.htaccess` no `public_html` para SPA:
   ```apache
   Options -MultiViews
   RewriteEngine On
   RewriteCond %{REQUEST_FILENAME} !-f
   RewriteRule ^ index.html [QSA,L]
   ```

### Proxy reverso (Nginx no Hostinger)

Se o Hostinger permitir configuração Nginx, adicione no bloco `server`:

```nginx
location /api/ {
    proxy_pass http://localhost:3001/api/;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
}
```

Com isso, o frontend em `seudominio.com.br` acessa `/api/` e o Nginx redireciona para o backend local.

---

## 🔄 Filtros implementados

| ID  | Nome                              | Peso  | O que analisa                            |
|-----|-----------------------------------|-------|------------------------------------------|
| F1  | Soma dos Números                  | 20pts | Soma das 15 dezenas (ideal: 180–210)     |
| F2  | Equilíbrio Pares/Ímpares          | 15pts | Proporção pares x ímpares                |
| F3  | Números em Sequência              | 15pts | Agrupamentos consecutivos                |
| F4  | Ciclo das Dezenas                 | 15pts | Dezenas pendentes no ciclo atual         |
| F5  | Dezenas Atrasadas                 | 10pts | Dezenas sem aparecer há muito tempo      |
| F6  | Padrão de Janela (01+04/01+05)    | 10pts | Presença de padrão de janela             |
| F7  | Reciclagem do Último Sorteio      | 15pts | Repetição de números do último concurso  |
| F9  | Distribuição nas Regiões          | 12pts | Equilíbrio entre as 5 regiões do volante |
| F10 | Espalhamento (Desvio Padrão σ)    | 13pts | Dispersão matemática das dezenas         |

**Score máximo:** 125 pts | **Classificação:** Excelente (≥95) / Bom (≥75) / Regular (≥55) / Fraco (<55)

---

## ⚙️ Atualização dos dados históricos

Os dados em `backend/src/services/statsService.js` devem ser atualizados manualmente
(ou via script) quando:

- Um novo ciclo for concluído → atualizar `cicloAtual`, `cicloAnterior`, `dezenasFaltantesCiclo`
- Os atrasos mudarem significativamente → atualizar `atrasoAtual`

**Fonte de referência:** [Mazusoft Lotofácil](https://www.mazusoft.com.br/lotofacil)

---

## 🛡️ Segurança e boas práticas

- CORS configurado por origem — produção só aceita `FRONTEND_URL`
- Validação completa de entrada no controller (15 dezenas, inteiros 1–25, sem repetição)
- Cache de 10 minutos na API da Caixa (evita rate limiting)
- Sem mutação de estado global — todos os dados dinâmicos passam por parâmetro
- CSS em arquivo separado — sem injeção via JavaScript

---

## 📝 Licença

Projeto privado — Mentalidade de Sorte © 2024. Todos os direitos reservados.
