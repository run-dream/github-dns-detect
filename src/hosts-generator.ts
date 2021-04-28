import DNSResolver from './dns-solver'
import IPSelector from './ip-selector'
export default class HostsGenerator {
    readonly domains = [
      'github.com',
      'api.github.com',
      'gist.github.com',
      'help.github.com',
      'assets-cdn.github.com',
      'documentcloud.github.com',
      'nodeload.github.com',
      'codeload.github.com',
      'raw.github.com',
      'status.github.com',
      'training.github.com',
      'camo.githubusercontent.com',
      'github.githubassets.com',
      'avatars.githubusercontent.com',
      'avatars0.githubusercontent.com',
      'avatars1.githubusercontent.com',
      'avatars2.githubusercontent.com',
      'avatars3.githubusercontent.com',
      'github.global.ssl.fastly.net'
    ]

    async generate () {
      const bestHosts: string[] = []
      for (const domain of this.domains) {
        try {
          const resolver = new DNSResolver()
          const hosts = await resolver.solve(domain)
          const selector = new IPSelector(hosts)
          const bestHost = await selector.select()
          if (bestHost) {
            bestHosts.push(`${bestHost} ${domain}`)
          }
        } catch (e) {
          console.error('解析url: ' + domain + '失败:' + e.message)
        }
      }
      return bestHosts
    }
}
