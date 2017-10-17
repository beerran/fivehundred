import { Card } from "./card.model";
import { Player } from "./player.model";

export interface Game {
    deck: Card[];
    trash: Card[];
}