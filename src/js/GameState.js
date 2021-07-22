export default class GameState {
  constructor() {
    this.isPlayersTurn = true;
    this.level = 1;
    this.allPositions = [];
    this.points = 0;
    this.statistics = 0;
  }

  static from(object) {
    // TODO: create object
    if (typeof object === 'object') {
      return object;
    }
    return null;
  }
}
