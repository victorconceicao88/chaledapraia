import {
  Utensils, Soup, Drumstick, Salad, Cake, Sandwich,
  Martini, GlassWater, Wine, Beer, CakeSlice, User,
  Coffee, IceCream, Citrus, Candy,
} from 'lucide-react';
import { GiMeal, GiCow, GiSodaCan, GiWaterDrop, GiPineapple, GiOlive, GiCorn, GiCakeSlice, GiPeanut, GiFruitTree, GiChickenOven, GiChicken, GiSausage, GiBowlOfRice, GiSaucepan, GiChopsticks, GiBread, GiFruitBowl } from "react-icons/gi";
import { FaArrowLeft, FaBoxOpen, FaWineBottle, FaFish, FaCoffee, FaBeer, FaWineGlassAlt, FaArrowRight, FaIceCream, FaGlassWhiskey } from 'react-icons/fa';

export const CategoryIcons = {
  mainCourses: (props) => <Utensils className="text-orange-500" {...props} />,
  Caldos: (props) => <Soup className="text-amber-600" {...props} />,
  snacks: (props) => <Drumstick className="text-red-500" {...props} />,
  salads: (props) => <Salad className="text-green-500" {...props} />,
  couvert: (props) => <Cake className="text-yellow-500" {...props} />,
  toasts: (props) => <Sandwich className="text-amber-400" {...props} />,
  otherDishes: (props) => < FaBoxOpen className="text-indigo-500" {...props} />,
  alcoholicCocktails: (props) => <Martini className="text-purple-500" {...props} />,
  nonAlcoholicCocktails: (props) => <GlassWater className="text-blue-400" {...props} />,
  wines: (props) => <Wine className="text-rose-600" {...props} />,
  beers: (props) => <Beer className="text-amber-300" {...props} />,
  otherDrinks: (props) => <GiSodaCan className="text-cyan-400" {...props} />,
  desserts: (props) => <CakeSlice className="text-pink-400" {...props} />,
  kidsMenu: (props) => <User className="text-cyan-500" {...props} />,
  bebidasQuentes: (props) => <Coffee className="text-yellow-800" {...props} />,
  sorvetes: (props) => <IceCream className="text-sky-300" {...props} />,
  sucos: (props) => <Citrus className="text-lime-400" {...props} />,
  doces: (props) => <Candy className="text-pink-300" {...props} />,
};

export const menuItems = {
  mainCourses: [
    { id: 'dailyMenu', name: 'Menu do Dia', price: 12.00, description: 'Inclui: Couvert, prato do dia, bebida, sobremesa e café', icon: <GiMeal className="text-green-500 text-2xl" /> },
    { id: 'picanha', name: 'Picanha', price: 15.00, icon: <GiCow className="text-red-500 text-2xl" /> },
    { id: 'maminha', name: 'Maminha', price: 8.00, icon: <GiCow className="text-red-600 text-2xl" /> },
    { id: 'chickenBreast', name: 'Peito de Frango', price: 8.00, icon: <GiChickenOven className="text-yellow-600 text-2xl" /> },
    { id: 'friedChicken', name: 'Frango Frito', price: 8.00, icon: <GiChicken className="text-yellow-700 text-2xl" /> },
    { id: 'calabresa', name: 'Calabresa', price: 8.00, icon: <GiSausage className="text-red-500 text-2xl" /> },
    { id: 'toscana', name: 'Toscana', price: 8.00, icon: <GiSausage className="text-red-400 text-2xl" /> },
    { id: 'pasta', name: 'Massa Bolonhesa ou Carbonara', price: 9.00, icon: <GiBowlOfRice className="text-orange-600 text-2xl" /> },
    { id: 'tilapia', name: 'Filé de Tilápia', price: 9.00, icon: <FaFish className="text-blue-600 text-2xl" /> }
  ],

  otherDishes: [
    { id: 'vacaAtoladaDish', name: 'Vaca Atolada', price: 10.00, icon: <GiSaucepan className="text-brown-600 text-2xl" /> },
    { id: 'feijoada', name: 'Feijoada', price: 10.00, icon: <GiSaucepan className="text-brown-700 text-2xl" /> },
    { id: 'feijaoTropeiro', name: 'Feijão Tropeiro', price: 10.00, icon: <GiBowlOfRice className="text-brown-500 text-2xl" /> }
  ],

  Caldos: [
    { id: 'vacaAtoladaSoup', name: 'Vaca Atolada', price: 5.00, icon: <GiSaucepan className="text-brown-400 text-2xl" /> },
    { id: 'pintoSoup', name: 'Caldo de Pinto', price: 5.00, icon: <GiChicken className="text-yellow-800 text-2xl" /> },
    { id: 'beanSoup', name: 'Caldo de Feijão', price: 5.00, icon: <GiBowlOfRice className="text-brown-600 text-2xl" /> },
    { id: 'canjiquinha', name: 'Canjiquinha', price: 5.00, icon: <GiBowlOfRice className="text-yellow-400 text-2xl" /> },
    { id: 'mocoto', name: 'Mocotó', price: 5.00, icon: <GiSaucepan className="text-brown-500 text-2xl" /> }
  ],

  snacks: [
    { id: 'frangoPassarinho', name: 'Frango à Passarinho', price: 13.00, icon: <GiChopsticks className="text-yellow-700 text-2xl" /> },
    { id: 'calabresaSnack', name: 'Calabresa', price: 15.00, icon: <GiSausage className="text-red-500 text-2xl" /> },
    { id: 'toscanaSnack', name: 'Toscana', price: 13.00, icon: <GiSausage className="text-red-400 text-2xl" /> },
    { id: 'carneSeca', name: 'Carne Seca', price: 15.00, icon: <GiCow className="text-red-500 text-2xl" /> },
    { id: 'picanhaSnack', name: 'Picanha', price: 20.00, icon: <GiCow className="text-red-600 text-2xl" /> },
    { id: 'tabuaCarnesQueijo', name: 'Tábua de Carnes com Queijo', price: 20.00, icon: <GiChopsticks className="text-brown-600 text-2xl" /> },
    { id: 'tabuaCarnesSemQueijo', name: 'Tábua de Carnes sem Queijo', price: 15.00, icon: <GiChopsticks className="text-brown-500 text-2xl" /> },
    { id: 'tilapiaFrita', name: 'Tilápia Frita', price: 13.00, icon: <FaFish className="text-blue-500 text-2xl" /> },
    { id: 'frangoCrocante', name: 'Frango Crocante', price: 13.00, icon: <GiChicken className="text-yellow-700 text-2xl" /> },
    { id: 'torresmo', name: 'Torresmo', price: 6.00, icon: <GiSausage className="text-yellow-400 text-2xl" /> },
    { id: 'queijoCoalho', name: 'Queijo Coalho', price: 6.00, icon: <GiBread className="text-yellow-200 text-2xl" /> },
    { id: 'mandioca', name: 'Mandioca', price: 6.00, icon: <GiBread className="text-yellow-300 text-2xl" /> },
    { id: 'batataFrita', name: 'Batata Frita', price: 4.00, icon: <GiChopsticks className="text-yellow-400 text-2xl" /> },
    { id: 'batataCheddarBacon', name: 'Batata com Cheddar e Bacon', price: 6.00, icon: <GiChopsticks className="text-orange-500 text-2xl" /> }
  ],

  salads: [
    { id: 'saladaFrango', name: 'Salada de Frango', price: 8.00, description: 'Peito de frango, salada, azeitona, tomate, milho, semente', icon: <GiFruitBowl className="text-green-600 text-2xl" /> },
    { id: 'saladaAtum', name: 'Salada de Atum', price: 8.00, description: 'Atum, salada, azeitona, ovo cozido, tomate, cebola, cenoura', icon: <GiFruitBowl className="text-blue-600 text-2xl" /> },
    { id: 'saladaTropical', name: 'Salada Tropical', price: 8.00, description: 'Palmito, milho, ovo cozido, salada, queijo mussarela, fruta da estação', icon: <GiFruitBowl className="text-yellow-600 text-2xl" /> },
    { id: 'saladaCamarao', name: 'Salada de Camarão', price: 8.00, description: 'Alface, tomate, queijo, camarão, fruta da estação', icon: <GiFruitBowl className="text-pink-600 text-2xl" /> }
  ],

couvert: [
  { id: 'pao', name: 'Pão', price: 1.50, icon: <GiBread className="text-yellow-500 text-2xl" /> },
  { id: 'manteiga', name: 'Manteiga', price: 0.50, icon: <GiBread className="text-yellow-300 text-2xl" /> },
  { id: 'azeitona', name: 'Azeitona', price: 0.50, icon: <GiOlive className="text-green-800 text-2xl" /> },
  { id: 'tremoço', name: 'Tremoço', price: 0.50, icon: <GiCorn className="text-yellow-800 text-2xl" /> },
  { id: 'amendoim', name: 'Amendoim', price: 0.50, icon: <GiPeanut className="text-amber-600 text-2xl" /> },
  { id: 'cenoura', name: 'Cenoura', price: 0.50, icon: <GiFruitTree className="text-orange-600 text-2xl" /> }
],

toasts: [
  { id: 'tostaMista', name: 'Tosta Mista', price: 4.00, icon: <GiBread className="text-yellow-500 text-2xl" /> },
  { id: 'tostaFrangoAtum', name: 'Tosta de Frango ou Atum', price: 5.00, icon: <GiBread className="text-yellow-600 text-2xl" /> },
  { id: 'torrada', name: 'Torrada', price: 2.00, icon: <GiBread className="text-yellow-400 text-2xl" /> }
],

  kidsMenu: [
    { id: 'kidsMenu', name: 'Menu Infantil', price: 9.00, description: 'Inclui: Prato do dia, bebida e sobremesa', icon: <GiMeal className="text-pink-600 text-2xl" /> }
  ],

  desserts: [
    { id: 'pudding', name: 'Pudim', price: 4.50, icon: <FaIceCream className="text-yellow-500 text-2xl" /> },
    { id: 'cake', name: 'Bolo', price: 4.50, icon: <GiCakeSlice className="text-brown-400 text-2xl" /> }
  ],

  alcoholicCocktails: [
    { id: 'caipirinha', name: 'Caipirinha', price: 7.00, description: 'Cachaça, lima, açúcar. Sabores: Limão, Maracujá, Morango, Jabuticaba, Kiwi', icon: <FaGlassWhiskey className="text-purple-600 text-2xl" /> },
    { id: 'caipiblak', name: 'Caipiblak', price: 7.00, description: 'Vodka preta, lima, açúcar. Sabores: Morango, Maracujá, Jabuticaba, Kiwi', icon: <FaGlassWhiskey className="text-black text-2xl" /> },
    { id: 'caipiroska', name: 'Caipiroska', price: 7.00, description: 'Vodka, lima, açúcar. Sabores: Morango, Maracujá, Jabuticaba, Kiwi', icon: <FaGlassWhiskey className="text-purple-500 text-2xl" /> },
    { id: 'paloma', name: 'Paloma', price: 7.00, description: 'Tequila, sumo de lima, tónica de toranja', icon: <FaGlassWhiskey className="text-pink-400 text-2xl" /> },
    { id: 'daiquiriFrozen', name: 'Daiquiri Frozen', price: 7.00, description: 'Rum, lima, açúcar. Sabores: Morango, Maracujá, Jabuticaba, Kiwi', icon: <FaGlassWhiskey className="text-blue-300 text-2xl" /> },
    { id: 'pinaColada', name: 'Pina Colada', price: 7.00, description: 'Rum, coco, ananás. Sabores: Coco, Manga', icon: <GiPineapple className="text-yellow-400 text-2xl" /> },
    { id: 'sexOnTheBeach', name: 'Sex on the Beach', price: 7.00, description: 'Vodka, Peach Schnapps, sumo de laranja, cranberry', icon: <FaGlassWhiskey className="text-orange-500 text-2xl" /> },
    { id: 'blueLagoon', name: 'Blue Lagoon', price: 7.00, description: 'Vodka, Blue Curaçao, sumo de lima', icon: <FaGlassWhiskey className="text-blue-500 text-2xl" /> },
    { id: 'pornStarMartini', name: 'Porn Star Martini', price: 7.00, description: 'Vodka, maracujá, licor de maracujá, espumante', icon: <FaGlassWhiskey className="text-yellow-600 text-2xl" /> },
    { id: 'bramble', name: 'Bramble', price: 7.00, description: 'Gin, sumo de lima, açúcar, amora. Sabores: Amora, Maracujá, Jabuticaba', icon: <FaGlassWhiskey className="text-purple-700 text-2xl" /> },
    { id: 'longIsland', name: 'Long Island', price: 7.00, description: 'Vodka, tequila, rum, gin, Cointreau, sumo de lima, Coca-Cola', icon: <FaGlassWhiskey className="text-amber-600 text-2xl" /> },
    { id: 'tequilaSunrise', name: 'Tequila Sunrise', price: 7.00, description: 'Tequila, sumo de laranja, groselha', icon: <FaGlassWhiskey className="text-orange-400 text-2xl" /> },
    { id: 'aperolSpritz', name: 'Aperol Spritz', price: 7.00, description: 'Prosecco, Aperol, soda', icon: <FaGlassWhiskey className="text-orange-500 text-2xl" /> },
    { id: 'espressoMartini', name: 'Expresso Martini', price: 7.00, description: 'Vodka, licor de café, açúcar, espresso', icon: <FaCoffee className="text-brown-800 text-2xl" /> },
    { id: 'mojito', name: 'Mojito', price: 7.00, description: 'Rum, sumo de lima, hortelã, açúcar, soda. Sabores: Limão, Maracujá, Maçã verde, Morango', icon: <FaGlassWhiskey className="text-green-400 text-2xl" /> },
    { id: 'margarita', name: 'Margarita', price: 7.00, description: 'Tequila, triple sec, sumo de limão', icon: <FaGlassWhiskey className="text-lime-400 text-2xl" /> },
    { id: 'negroni', name: 'Negroni', price: 7.00, description: 'Gin, Campari, vermouth', icon: <FaGlassWhiskey className="text-red-600 text-2xl" /> },
    { id: 'cosmopolitan', name: 'Cosmopolitan', price: 7.00, description: 'Vodka citron, Cointreau, lima, cranberry', icon: <FaGlassWhiskey className="text-pink-500 text-2xl" /> }
  ],

  nonAlcoholicCocktails: [
    { id: 'nonAlcoholicCocktail', name: 'Cocktail sem Álcool', price: 6.00, icon: <FaGlassWhiskey className="text-blue-500 text-2xl" /> }
  ],

  wines: [
    { id: 'wineJug500', name: 'Jarro de Vinho (500ml)', price: 5.00, description: 'Branco, Tinto, Verde ou Rosé', icon: <FaWineBottle className="text-purple-400 text-2xl" /> },
    { id: 'wineJug1L', name: 'Jarro de Vinho (1L)', price: 10.00, description: 'Branco, Tinto, Verde ou Rosé', icon: <FaWineBottle className="text-purple-500 text-2xl" /> },
    { id: 'wineGlass', name: 'Copo de Vinho', price: 3.00, description: 'Branco, Tinto, Verde ou Rosé', icon: <FaWineGlassAlt className="text-red-400 text-2xl" /> },
    { id: 'sangria1L', name: 'Sangria (1L)', price: 15.00, description: 'Tinta, Branca, Rosé ou Espumante', icon: <FaWineGlassAlt className="text-red-600 text-2xl" /> },
    { id: 'sangria15L', name: 'Sangria (1,5L)', price: 18.00, description: 'Tinta, Branca, Rosé ou Espumante', icon: <FaWineGlassAlt className="text-red-700 text-2xl" /> },
    { id: 'sangria2L', name: 'Sangria (2L)', price: 20.00, description: 'Tinta, Branca, Rosé ou Espumante', icon: <FaWineGlassAlt className="text-red-800 text-2xl" /> }
  ],

  beers: [
    { id: 'beerDraft', name: 'Imperial', price: 2.00, icon: <FaBeer className="text-yellow-700 text-2xl" /> },
    { id: 'beerMug', name: 'Caneca', price: 2.00, icon: <FaBeer className="text-yellow-600 text-2xl" /> },
    { id: 'brazilianBeer', name: 'Cervejas brasileiras', price: 3.00, icon: <FaBeer className="text-yellow-500 text-2xl" /> },
    { id: 'cozumel', name: 'Cozumel', price: 4.00, icon: <FaBeer className="text-amber-700 text-2xl" /> },
    { id: 'heineken25', name: 'Heineken (25cl)', price: 2.00, icon: <FaBeer className="text-green-800 text-2xl" /> },
    { id: 'heineken33', name: 'Heineken (33cl)', price: 2.50, icon: <FaBeer className="text-green-900 text-2xl" /> },
    { id: 'corona25', name: 'Corona (25cl)', price: 2.00, icon: <FaBeer className="text-yellow-600 text-2xl" /> },
    { id: 'corona33', name: 'Corona (33cl)', price: 2.50, icon: <FaBeer className="text-yellow-700 text-2xl" /> },
    { id: 'sagres25', name: 'Sagres (25cl)', price: 2.00, icon: <FaBeer className="text-yellow-500 text-2xl" /> },
    { id: 'sagres33', name: 'Sagres (33cl)', price: 2.50, icon: <FaBeer className="text-yellow-600 text-2xl" /> },
    { id: 'superBock25', name: 'Super Bock (25cl)', price: 2.00, icon: <FaBeer className="text-amber-600 text-2xl" /> },
    { id: 'superBock33', name: 'Super Bock (33cl)', price: 2.50, icon: <FaBeer className="text-amber-700 text-2xl" /> },
    { id: 'otherBeers', name: 'Outras cervejas', price: 3.00, icon: <FaBeer className="text-yellow-400 text-2xl" /> }
  ],

  otherDrinks: [
    { id: 'ginTonic', name: 'Gin Tónico (Hendricks | Bulldog)', price: 8.00, icon: <FaGlassWhiskey className="text-green-400 text-2xl" /> },
    { id: 'shot', name: 'Shot', price: 3.00, icon: <FaGlassWhiskey className="text-brown-600 text-2xl" /> },
    { id: 'dose', name: 'Dose', price: 4.00, icon: <FaGlassWhiskey className="text-brown-700 text-2xl" /> },
    { id: 'whiskyCola', name: 'Whisky-cola', price: 5.00, icon: <FaGlassWhiskey className="text-amber-600 text-2xl" /> },
    { id: 'smirnoffIce', name: 'Smirnoff Ice', price: 4.00, icon: <FaGlassWhiskey className="text-blue-300 text-2xl" /> },
    { id: 'whiskyBottle', name: 'Whisky (garrafa)', price: 80.00, description: 'A partir de 80€', icon: <FaGlassWhiskey className="text-amber-800 text-2xl" /> },
    { id: 'compal', name: 'Compal', price: 2.00, icon: <GiFruitTree className="text-orange-500 text-2xl" /> },
    { id: 'soda', name: 'Refrigerante', price: 1.00, icon: <GiSodaCan className="text-red-500 text-2xl" /> },
    { id: 'water', name: 'Água', price: 1.00, icon: <GiWaterDrop className="text-blue-400 text-2xl" /> },
    { id: 'sparklingWater', name: 'Água com gás', price: 2.00, icon: <GiWaterDrop className="text-blue-500 text-2xl" /> },
    { id: 'energyDrink', name: 'Energético', price: 3.00, icon: <GiSodaCan className="text-yellow-500 text-2xl" /> },
    { id: 'naturalJuice', name: 'Sumo natural', price: 4.00, icon: <GiFruitTree className="text-orange-600 text-2xl" /> }
  ]
};