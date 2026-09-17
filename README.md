# Executable Stories — Live Demo

This is a demo showing types and awaitly.

## Diagrams

```bash
pnpm diagram        # write src/awaitly.test.workflow.md
pnpm diagram:watch  # regenerate on save
pnpm diagram:html   # write src/awaitly.test.html
```



## Setup

Download and unpack the [Guardian coding exercises](https://github.com/guardian/coding-exercises) into this repo:

```bash
curl -L https://github.com/guardian/coding-exercises/archive/refs/heads/main.zip -o coding-exercises.zip
unzip coding-exercises.zip
```



## Run the demo

```bash
npx live-server reports
```

Then open [http://127.0.0.1:8080/coding-exercise.html](http://127.0.0.1:8080/coding-exercise.html) in your browser.

### Fruit Machine

```txt
/coding-exercise-tutor teach me
'/coding-exercises-main/fruit-machine'
use the file
'/src/coding-exercise.test.ts'
```

### Game of Life

```txt
/coding-exercise-tutor teach me
'/coding-exercises-main/game-of-life'
use the file
'/src/coding-exercise.test.ts'
```

## License

MIT
