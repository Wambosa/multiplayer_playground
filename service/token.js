"use strict";

function generateToken() {
	return `${randomPrefix()}-${randomNegativeAdjective()}-${randomPokemon()}`;
}

function randomInt(min, max) {
	return Math.floor(Math.random()*(max-min+1)+min);
}

function randomPrefix() {
	let adjective = [
		'maximally',
		'kinda',
		'sorta',
		'tiny',
		'largely',
		'hugely',
		'partially',
		'really',
		'mostly',
		'completely',
		'sincerely',
		'totally',
		'fully',
		'absolute',
		'mega',
		'ultra',
		'super'
	];
	return adjective[randomInt(0, adjective.length-1)];
}

function randomNegativeAdjective(){
	let adjective = [
		'great',
		'fat',
		'stupid',
		'foolish',
		'dumb',
		'idiotic',
		'moronic',
		'silly',
		'childish',
		'naive',
		'ignorant',
		'careless',
		'undisciplined',
		'clueless',
		'obese',
		'lard',
		'gross',
		'awful',
		'horrid',
		'unfair',
		'ugly',
		'pathetic',
		'weak'
	];
	return adjective[randomInt(0, adjective.length-1)];
}

function randomPokemon(){
	let pokemon = [
		'being', 
		'Bulbasaur','Ivysaur','Venusaur','Charmander','Charmeleon','Charizard','Squirtle','Wartortle','Blastoise','Caterpie','Metapod','Butterfree','Weedle','Kakuna','Beedrill','Pidgey','Pidgeotto','Pidgeot','Rattata','Raticate','Spearow','Fearow','Ekans','Arbok','Pikachu','Raichu','Sandshrew','Sandslash','Nidoran♀','Nidorina','Nidoqueen','Nidoran♂','Nidorino','Nidoking','Clefairy','Clefable','Vulpix','Ninetales','Jigglypuff','Wigglytuff','Zubat','Golbat','Oddish','Gloom','Vileplume','Paras','Parasect','Venonat','Venomoth','Diglett','Dugtrio','Meowth','Persian','Psyduck','Golduck','Mankey','Primeape','Growlithe','Arcanine','Poliwag','Poliwhirl','Poliwrath','Abra','Kadabra','Alakazam','Machop','Machoke','Machamp','Bellsprout','Weepinbell','Victreebel','Tentacool','Tentacruel','Geodude','Graveler','Golem','Ponyta','Rapidash','Slowpoke','Slowbro','Magnemite','Magneton','FarfetchD','Doduo','Dodrio','Seel','Dewgong','Grimer','Muk','Shellder','Cloyster','Gastly','Haunter','Gengar','Onix','Drowzee','Hypno','Krabby','Kingler','Voltorb','Electrode','Exeggcute','Exeggutor','Cubone','Marowak','Hitmonlee','Hitmonchan','Lickitung','Koffing','Weezing','Rhyhorn','Rhydon','Chansey','Tangela','Kangaskhan','Horsea','Seadra','Goldeen','Seaking','Staryu','Starmie','Mr. Mime','Scyther','Jynx','Electabuzz','Magmar','Pinsir','Tauros','Magikarp','Gyarados','Lapras','Ditto','Eevee','Vaporeon','Jolteon','Flareon','Porygon','Omanyte','Omastar','Kabuto','Kabutops','Aerodactyl','Snorlax','Articuno','Zapdos','Moltres','Dratini','Dragonair','Dragonite','Mewtwo','Mew'
	];
	return pokemon[randomInt(0, pokemon.length-1)];
}

module.exports = generateToken;