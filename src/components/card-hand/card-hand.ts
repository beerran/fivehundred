import { Component, Input } from '@angular/core';
import { Card } from '../../models/card.model';

@Component({
  selector: 'card-hand',
  templateUrl: 'card-hand.html'
})
export class CardHandComponent {
  @Input() cards: Card[] = [];
  @Input() back = false;
  @Input() fan = false;
  
  constructor() { }

  cardClicked(card: Card) {
    window.alert('you chose the ' + Card.GetValue(card.value) + ' of ' + Card.GetSuit(card.suit))
  }
}
