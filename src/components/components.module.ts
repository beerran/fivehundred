import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlayingCardComponent } from './playing-card/playing-card';
import { CardDeckComponent } from './card-deck/card-deck';
import { CardHandComponent } from './card-hand/card-hand';

@NgModule({
	declarations: [
		PlayingCardComponent,
    CardDeckComponent,
    CardHandComponent
	],
	imports: [CommonModule],
	exports: [
		PlayingCardComponent,
    CardDeckComponent,
    CardHandComponent
	]
})
export class ComponentsModule {}
