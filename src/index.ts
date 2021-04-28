import HostsGenerator from './hosts-generator'
import HostsEditor from './hosts-editor'

async function main () {
  const opt = process.argv.length >= 3 ? process.argv[2] : ''
  if (!opt || !['--generate', '--modify'].includes(opt)) {
    throw new Error(opt + '不在支持的操作内')
  }
  const generator = new HostsGenerator()
  const hosts = await generator.generate()
  const editor = new HostsEditor(hosts)
  if (opt === '--modify') {
    await editor.editHost()
  } else {
    await editor.saveHost()
  }
}

main()
