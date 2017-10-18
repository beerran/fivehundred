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
            });
            data.sub.unsubscribe();
            this.dealCards();
        }).catch(error => console.log(error));
    }

    resume(id: string) {
        this.currentGame = {
            id: id,
            ref: <firebase.firestore.DocumentReference> this.gamesRef.doc(id).ref,
            observable: <Observable<Game>> this.gamesRef.doc(id).valueChanges()
        };
        this.currentGame.observable.subscribe(data => {
            this.deckRemaining.next(data.deck.length);
            this.trash.next(data.trash);
        });
        this.resumeCards();
    }

    pickupCard() {
        this.currentGame.ref.get().then(data => {
            const trash: Card[] = data.get('trash');

            this.myPlayer.ref.doc('data').ref.get().then(data => {
                const cards: Card[] = data.get('cards');
                if(cards.length > 0 && trash.length > 0) {
                    cards.push(trash.pop());
                    this.myPlayer.ref.doc('data').update({cards: cards});
                    this.currentGame.ref.update({trash: trash});
                }
            });
        });
    }

    drawCard() {
        this.currentGame.ref.get().then(data => {
            const deck: Card[] = data.get('deck');

            this.myPlayer.ref.doc('data').ref.get().then(data => {
                const cards: Card[] = data.get('cards');
                if(cards.length > 0 && deck.length > 0) {
                    cards.push(deck.shift());
                    this.myPlayer.ref.doc('data').update({cards: cards});
                    this.currentGame.ref.update({deck: deck});
                }
            });
        });
    }

    makePlay(chosenCards?: Card[]): Promise<number> {
        return new Promise((resolve, reject) => {
            this.myPlayer.ref.doc('data').ref.get().then(data => {
                const cards: Card[] = data.get('cards');
                const played: Card[] = data.get('played');
                let playedNow: Card[] = [];
                let oldPoints: number = data.get('points');
                let newPoints = 0;

                cards.forEach(c => {
                    const index = chosenCards.findIndex(cc => cc.value === c.value && cc.suit === c.suit);
                    if (index >= 0) {
                        played.push(c);
                        playedNow.push(c);
                        newPoints += this.getPointsForCard(c);
                    }
                });
                playedNow.forEach(p => cards.splice(cards.indexOf(p), 1));
                this.myPlayer.ref.doc('data').update({cards: cards, played: played, points: oldPoints + newPoints})
                .then(() => resolve(newPoints));
            });
        })
    }

    throwCard(card?: Card): Promise<boolean> {
        return new Promise((resolve, reject) => {
            this.myPlayer.ref.doc('data').ref.get().then(data => {
                const cards: Card[] = data.get('cards');
                cards.splice(cards.findIndex(c => c.suit === card.suit && c.value === card.value), 1);
                this.myPlayer.ref.doc('data').update({cards: cards});
                this.currentGame.ref.get().then(data => {
                    this.addCardToTrash(card).then(() => resolve(true));
                });
            })
        })
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

    private resumeCards() {
        this.currentGame.ref.get().then(data => {
            this.myPlayer.ref = this.gamesRef.doc(this.currentGame.id).collection('asd123');
            this.myPlayer.observable = <Observable<Player>> this.myPlayer.ref.doc('data').valueChanges();
            this.myPlayer.observable.subscribe(data => this.myPlayer.sub.next(<Player> data));
        });
    }

    private dealCards() {
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
                });
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

    private addCardToTrash(card: Card): Promise<boolean> {
        return new Promise((resolve, reject) => {
            this.currentGame.ref.get().then(data => {
                const currentTrash = data.get('trash');
                currentTrash.push(card);
                this.currentGame.ref.update({trash: currentTrash}).then(() => {
                    resolve(true);
                });
            });
        })
    }

    private getPointsForCard(card: Card): number {
        if(card.value <= 10) {
            return 5;
        } else if(['J', 'Q', 'K'].indexOf(card.value.toString().toUpperCase()) >= 0) {
            return 10;
        } else if (card.value.toString().toUpperCase() === 'A') {
            return 15;
        } else {
            return 0;
        }
    }

    private fillCards() {
        const cards: Card[] = this.getAllCards();
        cards.forEach(card => {
            this.fireStore.collection('cards').add(card);
        });
    }

    private getAllCards() {
        const allValues = [1,2,3,4,5,6,7,8,9,10,'J','Q','K','A'];
        const allSuits = ['spades', 'diamonds', 'clubs', 'hearts'];
        const cards = [];
        allSuits.forEach(suit => {
            allValues.forEach(value => {
                const x: Card = {
                    suit: suit,
                    value: value
                };
                cards.push(x);
            })
        });
        return cards;
    }
}