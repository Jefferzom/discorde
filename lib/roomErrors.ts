export class RoomOccupiedError extends Error {
  constructor() {
    super("ROOM_OCCUPIED");
    this.name = "RoomOccupiedError";
  }
}

export class CurrentRoomError extends Error {
  constructor() {
    super("CURRENT_ROOM");
    this.name = "CurrentRoomError";
  }
}
