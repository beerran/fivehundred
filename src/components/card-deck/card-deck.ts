import { Component, Input, EventEmitter, Output } from '@angular/core';
import { Card } from '../../models/card.model';


@Component({
  selector: 'card-deck',
  templateUrl: 'card-deck.html'
})
export class CardDeckComponent {
  private amountArray = [];
  @Input('amount')
  set amount(input: number) {
    this.amountArray = [];
    for(let i = 0; i < input; i++) {
      this.amountArray.push(i);
    }
  }
  @Input() cards: Card[] = null;
  @Output() onCardClick: EventEmitter<boolean> = new EventEmitter<boolean>();

  private card = new Card('','');

  constructor() { }

  cardClicked() {        
    this.onCardClick.emit(true);
  }

  getTopTen(array: any[]) {
    return array.length <= 10 ? array : array.splice(array.length - 11, array.length);
  }
}
