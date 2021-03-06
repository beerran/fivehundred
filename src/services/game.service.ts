import { Injectable } from '@angular/core';
import { Card } from '../models/card.model';
import { BehaviorSubject, Observable } from 'rxjs/Rx';
import 'rxjs/add/observable/from';
import { AngularFirestoreCollection, AngularFirestore } from 'angularfire2/firestore';
import * as firebase from 'firebase';
import { Game, GameState } from '../models/game.model';
import { Subscription } from 'rxjs/Subscription';
import { Player, Opponent } from '../models/player.model';
import { LoadingService } from './loading.service';
@Injectable()
export class GameService {
    public currentGame: {
        id: string,
        ref: firebase.firestore.DocumentReference,
        observable: Observable<Game>,
        state?: BehaviorSubject<GameState>,
        deckRemaining?: BehaviorSubject<number>,
        trash?: BehaviorSubject<Card[]>,
        player1?: BehaviorSubject<string>,
        player2?: BehaviorSubject<string>
    } = {
        id: '',
        ref: null,
        observable: null,
        state: new BehaviorSubject(0),
        deckRemaining: new BehaviorSubject(0),
        trash: new BehaviorSubject([]),
        player1: new BehaviorSubject(''),
        player2: new BehaviorSubject('')
    };

    public myPlayer: {
        sub: BehaviorSubject<Player>,
        ref: AngularFirestoreCollection<Player>,
        observable: Observable<Player>
    } = {
        sub: new BehaviorSubject(null),
        ref: null,
        observable: null
    };

    public opponent: BehaviorSubject<Opponent> = new BehaviorSubject({
        id: 'qwerty1337',
        cardCount: 0,
        points: 0,
        played: []
    });

    private gamesRef: AngularFirestoreCollection<Game>;

    constructor(
        private fireStore: AngularFirestore,
        private loadingService: LoadingService
    ) {
        this.gamesRef = fireStore.collection('games');
    }

    init() {
        this.loadingService.updateStatus(true);
        this.startGame().then(data => {
            this.currentGame = {
                ...this.currentGame,
                id: data.id,
                ref: <firebase.firestore.DocumentReference>this.gamesRef.doc(data.id).ref,
                observable: <Observable<Game>>this.gamesRef.doc(data.id).valueChanges()
            };

            this.currentGame.observable.subscribe(data => {
                this.currentGame.deckRemaining.next(data.deck.length);
                this.currentGame.trash.next(data.trash);
                this.currentGame.state.next(data.state);
                this.currentGame.player1.next(data.player1);
                this.currentGame.player2.next(data.player2);
            });
            data.sub.unsubscribe();
            this.dealCards();
        }).catch(error => console.log(error));
    }

    resume(id: string) {
        this.loadingService.updateStatus(true);
        this.currentGame = {
            ...this.currentGame,
            id: id,
            ref: <firebase.firestore.DocumentReference>this.gamesRef.doc(id).ref,
            observable: <Observable<Game>>this.gamesRef.doc(id).valueChanges(),
        };
        this.currentGame.observable.subscribe(data => {
            this.currentGame.deckRemaining.next(data.deck.length);
            this.currentGame.trash.next(data.trash);
            this.currentGame.state.next(data.state);
            this.currentGame.player1.next(data.player1);
            this.currentGame.player2.next(data.player2);
        });
        this.resumeCards();
    }

    pickupCard(): Promise<boolean> {
        return new Promise((resolve, reject) => {
            this.currentGame.ref.get().then(data => {
                const trash: Card[] = data.get('trash');
    
                this.myPlayer.ref.doc('data').ref.get().then(data => {
                    const cards: Card[] = data.get('cards');
                    if (cards.length > 0 && trash.length > 0) {
                        cards.push(trash.pop());
                        this.myPlayer.ref.doc('data').update({ cards: cards });
                        this.currentGame.ref.update({ trash: trash }).then(() => 
                            this.moveStateForward().then(() => resolve(true))
                        );
                    }
                });
            });
        })
    }

    drawCard(): Promise<boolean> {
        return new Promise((resolve, reject) => {
            this.currentGame.ref.get().then(data => {
                const deck: Card[] = data.get('deck');
    
                this.myPlayer.ref.doc('data').ref.get().then(data => {
                    const cards: Card[] = data.get('cards');
                    if (cards.length > 0 && deck.length > 0) {
                        cards.push(deck.shift());
                        this.myPlayer.ref.doc('data').update({ cards: cards });
                        this.currentGame.ref.update({ deck: deck }).then(() => 
                            this.moveStateForward().then(() => resolve(true))
                        );
                    }
                });
            });
        })
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
                this.myPlayer.ref.doc('data').update({ cards: cards, played: played, points: oldPoints + newPoints })
                    .then(() => {
                        resolve(newPoints);
                        if (cards.length <= 0) {
                            this.currentGame.ref.get().then(gameData => {
                                const player1id: string = gameData.get('player1');
                                const player2id: string = gameData.get('player2');

                                let newId = '';
                                let otherId = '';

                                this.moveStateForward(
                                    this.myPlayer.sub.getValue().id === player1id ?
                                    GameState.GameFinishedPlayer1Winner :
                                    GameState.GameFinishedPlayer2Winner
                                );
                            });
                        }
                    });
            });
        })
    }

    throwCard(card?: Card): Promise<boolean> {
        return new Promise((resolve, reject) => {
            this.myPlayer.ref.doc('data').ref.get().then(data => {
                const cards: Card[] = data.get('cards');
                cards.splice(cards.findIndex(c => c.suit === card.suit && c.value === card.value), 1);
                this.myPlayer.ref.doc('data').update({ cards: cards });
                this.currentGame.ref.get().then(data => {
                    this.addCardToTrash(card).then(() => resolve(true));
                });
            })
        })
    }

    startGame(): Promise<{ id: string, sub: Subscription }> {
        return new Promise((resolve, reject) => {
            const sub = this.fireStore.collection('cards').valueChanges().subscribe((cards: Card[]) => {
                this.shuffleDeck(cards).then(shuffled => {
                    this.gamesRef.add({
                        player1: 'asd123',
                        player2: 'qwerty1337',
                        deck: cards,
                        trash: [],
                        state: GameState.GameDealCards
                    }).then(data => {
                        resolve({ id: data.id, sub: sub });
                    }).catch(error => reject(sub));
                });
            });
        });
    }

    passTurn() {
        this.moveStateForward();
    }

    devSwitch() {
        this.currentGame.ref.get().then(data => {
            const player1id: string = data.get('player1');
            const player2id: string = data.get('player2');

            let newId = '';
            let otherId = '';

            if (this.myPlayer.sub.getValue().id === player1id) {
                newId = player2id;
                otherId = player1id;
            } else {
                newId = player1id;
                otherId = player2id;
            }
            this.myPlayer.ref = this.gamesRef.doc(this.currentGame.id).collection(newId);
            this.myPlayer.observable = <Observable<Player>>this.myPlayer.ref.doc('data').valueChanges();
            this.myPlayer.observable.subscribe(data => this.myPlayer.sub.next(<Player>data));

            this.gamesRef.doc(this.currentGame.id).collection(otherId).doc('data')
                .valueChanges().subscribe((opponent: Player) => {
                    this.opponent.next({ id: opponent.id, cardCount: opponent.cards.length, points: opponent.points, played: opponent.played });
                });
            this.loadingService.updateStatus(false);
        });
    }

    private resumeCards() {
        this.currentGame.ref.get().then(data => {
            const player1id: string = data.get('player1');
            const player2id: string = data.get('player2');
            this.myPlayer.ref = this.gamesRef.doc(this.currentGame.id).collection(player1id);
            this.myPlayer.observable = <Observable<Player>>this.myPlayer.ref.doc('data').valueChanges();
            this.myPlayer.observable.subscribe(data => this.myPlayer.sub.next(<Player>data));

            this.gamesRef.doc(this.currentGame.id).collection(player2id).doc('data')
                .valueChanges().subscribe((opponent: Player) => {
                    this.opponent.next({ id: opponent.id, cardCount: opponent.cards.length, points: opponent.points, played: opponent.played });
                });
            this.loadingService.updateStatus(false);
        });
    }

    private dealCards() {
        this.currentGame.ref.get().then(data => {
            const deck: Card[] = data.get('deck');
            const player1id: string = data.get('player1');
            const player2id: string = data.get('player2');

            const player1: Player = {
                id: player1id,
                cards: [],
                played: [],
                points: 0
            }
            const player2: Player = {
                id: player2id,
                cards: [],
                played: [],
                points: 0
            }

            player1.cards = deck.sort(() => 0.5 - Math.random()).splice(0, 7);
            player2.cards = deck.sort(() => 0.5 - Math.random()).splice(0, 7);

            this.currentGame.ref.collection(player1id).doc('data').set(player1)
                .then(data => {
                    this.myPlayer.ref = this.gamesRef.doc(this.currentGame.id).collection(player1id);
                    this.myPlayer.observable = <Observable<Player>>this.myPlayer.ref.doc('data').valueChanges();
                    this.myPlayer.observable.subscribe(data => this.myPlayer.sub.next(<Player>data));
                    this.currentGame.ref.collection(player2id).doc('data').set(player2)
                        .then(data => {
                            this.gamesRef.doc(this.currentGame.id).collection(player2id).doc('data')
                                .valueChanges().subscribe((opponent: Player) => {
                                    this.opponent.next({ id: opponent.id, cardCount: opponent.cards.length, points: opponent.points, played: opponent.played });
                                });
                        });
                    this.currentGame.ref.update({
                        deck: deck,
                        state: GameState.Player1Pickup
                    }).then(() => this.loadingService.updateStatus(false));
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
                this.currentGame.ref.update({ trash: currentTrash }).then(() => {
                    this.moveStateForward().then(() => resolve(true));
                });
            });
        })
    }

    private getPointsForCard(card: Card): number {
        if (card.value <= 10) {
            return 5;
        } else if (['J', 'Q', 'K'].indexOf(card.value.toString().toUpperCase()) >= 0) {
            return 10;
        } else if (card.value.toString().toUpperCase() === 'A') {
            return 15;
        } else {
            return 0;
        }
    }

    private moveStateForward(forcedState?: GameState): Promise<any> {
        let newState: GameState;
        const currentState = this.currentGame.state.getValue();

        newState = currentState === GameState.Player2Makeplay ? GameState.Player1Pickup : currentState.valueOf() + 1;
        if (forcedState !== null && forcedState !== undefined) {
            newState = forcedState;
        }
        return this.currentGame.ref.update({ state: newState });
    }

    // -- Dev: Fill Firestore Cards collection
    
    // fillCards() {
    //     const cards: Card[] = this.getAllCards();
    //     cards.forEach(card => {
    //         this.fireStore.collection('cards').add(card);
    //     });
    // }

    // private getAllCards() {
    //     const allValues = [2,3,4,5,6,7,8,9,10,'J','Q','K','A'];
    //     const allSuits = ['spades', 'diamonds', 'clubs', 'hearts'];
    //     const cards = [];
    //     allSuits.forEach(suit => {
    //         allValues.forEach(value => {
    //             const x: Card = {
    //                 suit: suit,
    //                 value: value
    //             };
    //             cards.push(x);
    //         })
    //     });
    //     return cards;
    // }
}