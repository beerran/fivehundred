import { Injectable } from '@angular/core';
import { Card } from '../models/card.model';
import { BehaviorSubject, Observable } from 'rxjs/Rx';
import 'rxjs/add/observable/from';

@Injectable()
export class CardService {
    private allCards: Card[] = [];
    private cards: BehaviorSubject<Card[]> = new BehaviorSubject<Card[]>(null);
    private myCards: BehaviorSubject<Card[]> = new BehaviorSubject<Card[]>(null);
    private opponentCards: BehaviorSubject<Card[]> = new BehaviorSubject<Card[]>(null);
    constructor() {
        this.populateCards().then(() => 
            this.shuffleDeck().then(() => 
                this.cards.next(this.allCards)
            ));
    }

    drawCards(): void {
        const myCards = this.allCards.sort(() => 0.5 - Math.random()).slice(0,6);
        myCards.forEach(c => this.allCards.splice(this.allCards.indexOf(c), 1));
        const opponentCards = this.allCards.sort(() => 0.5 - Math.random()).slice(0,6);
        opponentCards.forEach(c => this.allCards.splice(this.allCards.indexOf(c), 1));
        this.cards.next(this.allCards);
        this.myCards.next(myCards);
        this.opponentCards.next(opponentCards);
    }

    getDeck(): Observable<Card[]> {
        return this.cards.distinctUntilChanged();
    }

    getMyCards(): Observable<Card[]> {
        return this.myCards.distinctUntilChanged();
    }

    getOpponentCards() : Observable<Card[]> {
        return this.opponentCards.distinctUntilChanged();
    }

    private shuffleDeck(): Promise<boolean> {
        return new Promise((resolve, reject) => {
            let currentIndex: number = this.allCards.length, temporaryValue: Card, randomIndex: number;
        
            // While there remain elements to shuffle...
            while (currentIndex !== 0) {
                // Pick a remaining element...
                randomIndex = Math.floor(Math.random() * currentIndex);
                currentIndex -= 1;
            
                // And swap it with the current element.
                temporaryValue = this.allCards[currentIndex];
                this.allCards[currentIndex] = this.allCards[randomIndex];
                this.allCards[randomIndex] = temporaryValue;
            }
            resolve(true);
        });
    }

    private populateCards(): Promise<boolean> {

        return new Promise((resolve, reject) => {
            this.allCards = [
                new Card('2', 'diams'),
                new Card('3', 'diams'),
                new Card('4', 'diams'),
                new Card('5', 'diams'),
                new Card('6', 'diams'),
                new Card('7', 'diams'),
                new Card('8', 'diams'),
                new Card('9', 'diams'),
                new Card('10', 'diams'),
                new Card('J', 'diams'),
                new Card('Q', 'diams'),
                new Card('K', 'diams'),
                new Card('A', 'diams'),
                new Card('2', 'clubs'),
                new Card('3', 'clubs'),
                new Card('4', 'clubs'),
                new Card('5', 'clubs'),
                new Card('6', 'clubs'),
                new Card('7', 'clubs'),
                new Card('8', 'clubs'),
                new Card('9', 'clubs'),
                new Card('10', 'clubs'),
                new Card('J', 'clubs'),
                new Card('Q', 'clubs'),
                new Card('K', 'clubs'),
                new Card('A', 'clubs'),
                new Card('2', 'hearts'),
                new Card('3', 'hearts'),
                new Card('4', 'hearts'),
                new Card('5', 'hearts'),
                new Card('6', 'hearts'),
                new Card('7', 'hearts'),
                new Card('8', 'hearts'),
                new Card('9', 'hearts'),
                new Card('10', 'hearts'),
                new Card('J', 'hearts'),
                new Card('Q', 'hearts'),
                new Card('K', 'hearts'),
                new Card('A', 'hearts'),
                new Card('2', 'spades'),
                new Card('3', 'spades'),
                new Card('4', 'spades'),
                new Card('5', 'spades'),
                new Card('6', 'spades'),
                new Card('7', 'spades'),
                new Card('8', 'spades'),
                new Card('9', 'spades'),
                new Card('10', 'spades'),
                new Card('J', 'spades'),
                new Card('Q', 'spades'),
                new Card('K', 'spades'),
                new Card('A', 'spades')
            ];
            resolve(true);
        });
   
    }
}