import { Component, OnInit } from '@angular/core';
import { NavController } from 'ionic-angular';
import { Card } from '../../models/card.model';
import { GameService } from '../../services/game.service';
import { Player } from '../../models/player.model';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage implements OnInit {
  player: Player = {
    cards: [],
    played: [],
    points: 0
  };
  opponent: Player = {
    cards: [],
    played: [],
    points: 0
  };

  trash: Card[] = [];
  deckRemaining: number;

  action = 'play';
  cardsToPlay: Card[] = [];

  constructor(
    public navCtrl: NavController,
    private gameService: GameService
  ) { }

  ngOnInit() {
    this.gameService.myPlayer.sub.subscribe(data => {
      if(data) {
        this.player = data;
      }
    });
    this.gameService.trash.subscribe(data => this.trash = data);
    this.gameService.deckRemaining.subscribe(data => {
      this.deckRemaining = data;      
    });
    this.gameService.init();
    // this.gameService.resume('0ZHy2PxkCgSITgd3hTY0');
  }

  drawCard() {
    this.gameService.drawCard();    
  }
  
  pickupCard() {
    this.gameService.pickupCard();
  }

  makePlay() {
    if (this.action === 'play' && this.cardsToPlay.length >= 2) {
      this.gameService.makePlay(this.cardsToPlay).then(() => this.clearSelectedCards());
    } else if (this.action === 'throw' && this.cardsToPlay.length === 1) {
      this.gameService.throwCard(this.cardsToPlay[0]);
    }
  }

  actOnCard(card: Card) {
    card.selected = !card.selected;

    if (this.action === 'play') {
      this.cardsToPlay.filter(c => c.value !== card.value).forEach(c => {
        const index = this.cardsToPlay.indexOf(c);
        this.cardsToPlay.splice(index, 1);
        c.selected = false;
      });
    } else {
      this.clearSelectedCards();
    }

    if (card.selected) {
      this.cardsToPlay.push(card);
    }
  }

  clearSelectedCards() {
    this.cardsToPlay.forEach(c => c.selected = false);
    this.cardsToPlay = [];
  }
}
