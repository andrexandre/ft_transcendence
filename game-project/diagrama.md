# 🕹️ Pongify - Fluxo de Single/Multiplayer

## 📋 Fluxo resumido:

1. **Utilizador clica** em "Classic" no menu.
2. Frontend chama:
   - `createLobby("Single", 1)`
3. Frontend envia para o servidor (via WebSocket `game-ws`):
   - `{ type: "create-lobby", gameMode: "Single", maxPlayers: 1 }`
4. **Servidor**:
   - Cria lobby (`status: waiting`)
   - Envia resposta `{ type: "lobby-created", lobbyId, maxPlayers }`
5. **Frontend**:
   - Recebe `lobby-created`
   - Se `maxPlayers === 1`, chama `matchStartGame()` automaticamente.
6. Frontend envia para o servidor:
   - `{ type: "start-game", lobbyId, requesterId }`
7. **Servidor**:
   - Valida se o requester é o host e se o lobby está cheio.
   - Cria `matchId`, marca lobby como `in-game`.
   - Envia `{ type: "game-start", gameId, playerRole }` para o player.
8. **Frontend**:
   - Recebe `game-start`.
   - Abre nova conexão WebSocket para `/match-ws?gameId=...`.
   - Chama `connectToMatch(socket, role)`.
9. **Rendering**:
   - Esconde menu, inicializa canvas (`initGameCanvas()`), ativa controlos (`setupControls()`).
   - Inicia Countdown e depois começa o jogo!

---

## 📂 Detalhes Importantes:

- No modo **SinglePlayer**:
  - O servidor **adiciona automaticamente** o bot "BoTony" no lado oposto.
  - Bot é controlado no `updateMatchState()` no servidor.

- O processo de `start-game` é **igual** para Single e Multiplayer:  
  Apenas o servidor é que decide internamente se adiciona o bot ou não.

---

## 🛠️ Resumo de chamadas principais:

| Acontecimento        | Função Frontend             | Resultado Backend                |
|----------------------|------------------------------|-----------------------------------|
| Click em "Classic"    | `createLobby("Single", 1)`    | Cria lobby esperando jogadores    |
| Lobby criado          | `matchStartGame()`            | Inicia partida automaticamente    |
| Game start enviado    | `connectToMatch(matchSocket, role)` | Cria ligação `/match-ws`       |
| Match iniciado        | Canvas + Controls ativados   | Atualizações de jogo via WebSocket |

---

# ✅ Fim do Fluxo
