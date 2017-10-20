import { Component, Input, OnInit, EventEmitter, Output } from '@angular/core';
import { Card } from '../../models/card.model';

@Component({
  selector: 'playing-card',
  templateUrl: 'playing-card.html'
})
export class PlayingCardComponent implements OnInit {
  @Input() card: Card;
  @Input() back = false;
  @Output() onCardClick: EventEmitter<Card> = new EventEmitter<Card>(null);  
  
  private suitIcon: string;
  constructor() { }

  getClasses() {
    let cssClass = this.back ? 'back' : `rank-${this.card.value} ${this.card.suit}`;
    cssClass += this.card.selected ? ' selected' : '';
    return cssClass;
  }

  ngOnInit() {
    switch(this.card.suit) {
      case 'diamonds':        
        this.suitIcon = '♦';
        break;
      case 'hearts':
        this.suitIcon = '♥';
        break;
      case 'spades':
        this.suitIcon = '♠';
        break;
      case 'clubs':
        this.suitIcon = '♣';
        break;
      default:
        this.suitIcon = '';
    }
  }

  cardClicked(card: Card, event: any) {
    event.preventDefault();
    this.onCardClick.emit(card)
  }

}