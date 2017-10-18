import { Card } from "./card.model";

export interface Player extends Part {
    cards: Card[];
}

export interface Opponent extends Part {
    cardCount: number;
}

interface Part {
    points: number;
    played: Card[];
}