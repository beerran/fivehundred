import { Component, Input, EventEmitter, Output } from '@angular/core';
import { Card } from '../../models/card.model';

@Component({
  selector: 'card-hand',
  templateUrl: 'card-hand.html'
})
export class CardHandComponent {
  @Input() cards: Card[] = [];
  @Input() back = false;
  @Input() fan = false;
  @Output() onCardClick: EventEmitter<Card> = new EventEmitter<Card>();
  
  constructor() { }

  cardClicked(card: Card) {
    this.onCardClick.emit(card);    
  }
}
