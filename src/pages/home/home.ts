import { Component, OnInit } from '@angular/core';
import { NavController } from 'ionic-angular';
import { Card } from '../../models/card.model';
import { GameService } from '../../services/game.service';
import { Player, Opponent } from '../../models/player.model';
import { trigger, style, animate, transition, keyframes, state } from '@angular/animations';
import { GameState, GameInfo } from '../../models/game.model';
import { LoadingService } from '../../services/loading.service';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html',
  animations: [
    trigger('pointsAnimation', [
      state('show', style({ opacity: 1, transform: 'scale(1.5) translateX(-5px) translateY(-10px) rotate(-15deg)' })),
      state('hide', style({ opacity: 0 })),
      transition('* => show', [
        animate(500, keyframes([
          style({ opacity: 0, offset: 0 }),
          style({ opacity: 1, transform: 'scale(1.5) translateX(-5px) translateY(-10px) rotate(-15deg)', offset: 1.0 })
        ]))
      ]),
      transition('show => hide', [
        animate(300, keyframes([
          style({ opacity: 1, offset: 0 }),
          style({ opacity: 0, offset: 1.0 })
        ]))
      ])
    ])
  ]
})
export class HomePage implements OnInit {
  player: Player = {
    id: 'asd123',
    cards: [],
    played: [],
    points: 0
  };
  opponent: Opponent = {
    id: 'qwerty1337',
    cardCount: 0,
    played: [],
    points: 0
  };

  gameInfo: GameInfo = {
    trash: [],
    deckRemaining: 0,
    gameId: '',
    player1: '',
    player2: '',
    state: 0
  }

  showPoints = 'hide';

  action = 'play';
  cardsToPlay: Card[] = [];
  pointsAdded = 0;
  gameWon: boolean;

  actionsDisabled = false;

  constructor(
    public navCtrl: NavController,
    private gameService: GameService
  ) { }

  ngOnInit() {
    this.gameService.myPlayer.sub.subscribe(data => {
      if (data) {
        this.player = data;
        this.action = this.inState('MyThrowTurn') ? 'throw' : 'play';
      }
    });

    this.gameService.opponent.subscribe(data => {
      if (data) {
        this.opponent = data;
      }
    })

    this.gameService.currentGame.trash.subscribe(data => this.gameInfo.trash = data);
    this.gameService.currentGame.deckRemaining.subscribe(data => this.gameInfo.deckRemaining = data);

    this.gameService.currentGame.player1.subscribe(data => this.gameInfo.player1 = data);
    this.gameService.currentGame.player2.subscribe(data => this.gameInfo.player2 = data);
    this.gameService.currentGame.state.subscribe(data => {
      this.gameInfo.state = <GameState> data;
      this.action = this.inState('MyThrowTurn') ? 'throw' : 'play';

      console.log(this.gameInfo.state);

      if ([GameState.GameFinishedPlayer1Winner, GameState.GameFinishedPlayer2Winner].indexOf(this.gameInfo.state) >= 0) {
        this.renderGameOverNotification();
      }
    });

    //this.gameService.fillCards();
    this.gameService.init();
    //this.gameService.resume('umkihmni6vP5D7fdMos9');
  }

  drawCard() {
    this.actionsDisabled = true;
    this.gameService.drawCard().then(() => this.actionsDisabled = false);
  }

  pickupCard() {
    this.actionsDisabled = true;
    this.gameService.pickupCard().then(() => this.actionsDisabled = false);
  }

  passTurn() {
    this.gameService.passTurn();
  }

  devSwitch() {
    this.gameService.devSwitch();
  }

  inState(stateName: string) {
    let conditionAchieved = this.gameInfo.state === GameState[stateName];
    if (this.player.id === this.gameInfo.player1) {

      if (stateName === 'MyPlayTurn') {
        conditionAchieved = this.gameInfo.state === GameState.Player1Makeplay;
      } else if (stateName === 'MyThrowTurn') {
        conditionAchieved = this.gameInfo.state === GameState.Player1Throw;
      } else if (stateName === 'MyPickupTurn') {
        conditionAchieved = this.gameInfo.state === GameState.Player1Pickup;
      }
    } else if (this.player.id === this.gameInfo.player2) {
      if (stateName == 'MyPlayTurn') {
        conditionAchieved = this.gameInfo.state === GameState.Player2Makeplay;
      } else if (stateName == 'MyThrowTurn') {
        conditionAchieved = this.gameInfo.state === GameState.Player2Throw;
      } else if (stateName === 'MyPickupTurn') {
        conditionAchieved = this.gameInfo.state === GameState.Player2Pickup;
      }
    }

    return conditionAchieved;
  }

  getState() {
    return `${GameState[this.gameInfo.state]} : ${this.gameInfo.state}`;
  }

  makePlay() {
    if (this.action === 'play' && (this.cardsToPlay.length >= 3 || this.alreadyInPlayed(this.cardsToPlay[0]))) {
      this.actionsDisabled = true;
      this.cardsToPlay.forEach(c => c.state = 'inactive');
      setTimeout(() => {
        this.gameService.makePlay(this.cardsToPlay).then((points) => {
          this.pointsAdded = points;
          this.clearSelectedCards();
          this.showPoints = 'show';
          this.actionsDisabled = false;
          setTimeout(() => this.showPoints = 'hide', 500);
        });
      }, 500);
    } else if (this.action === 'throw' && this.cardsToPlay.length === 1) {
      this.actionsDisabled = true;
      this.cardsToPlay.forEach(c => c.selected = false);
      this.gameService.throwCard(this.cardsToPlay[0]).then((cardsThrown) => {
        cardsThrown ? this.clearSelectedCards() : this.cardsToPlay[0].selected = true;
        this.actionsDisabled = false;
      });
    }
  }

  alreadyInPlayed(card: Card) {
    return this.player.played.filter(c => c.value === card.value).length > 0;
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

  renderGameOverNotification() {
    if (this.gameInfo.player1 === this.player.id) {
      this.gameInfo.state === GameState.GameFinishedPlayer1Winner ? this.winnerNotification() : this.loserNotification();
    } else {
      this.gameInfo.state === GameState.GameFinishedPlayer2Winner ? this.winnerNotification() : this.loserNotification();
    }
  }

  winnerNotification() {
    this.gameWon = true;
  }

  loserNotification() {
    this.gameWon = false;
  }
}
