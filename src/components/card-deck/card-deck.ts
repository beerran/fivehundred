import { Component, Input, EventEmitter, Output } from '@angular/core';
import { Card } from '../../models/card.model';


@Component({
  selector: 'card-deck',
  templateUrl: 'card-deck.html'
})
export class CardDeckComponent {
  @Input() cards: Card[] = [];
  @Output() onCardClick: EventEmitter<Card> = new EventEmitter<Card>();

  constructor() { }

  cardClicked(card: Card) {
    this.cards.splice(this.cards.indexOf(card), 1);
    this.onCardClick.emit(card);
  }
}
