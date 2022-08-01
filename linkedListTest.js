const { nodeInterface } = require('./linkedList');

const fancyInterface = new nodeInterface(1234);

const test = fancyInterface.lastCreatedNode,
    thing = fancyInterface.addNode(4567),
    otherThing = fancyInterface.addNode(9876);


console.log('end - ', test.end.data);
console.log('beg - ', otherThing.beg.data);

console.log('itemAt 1 - ', test.getItemAt(1));

//Test the rebind node function, then delete the thing
thing.rebindForDelete();

console.log('testNext' ,test.next.data);
console.log('otherThingPrev', otherThing.prev.data);