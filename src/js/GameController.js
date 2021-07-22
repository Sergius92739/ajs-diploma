import themes from './themes';
import Team from './Team';
import { generateTeam } from './generators';
import Bowman from './Characters/Bowman';
import Swordsman from './Characters/Swordsman';
import Daemon from './Characters/Daemon';
import Undead from './Characters/Undead';
import Vampire from './Characters/Vampire';
import Magician from './Characters/Magician';
import PositionedCharacter from './PositionedCharacter';
import GameState from './GameState';
import GamePlay from './GamePlay';
import cursors from './cursors';

export default class GameController {
  constructor(gamePlay, stateService) {
    this.gamePlay = gamePlay;
    this.stateService = stateService;
    this.userTeam = new Team();
    this.botTeam = new Team();
    this.botCharacters = [Daemon, Undead, Vampire];
    this.userCharacters = [Bowman, Swordsman, Magician];
    this.gameState = new GameState();
    this.idxSelectedChar = null;
  }

  init() {
    // TODO: add event listeners to gamePlay events
    // TODO: load saved stated from stateService
    this.gamePlay.drawUi(themes[this.gameState.level]);
    this.userTeam.addAll(generateTeam([Bowman, Swordsman], 1, 2));
    this.botTeam.addAll(generateTeam(this.botCharacters, 1, 2));
    this.addsTheTeamToPosition(this.userTeam, this.getUserCharPositions());
    this.addsTheTeamToPosition(this.botTeam, this.getBotCharPositions());
    this.gamePlay.redrawPositions(this.gameState.allPositions);
    this.gamePlay.addCellEnterListener(this.onCellEnter.bind(this));
    this.gamePlay.addCellLeaveListener(this.onCellLeave.bind(this));
    this.gamePlay.addCellClickListener(this.onCellClick.bind(this));
  }

  onCellClick(index) {
    // TODO: react to click

    if (!this.searchCharByIndex(index)) {
      return;
    }

    if (this.searchCharByIndex(index) && !this.searchCharByType(index)) {
      GamePlay.showError('Это не ваш персонаж');
    } else {
      this.gamePlay.cells.forEach((elem) => elem.classList.remove('selected-green'));
      this.gamePlay.cells.forEach((elem) => elem.classList.remove('selected-yellow'));
      this.gamePlay.selectCell(index);
      this.idxSelectedChar = index;
    }
  }

  onCellEnter(index) {
    // TODO: react to mouse enter

    if (this.searchCharByIndex(index) && this.searchCharByType(index)) {
      this.gamePlay.setCursor(cursors.pointer);
    }
    if (this.idxSelectedChar && !this.searchCharByIndex(index) && this.isValidTransition(index)) {
      this.gamePlay.cells.forEach((elem) => elem.classList.remove('selected-green'));
      this.gamePlay.selectCell(index, 'green');
    }

    if (this.searchCharByIndex(index)) {
      const char = this.searchCharByIndex(index).character;
      const message = `\u{1F396}${char.level}\u{2694}${char.attack}\u{1F6E1}${char.defence}\u{2764}${char.health}`;
      this.gamePlay.showCellTooltip(message, index);
    }
  }

  isValidTransition(idx) {
    const arr = this.calcRangeMove(this.idxSelectedChar, this.getSelectedChar());
    return arr.includes(idx);
  }

  getSelectedChar() {
    return this.gameState.allPositions.find((elem) => elem.position === this.idxSelectedChar);
  }

  onCellLeave(index) {
    // TODO: react to mouse leave
    this.gamePlay.hideCellTooltip(index);
    this.gamePlay.setCursor(cursors.auto);
  }

  getUserCharPositions() {
    const brdSize = this.gamePlay.boardSize;
    this.userPosition = [];
    for (let i = 0, j = 1; this.userPosition.length < brdSize * 2; i += brdSize, j += brdSize) {
      this.userPosition.push(i, j);
    }
    return this.userPosition;
  }

  getBotCharPositions() {
    const brdSize = this.gamePlay.boardSize;
    this.botPosition = [];
    for (let i = 6, j = 7; this.botPosition.length < brdSize * 2; i += brdSize, j += brdSize) {
      this.botPosition.push(i, j);
    }
    return this.botPosition;
  }

  getRandomPosition(positions) {
    this.positions = positions;
    return this.positions[Math.floor(Math.random() * this.positions.length)];
  }

  addsTheTeamToPosition(team, positions) {
    for (const item of team) {
      const randomPos = this.getRandomPosition(positions);
      this.gameState.allPositions.push(new PositionedCharacter(item, randomPos));
    }
  }

  searchCharByType(idx) {
    const char = this.searchCharByIndex(idx).character;
    return this.userCharacters.some((elem) => char instanceof elem);
  }

  searchCharByIndex(idx) {
    return this.gameState.allPositions.find((elem) => elem.position === idx);
  }

  calcRangeMove(idx, char) {
    const dist = char.character.distance;
    const brdSize = this.gamePlay.boardSize;
    const range = [];
    const leftBorder = [];
    const rightBorder = [];

    for (let i = 0, j = brdSize - 1; leftBorder.length < brdSize; i += brdSize, j += brdSize) {
      leftBorder.push(i);
      rightBorder.push(j);
    }

    for (let i = 1; i <= dist; i += 1) {
      range.push(idx + (brdSize * i));
      range.push(idx - (brdSize * i));
    }

    for (let i = 1; i <= dist; i += 1) {
      if (leftBorder.includes(idx)) {
        break;
      }
      range.push(idx - i);
      range.push(idx - (brdSize * i + i));
      range.push(idx + (brdSize * i - i));
      if (leftBorder.includes(idx - i)) {
        break;
      }
    }

    for (let i = 1; i <= dist; i += 1) {
      if (rightBorder.includes(idx)) {
        break;
      }
      range.push(idx + i);
      range.push(idx - (brdSize * i - i));
      range.push(idx + (brdSize * i + i));
      if (rightBorder.includes(idx + i)) {
        break;
      }
    }

    return range.filter((elem) => elem >= 0 && elem <= (brdSize ** 2 - 1));
  }
}
