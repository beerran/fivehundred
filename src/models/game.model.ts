import { Card } from "./card.model";
import { Player } from "./player.model";

export interface Game {
    player1?: Player;
    player2?: Player;
    deck: Card[];
    trash: Card[];
}