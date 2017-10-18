import { Component, OnInit } from '@angular/core';
import { Platform } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

import { HomePage } from '../pages/home/home';
import { Player } from '../models/player.model';
import { GameService } from '../services/game.service';

@Component({
  templateUrl: 'app.html'
})
export class MyApp implements OnInit {
  rootPage:any = HomePage;

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
  constructor(
    platform: Platform,
    statusBar: StatusBar,
    splashScreen: SplashScreen,
    private gameService: GameService
  ) {
    platform.ready().then(() => {
      statusBar.styleDefault();
      splashScreen.hide();
    });
  }

  ngOnInit() {
    this.gameService.myPlayer.sub.subscribe(data => {
      if(data) {
        this.player = data;
      }
    });
  }
}
