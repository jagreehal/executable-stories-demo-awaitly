import { describe, expect, it } from 'vitest';
import { story } from 'executable-stories-vitest';


describe('Hello World', () => {
  it('says hello world', ({ task }) => {
    story.init(task);

    story.given('the user says hello');
    const result = 'hello world';

    story.then('the result is "hello world"');
    expect(result).toBe('hello world');
  });
});
