import { Selector } from 'testcafe'
import inputStore from './input-store'

fixture `Google Search` // eslint-disable-line
  .page `${inputStore.url}` // eslint-disable-line

test('Input', async t => { // eslint-disable-line
  const el = Selector(() => document.getElementsByName('q'))

  await t
    .typeText(el, inputStore.search)
    .pressKey('enter')
})
