import { Card } from "./card.model";

export interface Player {
    cards: Card[];
    points: number;
    played: Card[];
}