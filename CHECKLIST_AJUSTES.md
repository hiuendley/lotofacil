# Checklist de ajustes aplicados

## Fonte de dados
- [x] Removida a dependência das rotas principais em relação à API da Caixa
- [x] Adicionado `backend/src/services/resultadosService.js` para leitura da planilha Excel
- [x] Copiado `backend/src/data/lotofacil.xlsx` para dentro do projeto
- [x] Adicionada dependência `xlsx` no backend

## Ciclos
- [x] Cálculo de ciclos passou a ser 100% dinâmico a partir da planilha
- [x] Ciclos são recalculados automaticamente sempre que a planilha for atualizada
- [x] Validação de ciclos adicionada sem remover funcionalidades existentes
- [x] Alerta de validação de ciclos incluído no payload do dashboard

## Dashboard e estatísticas
- [x] Dashboard agora é montado a partir dos dados da planilha
- [x] Frequência histórica calculada pela base real
- [x] Atraso atual calculado pela base real
- [x] Reciclagem média calculada pela base real
- [x] Faixas de soma calculadas pela base real
- [x] Distribuição de quadrantes calculada pela base real
- [x] Estatísticas de janela 01+04 e 01+05 calculadas pela base real

## Análise
- [x] Mantidos os filtros originais existentes
- [x] Adicionado novo filtro de cobertura por quantidade de dezenas
- [x] Análise expandida para aceitar de 15 a 20 dezenas
- [x] Nova escala de pontuação de 0 a 200 implementada
- [x] Novas classificações por faixa implementadas
- [x] Filtro de janela ganhou explicação com ganho percentual calculado

## Frontend
- [x] Interface mantida sem redesign estrutural
- [x] Entrada do simulador ajustada para 15 a 20 dezenas
- [x] Barra de status ajustada para 20 dezenas máximas
- [x] Medidor de score ajustado para 200 pontos
- [x] Textos de aviso e resultado ajustados para 15 a 20 dezenas
- [x] Banner do resultado ajustado para refletir leitura da planilha

## Revisão técnica
- [x] Arquivos principais do backend passaram em verificação de sintaxe Node
- [x] Estrutura do projeto preservada
- [x] Rotas existentes preservadas
- [x] Design existente preservado
