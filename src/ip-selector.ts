import ping from 'pingman'
import { maxBy } from 'lodash'
export default class IPSelector {
  ips :string[]
  constructor (ips: string[]) {
    this.ips = ips.filter(ip => ip !== '*' && ip !== '127.0.0.1')
  }

  async select () {
    const infos = []
    for (const ip of this.ips) {
      console.log(ip)
      const pingInfo = await ping(ip, {
        numberOfEchos: 10
      })
      infos.push({ ...pingInfo })
      console.log('pinging ' + ip)
    }
    const best = maxBy(infos, info => {
      const aliveFactor = info.alive ? 1 : -1
      const packageLose = info.packetLoss ? Number(info.packetLoss) : 0
      const loseFactor = 100 - packageLose
      const time = info.time || 10000
      const timeFactor = 10000 - Math.min(time, 10000)
      return aliveFactor * loseFactor * timeFactor
    })
    return best?.host
  }
}
