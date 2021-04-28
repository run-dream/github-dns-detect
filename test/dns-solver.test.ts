import DNSResolver from '../src/dns-solver'
import assert from 'assert'
describe('dns-solver', () => {
  it('got ips', async function () {
    const solver = new DNSResolver()
    const ips = await solver.solve('baidu.com')
    assert(ips.length > 0)
  })
})
