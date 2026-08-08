// Rotation for the "exquisite corpse" story chain.
//
// Every player owns exactly one Story. There are `totalQuestions` synchronized
// rounds (0-indexed). At round r, all N players write simultaneously, each
// into a different story, then everyone advances together once all N answers
// for that round exist.
//
// A story's owner sits at seat `ownerSeat`. At round r, the player currently
// holding that story sits at seat (ownerSeat + r) mod N — the story moves one
// seat over each round, same direction for everyone, so nobody collides.
//
// Equivalently, the player at seat `mySeat` is, at round r, writing into the
// story owned by the player at seat (mySeat - r) mod N.

export function seatOfWriter(ownerSeat: number, round: number, playerCount: number): number {
  return ((ownerSeat + round) % playerCount + playerCount) % playerCount;
}

export function seatOfStoryOwnerForWriter(
  writerSeat: number,
  round: number,
  playerCount: number,
): number {
  return ((writerSeat - round) % playerCount + playerCount) % playerCount;
}
