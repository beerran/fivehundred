import { Card } from "./card.model";

export interface Player {
    id: string;
    cards: Card[];
    points: number;
    played: Card[];
}