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
  trash: Card[] = [];
  deckRemaining: number;

  constructor(
    public navCtrl: NavController,
    private gameService: GameService
  ) {
  }

  ngOnInit() {
    this.gameService.myPlayer.sub.subscribe(data => {
      if(data) {
        this.playerCards = data.cards;
      }
    });
    this.gameService.trash.subscribe(data => this.trash = data);
    this.gameService.deckRemaining.subscribe(data => this.deckRemaining = data);
    this.gameService.init();
  }

  drawCard() {
    console.log('i wanna draw a card');
  }

  pickupCard() {
    console.log('i wanna pick a card');
  }

  throwCard(card: Card) {
    this.gameService.throwCard(card);
  }

}
