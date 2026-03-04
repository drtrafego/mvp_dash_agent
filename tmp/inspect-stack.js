
const { StackServerApp } = require('./node_modules/@stackframe/stack/dist/index.js');
const stackServerApp = new StackServerApp({
    projectId: '00000000-0000-0000-0000-000000000000',
    publishableClientKey: 'pk_test_00000000000000000000000000000000',
    secretServerKey: 'sk_test_00000000000000000000000000000000',
    tokenStore: 'memory',
});

console.log('Keys:', Object.keys(stackServerApp));
console.log('Prototype Keys:', Object.getOwnPropertyNames(Object.getPrototypeOf(stackServerApp)));
if (stackServerApp.handler) {
    console.log('Handler type:', typeof stackServerApp.handler);
    console.log('Handler keys:', Object.keys(stackServerApp.handler));
}
