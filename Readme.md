The Router is the main container that enables routing in a React application.

Imagine:
It watches your browser’s address bar and decides what to show based on the current URL.

Without Router, your app wouldn’t understand page navigation.

Routes is like a menu of pages. It holds multiple <Route /> components, and React checks them to figure out which component to show based on the URL.

Outlet is a placeholder where the child routes get rendered.

No, you cannot rename <Outlet /> to anything else.

💡 Why?
<Outlet /> is a special component provided by react-router-dom. It's like a keyword or command that tells React Router:

“Hey, insert the currently matched child route’s component here.”

So it must be called exactly Outlet.

useState is a React Hook that lets you add state to functional components.


What can we pass as initial value to useState()?
| Type                 | Example                               |
| -------------------- | ------------------------------------- |
| Number               | `useState(0)`                         |
| String               | `useState("hello")`                   |
| Boolean              | `useState(false)`                     |
| Array                | `useState([])`                        |
| Object               | `useState({ name: "", age: 0 })`      |
| Function (lazy init) | `useState(() => expensiveFunction())` |





Updating state based on previous state: setCount(prevCount => prevCount + 1);


