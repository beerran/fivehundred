import { Card } from "./card.model";
import { Player } from "./player.model";

export interface Game {
    player1: string;
    player2: string;
    deck: Card[];
    trash: Card[];
}