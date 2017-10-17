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

    public deckRemaining: BehaviorSubject<number> = new BehaviorSubject(null);
    public trash: BehaviorSubject<Card[]> = new BehaviorSubject(null);
    
    public myPlayer: {
        sub: BehaviorSubject<Player>,
        ref: AngularFirestoreCollection<Player>,
        observable: Observable<Player>
    } = {
        sub: new BehaviorSubject(null),
        ref: null,
        observable: null
    };
    private gamesRef: AngularFirestoreCollection<Game>;

    constructor(private fireStore: AngularFirestore) {
        this.gamesRef = fireStore.collection('games');        
    }

    init() {
        this.startGame().then(data => {
            this.currentGame = {
                id: data.id,
                ref: <firebase.firestore.DocumentReference> this.gamesRef.doc(data.id).ref,
                observable: <Observable<Game>> this.gamesRef.doc(data.id).valueChanges()
            };
            this.currentGame.observable.subscribe(data => {
                this.deckRemaining.next(data.deck.length);
                this.trash.next(data.trash);
            })
            data.sub.unsubscribe();
            this.dealCards();
        }).catch(error => console.log(error));
    }

    throwCard(card?: Card) {
        if (!card) {
            this.myPlayer.ref.doc('data').ref.get().then(data => {            
                const cards = data.get('cards');
                card = cards[0];
                cards.splice(0,1);
                this.myPlayer.ref.doc('data').update({cards: cards});
                this.addCardToTrash(card);          
            });
        } else {
            this.myPlayer.ref.doc('data').ref.get().then(data => {
                const cards: Card[] = data.get('cards');
                cards.splice(cards.indexOf(card, 1));
                this.myPlayer.ref.doc('data').update({cards: cards});
                this.currentGame.ref.get().then(data => {
                    this.addCardToTrash(card);
                });
            })
        }
    }

    private addCardToTrash(card: Card) {
        this.currentGame.ref.get().then(data => {
            const currentTrash = data.get('trash');
            currentTrash.push(card);
            this.currentGame.ref.update({trash: currentTrash});
        });
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
            cards: [],
            played: [],
            points: 0
        }
        const player2: Player = {
            cards: [],
            played: [],
            points: 0
        }

        this.currentGame.ref.get().then(data => {
            const deck: Card[] = data.get('deck');
            player1.cards = deck.sort(() => 0.5 - Math.random()).splice(0,6);
            player2.cards = deck.sort(() => 0.5 - Math.random()).splice(0,6);
            this.currentGame.ref.collection('asd123').doc('data').set(player1)
            .then((data) => {
                this.myPlayer.ref = this.gamesRef.doc(this.currentGame.id).collection('asd123');
                this.myPlayer.observable = <Observable<Player>> this.myPlayer.ref.doc('data').valueChanges();
                this.myPlayer.observable.subscribe(data => this.myPlayer.sub.next(<Player> data));
                this.currentGame.ref.collection('qwerty1337').doc('data').set(player2);
                this.currentGame.ref.update({
                    deck: deck
                }).then(() => this.throwCard());
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