import * as functions from 'firebase-functions'

export default (functions as any).firestore
  .document('messages/{pushId}').onWrite(async (event) => {
    const message = event.data.data() as {original: string};
    const pushId = event.params['pushId'];
    const uppercase = upcaseMessage(message.original);
    await event.data.ref.update({
      uppercase: uppercase,
    });
  });

function upcaseMessage(original: string): string {
  return original.toUpperCase();
}
