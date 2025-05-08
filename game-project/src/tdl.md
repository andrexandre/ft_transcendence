// Análise crítica e refactor proposto
// ============================

// ✅ OK: "difficulty" é enviada corretamente e o fallback é gerido.
// ✅ OK: Dados do utilizador globalmente acessíveis por "window.appUser"
// ❌ Problemas encontrados:
// ===========================================

<!-- // 1. ❌ Redundância na renderização do torneio (duas funções parecidas em "tournamentRender" e "rendering")
// Sugestão: centralizar função de renderização para evitar duplicação de lógica

// 2. ❌ Uso de sessionStorage.getItem("username") no fim do jogo, mas já não é usado em mais nenhum lado
// Sugestão: substituir por `(window as any).appUser.user_name`

// 3. ❌ Injeção de torneio só é feita quando tournamentState.rounds.length === 0, mas não há sinalização de torneios seguintes
// Sugestão: atualizar tournamentState também no `handleMatchEndFromTournament`

// 4. ❌ Estrutura tournamentState duplicada entre rendering.ts e tournamentRender.ts
// Sugestão: mover para ficheiro comum (ex: `tournamentState.ts`)

// 5. ❌ Função `renderTournamentBracket` está duplicada e levemente diferente
// Sugestão: exportar uma única versão unificada com estilo e markup consistentes -->

// 6. ❌ currentUserId depende de window.appUser, mas não é validado globalmente
// Sugestão: cria helper seguro:
export function getCurrentUserId(): number | null {
  return (window as any)?.appUser?.user_id ?? null;
}

// 7. ⚠️ No `handleMatchEndFromTournament`, não há `renderTournamentBracket` para atualização visual de rondas seguintes
// Sugestão: notificar front via WebSocket ou trigger de atualização (event-driven ou polling)

// 8. ❌ Inconsistência de nomes: 
// - `user_name` no backend
// - `username` no frontend
// Sugestão: usar **só `username`** em todos os pontos para consistência

// 9. ⚠️ `tournament.matches[tournament.currentRound]` pode falhar se index inexistente
// Sugestão: validar `if (!round) return;`

// 10. ❌ `matchStartGame()` chamado localmente após criar lobby para 1 jogador - mas no caso do torneio isso é gerido por backend. Evitar conflito.

// 11. ❌ Código misturado de WebSocket com renderização sem separação de responsabilidades (SRP)
// Sugestão: extrair listeners de matchSocket em módulo separado: `matchSocketHandlers.ts`

// 12. ❌ Na função connectToMatch, `data.gameMode` é lido sem garantir tipo === "welcome"
// Sugestão: validar tipo antes de acessar propriedades (evita erro em modos sem `gameMode`)

// 13. ⚠️ Falta tratamento de erro ou feedback para torneios com jogadas automáticas ou jogadores ausentes
// Sugestão: adicionar timeout de resposta ou fallback bot para evitar bloqueio do torneio

// =============================
// ✅ Em resumo, para tornar o código mais robusto:
// -----------------------------
// - Centralizar estado do torneio (tournamentState)
// - Unificar `renderTournamentBracket`
// - Criar helpers globais tipo getCurrentUser()
// - Validar todos os acessos a estruturas complexas (gameMode, socket, match, user)
// - Refatorar handlers de WebSocket em ficheiro próprio
// - Atualizar torneioview após `handleMatchEndFromTournament`

// Desejas que eu comece por mover o estado e renderização do torneio para um módulo dedicado e unificado?
