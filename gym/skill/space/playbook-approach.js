
export default function() {
  const actor = getRandomPosition();
  const targets = [getRandomPosition(), getRandomPosition()];
  const target = findClosesTarget(actor, targets);

  return {
    observe: {
      actors: [ [actor.x, actor.y, 0, 0] ],
      targets: targets.map(target => [target.x, target.y]),
    },
    act: {
      actors: [ [target.x, target.y] ],
    }
  };
}

function getRandomPosition() {
  return {
    x: Math.random() * 100,
    y: Math.random() * 100,
  };
}

function findClosesTarget(actor, targets) {
  let closestDistance = Infinity;
  let closestTarget = null;

  for (const target of targets) {
    const squareDistance = ((actor.x - target.x) * (actor.x - target.x) + (actor.y - target.y) * (actor.y - target.y));

    if (squareDistance < closestDistance) {
      closestDistance = squareDistance;
      closestTarget = target;
    }
  }

  return closestTarget;
}
