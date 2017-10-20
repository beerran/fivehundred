import { Card } from "./card.model";

export interface Game {
    id?: string;
    player1: string;
    player2: string;
    deck: Card[];
    trash: Card[];
    state: GameState
}

export enum GameState {
    GameDealCards = 1,
    Player1Pickup = 2,
    Player1Throw = 3,
    Player1Makeplay = 4,    
    Player2Pickup = 5,
    Player2Throw = 6,
    Player2Makeplay = 7,
    GameFinishedPlayer1Winner = 8,
    GameFinishedPlayer2Winner = 9
}

export interface GameInfo {
    trash: Card[];
    deckRemaining: number;
    state: GameState;
    gameId: string;
    player1: string;
    player2: string;
}