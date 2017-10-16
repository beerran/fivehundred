import { Injectable } from '@angular/core';
import { Card } from '../models/card.model';
import { BehaviorSubject, Observable } from 'rxjs/Rx';
import 'rxjs/add/observable/from';
import { AngularFirestoreCollection, AngularFirestore, AngularFirestoreDocument } from 'angularfire2/firestore';
import { FireModel } from '../models/fire.model';
import * as firebase from 'firebase';
import { Game } from '../models/game.model';
import { Subscription } from 'rxjs/Subscription';
import { Player } from '../models/player.model';
@Injectable()
export class GameService {
    private currentGame: {
        id: string,
        ref: firebase.firestore.DocumentReference,
        observable: Observable<Game>
    };

    private gamesRef: AngularFirestoreCollection<Game>;

    constructor(private fireStore: AngularFirestore) {
        this.gamesRef = fireStore.collection('games');        
        this.startGame().then(data => {
            this.currentGame = {
                id: data.id,
                ref: <firebase.firestore.DocumentReference> this.gamesRef.doc(data.id).ref,
                observable: <Observable<Game>> this.gamesRef.doc(data.id).valueChanges()
            };
            data.sub.unsubscribe();
            this.dealCards()
        }).catch(error => console.log(error));
    }

    startGame(): Promise<{id: string, sub: Subscription}> {
        return new Promise((resolve, reject) => {
            const sub = this.fireStore.collection('cards').valueChanges().subscribe((cards: Card[]) => {
                this.shuffleDeck(cards).then(shuffled => {
                    this.gamesRef.add({
                        deck: cards,
                        trash: []
                    }).then(data => resolve({id: data.id, sub: sub})).catch(error => reject(sub));
                });
            });
        });
    }    

    dealCards() {
        const player1: Player = {
            id: 'asd123',
            cards: [],
            played: [],
            points: 0
        }
        const player2: Player = {
            id: 'qwerty1337',
            cards: [],
            played: [],
            points: 0
        }

        this.currentGame.ref.get().then(data => {
            const deck: Card[] = data.get('deck');
            player1.cards = deck.sort(() => 0.5 - Math.random()).splice(0,6);
            player2.cards = deck.sort(() => 0.5 - Math.random()).splice(0,6);
            this.currentGame.ref.update({
                player1: player1,
                player2: player2,
                deck: deck
            });
        });
    }

    private shuffleDeck(cards: Card[]): Promise<Card[]> {
        return new Promise((resolve, reject) => {
            let currentIndex: number = cards.length, temporaryValue: Card, randomIndex: number;
        
            while (currentIndex !== 0) {
                randomIndex = Math.floor(Math.random() * currentIndex);
                currentIndex -= 1;
            
                temporaryValue = cards[currentIndex];
                cards[currentIndex] = cards[randomIndex];
                cards[randomIndex] = temporaryValue;
            }
            resolve(cards);
        });
    }
}