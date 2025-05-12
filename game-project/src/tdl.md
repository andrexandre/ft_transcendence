// Análise crítica
// ❌ Problemas encontrados:
// ===========================================

// 7. ⚠️ No `handleMatchEndFromTournament`, não há `renderTournamentBracket` para atualização visual de rondas seguintes

// 12. ❌ Na função connectToMatch, `data.gameMode` é lido sem garantir tipo === "welcome"
// Sugestão: validar tipo antes de acessar propriedades (evita erro em modos sem `gameMode`)

// 13. ⚠️ Falta tratamento de erro ou feedback para torneios com jogadas automáticas ou jogadores ausentes
// Sugestão: adicionar timeout de resposta ou fallback bot para evitar bloqueio do torneio

