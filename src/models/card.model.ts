export class Card {
    constructor(
        public value: number | string,
        public suit: string
    ) { }

    public static GetValue(value: number | string) {
        switch(value) {
            case 'J':
                return 'jack';
            case 'Q':
                return 'queen';
            case 'K':
                return 'king';
            case 'A':
                return 'ace';
            default:
                return value;
        }
    }
}