# Visual JavaScript Editor
An experimental visual editor for JavaScript

<img width="1512" alt="Screenshot 2024-12-24 at 5 42 45 PM" src="https://github.com/user-attachments/assets/24986ee7-3471-4d31-8fcf-8fd1c1d45a7b" />

## Development

```
npm install
npx run start
```

## Sample
[demo](https://zyl11.csb.app/) for the following sample code
```js
const MAX_ITERATION = 80
function mandelbrot(c) {
    let z = { x: 0, y: 0 }, n = 0, p, d;
    do {
        p = {
            x: Math.pow(z.x, 2) - Math.pow(z.y, 2),
            y: 2 * z.x * z.y
        }
        z = {
            x: p.x + c.x,
            y: p.y + c.y
        }
        d = Math.sqrt(Math.pow(z.x, 2) + Math.pow(z.y, 2))
        n += 1
    } while (d <= 2 && n < MAX_ITERATION)
    return [n, d <= 2]
}
mandelbrot(1);
c = 1;
```
