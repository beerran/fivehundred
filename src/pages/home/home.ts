import { Component, OnInit } from '@angular/core';
import { NavController } from 'ionic-angular';
import { Card } from '../../models/card.model';
import { GameService } from '../../services/game.service';
import { Player, Opponent } from '../../models/player.model';
import { trigger, style, animate, transition, keyframes, state } from '@angular/animations';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html',
  animations: [
    trigger('pointsAnimation', [
      state('show', style({ opacity: 1, transform: 'scale(1.5) translateX(-5px) translateY(-10px) rotate(-15deg)' })),
      state('hide', style({ opacity: 0 })),
      transition('* => show', [
        animate(500, keyframes([
          style({opacity: 0, offset: 0}),          
          style({opacity: 1, transform: 'scale(1.5) translateX(-5px) translateY(-10px) rotate(-15deg)', offset: 1.0})
        ]))
      ]),
      transition('show => hide', [
        animate(300, keyframes([
          style({opacity: 1, offset: 0}),
          style({opacity: 0, offset: 1.0})
        ]))
      ])
    ])
  ]
})
export class HomePage implements OnInit {
  player: Player = {
    cards: [],
    played: [],
    points: 0
  };
  opponent: Opponent = {
    cardCount: 0,
    played: [],
    points: 0
  };

  trash: Card[] = [];
  deckRemaining: number;
  showPoints = 'hide';

  action = 'play';
  cardsToPlay: Card[] = [];
  pointsAdded = 0;

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
    this.gameService.opponent.subscribe(data => {
      if(data) {
        this.opponent = data;
      }
    })
    this.gameService.trash.subscribe(data => this.trash = data);
    this.gameService.deckRemaining.subscribe(data => {
      this.deckRemaining = data;      
    });
    //this.gameService.init();
    this.gameService.resume('ybzVGmWnwk8bX5CkedFb');
  }

  drawCard() {
    this.gameService.drawCard();    
  }
  
  pickupCard() {
    this.gameService.pickupCard();
  }

  makePlay() {
    if (this.action === 'play' && this.cardsToPlay.length >= 2) {
      this.cardsToPlay.forEach(c => c.state = 'inactive');
      setTimeout(() => {
        this.gameService.makePlay(this.cardsToPlay).then((points) => {
          this.pointsAdded = points;
          this.clearSelectedCards();
          this.showPoints = 'show';
          setTimeout(() => this.showPoints = 'hide', 500);
        });
      }, 500);      
    } else if (this.action === 'throw' && this.cardsToPlay.length === 1) {
      this.cardsToPlay.forEach(c => c.selected = false);
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
