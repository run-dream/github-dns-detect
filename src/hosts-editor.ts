import { EOL } from 'os'
import { readFile, writeFile } from 'fs'
import { promisify } from 'util'

export default class HostsEditor {
  readonly REGION_START = '# GITHUB HOSTS'
  readonly REGION_END = '# END OF GITHUB HOSTS'

  hosts :string[]
  constructor (hosts:string[]) {
    this.hosts = hosts
  }

  get hostPath (): string {
    if (process.platform === 'win32') {
      return 'C:/Windows/System32/drivers/etc/hosts'
    }
    return '/etc/hosts'
  }

  getLines () {
    const lines = []
    lines.push(this.REGION_START)
    for (const host of this.hosts) {
      lines.push(host)
    }
    lines.push(this.REGION_END)
    return lines
  }

  getText (lines:string[]) {
    return lines.join(EOL)
  }

  async editHost () {
    const hostBuffer = await promisify(readFile)(this.hostPath, {
      flag: 'r'
    })
    const lines = hostBuffer.toString().split(EOL)
    const beginLine = lines.findIndex(line => line === this.REGION_START)
    const endLine = lines.findIndex(line => line === this.REGION_END)
    if (beginLine >= 0 && endLine >= 0) {
      lines.splice(beginLine, endLine - beginLine + 1)
    }
    const hostLines = this.getLines()
    await promisify(writeFile)(this.hostPath, this.getText(lines.concat(hostLines)))
    console.log('编辑hosts成功')
  }

  async saveHost (path:string = './host') {
    const lines = this.getLines()
    const text = this.getText(lines)
    await promisify(writeFile)(path, text)
    console.log('保存host到' + path + '成功, 内容为' + text)
  }
}
