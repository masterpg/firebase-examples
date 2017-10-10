import * as functions from 'firebase-functions'

export default functions.database.ref('messages/{pushId}/original')
  .onWrite(async event => {
    const original = event.data.val() as string;
    const pushId = (event.params as any).pushId;
    const uppercase = upcaseMessage(original);
    const parentRef = event.data.ref.parent;
    if (parentRef != null) {
      await parentRef.child('uppercase').set(uppercase)
    }
  });

// Not visible from the main 'index.ts'
function upcaseMessage(msg: string): string {
  return msg.toUpperCase()
}