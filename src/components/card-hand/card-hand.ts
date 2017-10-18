import { Component, Input, EventEmitter, Output } from '@angular/core';
import { Card } from '../../models/card.model';
import { trigger, style, animate, transition, keyframes, state } from '@angular/animations';

@Component({
  selector: 'card-hand',
  templateUrl: 'card-hand.html',
  animations: [
    trigger('flyInOut', [
      state('inactive', style({ transform: 'translateY(50px)', position: 'absolute', left: 'calc(100% + 3.3em)' })),
      transition('* => inactive', [
        animate(500, keyframes([
          style({opacity: 1, transform: 'translateY(0px)', position:'absolute', offset: 0}),
          style({opacity: 0.4, transform: 'translateY(-20px)', position:'absolute', left: 'calc(40%)', offset: 0.5}),
          style({opacity: 0, transform: 'translateY(50px)', position:'absolute', left: 'calc(100% + 3.3em)', offset: 1.0})
        ]))
      ])
    ])
  ]
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
