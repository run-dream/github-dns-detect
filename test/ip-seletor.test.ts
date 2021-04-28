import IPSelector from '../src/ip-selector'
import assert from 'assert'
describe('ip-seletector', () => {
  it('select ips', async function () {
    const solver = new IPSelector(['192.30.255.112', '192.30.255.113', '222.42.5.41'])
    const ip = await solver.select()
    console.log(ip)
    assert(ip)
  })
})
