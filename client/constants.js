//List of cards
const BACK = 'BACK';
const BOLT = 'BOLT';
const MIRROR = 'MIRROR';
const FORCE = 'FORCE';
const WAND = 'WAND';
const TWO_CARD = 'BLADE_PISTOL';
const THREE_CARD = 'BOW';
const FOUR_CARD = 'SWORD';
const FIVE_CARD = 'SHOTGUN';
const SIX_CARD = 'SPEAR';
const SEVEN_CARD = 'BROADSWORD';

//Other images
const RETURN_BUTTON = 'RETURN_BUTTON';
const SOUND_ICON = 'SOUND_ICON';
const MUTE_ICON = 'MUTE_ICON';
const CROSSED_SWORDS = 'CROSSED_SWORDS';

//Sound effects
const SWORD_SLICE = 'SWORD_SLICE';
const SHUFFLE_SOUND = 'SHUFFLE';
const SWOOSH = 'SWOOSH';
const NORMAL_CARD_PLAY = 'NORMAL_CARD_PLAY';
const WAND_CARD_PLAY = 'WAND_CARD_PLAY';
const BOLT_CARD_PLAY = 'BOLT_CARD_PLAY';
const MIRROR_CARD_PLAY = 'MIRROR_CARD_PLAY';

//Music
const GAME_BGM = 'GAME_BGM';
const MENU_BGM = 'MENU_BGM';

//Resolution
const GAME_WIDTH = 1280;
const GAME_HEIGHT = 720;

//Card related constants
const ANCHOR = 0.5;
const CARD_WIDTH = 191;
const CARD_HEIGHT = 252;
const CARD_SCALE = 0.5;
const INITIAL_DECK_SIZE = 20;
const INITIAL_HAND_SIZE = 10;
const PLAYER_DECK_X_LOCATION = GAME_WIDTH / 20;
const ENEMY_DECK_X_LOCATION = GAME_WIDTH - PLAYER_DECK_X_LOCATION;
const PLAYER_FIELD_X_LOCATION = GAME_WIDTH - 2 * CARD_WIDTH;
const PLAYER_FIELD_Y_LOCATION = GAME_HEIGHT - (CARD_HEIGHT * CARD_SCALE * ANCHOR * 4);
const ENEMY_FIELD_X_LOCATION = CARD_WIDTH * 2;
const ENEMY_FIELD_Y_LOCATION = CARD_HEIGHT * CARD_SCALE * ANCHOR * 4;
const PLAYER_FIELD_BUFFER = 30;
const ENEMY_FIELD_BUFFER = -30;