import { Component, OnInit } from '@angular/core';
import { NavController } from 'ionic-angular';
import { Card } from '../../models/card.model';
import { GameService } from '../../services/game.service';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage implements OnInit {
  playerCards: Card[] = [];
  opponentCards: Card[] = [];
  deckCards: Card[] = [];

  constructor(
    public navCtrl: NavController,
    private gameService: GameService
  ) {
  }

  ngOnInit() {
    // this.cardService.getOpponentCards().subscribe(data => {
    //   this.opponentCards = data;
    // });

    // this.cardService.getMyCards().subscribe(data => {
    //   this.playerCards = data;
    // });

    // this.cardService.getDeck().subscribe(data => {
    //   this.deckCards = data;
    //   this.cardService.drawCards();
    // });
  }

  cardFromDeck(card: Card) {
    alert('you chose the ' + Card.GetValue(card.value) + ' of ' + card.suit);
  }

}
