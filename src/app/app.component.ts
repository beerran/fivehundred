import { Component, OnInit } from '@angular/core';
import { Platform } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

import { HomePage } from '../pages/home/home';
import { Player, Opponent } from '../models/player.model';
import { GameService } from '../services/game.service';
import { LoadingService } from '../services/loading.service';

@Component({
  templateUrl: 'app.html'
})
export class MyApp implements OnInit {
  rootPage:any = HomePage;

  player: Player = {
    id: '',
    cards: [],
    played: [],
    points: 0
  };
  opponent: Opponent = {
    id: '',
    cardCount: 0,
    played: [],
    points: 0
  };

  isLoading = null;

  constructor(
    private platform: Platform,
    private statusBar: StatusBar,
    private splashScreen: SplashScreen,
    private gameService: GameService,
    private loadingService: LoadingService
  ) { }

  ngOnInit() {
    this.platform.ready().then(() => {
      this.statusBar.styleDefault();
      this.splashScreen.hide();
    });

    this.gameService.myPlayer.sub.subscribe(data => {
      if(data) {
        this.player = data;
      }
    });
    this.gameService.opponent.subscribe(data => {
      if(data) {
        this.opponent = data;
      }
    });

    this.loadingService.loadingActive.subscribe(data => this.isLoading = data);
  }
}
