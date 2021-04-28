
import fetch, { Response, Headers } from 'node-fetch'
import cheerio from 'cheerio'
import FormData from 'form-data'
import { kebabCase } from 'lodash'

export default class DNSSolver {
    readonly htmlBaseUrl = 'https://www.ping.cn/http/';
    readonly jsonBaseUrl = 'https://www.ping.cn/check';

    async solve (url: string): Promise<string[]> {
      const response = await this.getResponse(url)
      const html = await response.text()
      const token = await this.getToken(html)
      const cookie = response.headers.get('cookie') as string
      const taskId = await this.createTask(url, token, cookie)
      return this.getDNS(url, token, taskId, cookie)
    }

    private async getResponse (url: string): Promise<Response> {
      const htmlUrl = this.htmlBaseUrl + url
      const headers = this.initHeaders()
      return fetch(htmlUrl, {
        headers
      })
    }

    private initHeaders (params: { [key: string]: string } = {}): Headers {
      const headers = new Headers()
      headers.set('accept', 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9')
      headers.set('accept-encoding', 'zh-CN,zh;q=0.9')
      headers.set('sec-ch-ua', '" Not A;Brand";v="99", "Chromium";v="90", "Google Chrome";v="90"')
      headers.set('sec-ch-ua-mobile', '?0')
      headers.set('user-agent', 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.85 Safari/537.36')
      for (const key in params) {
        headers.set(kebabCase(key) as string, params[key])
      }
      return headers
    }

    private initForm (params: { [key: string]: string | number }): FormData {
      const form = new FormData()
      for (const key in params) {
        form.append(key, params[key])
      }
      return form
    }

    private async createTask (url: string, token: string, cookie: string): Promise<string> {
      const form = this.initForm({
        host: url,
        type: 'http',
        _token: token,
        create_task: 1,
        isp: '1,2,3'
      })
      const headers = this.initHeaders({
        cookie,
        referer: 'https://ping.cn/http/' + url,
        xRequestedWith: 'XMLHttpRequest'
      })
      const response = await fetch(this.jsonBaseUrl, {
        method: 'POST',
        body: form,
        headers
      })
      const json = await response.json()
      if (json.code !== 1) {
        throw new Error('创建查询任务失败,url:' + url)
      }
      console.log('创建查询任务成功,url:' + url)
      const data = (json as any).data as any
      return (data.taskID) as string
    }

    private async getToken (html: string): Promise<string> {
      const $ = cheerio.load(html)
      const token = $('input[name=_token]').attr('value')
      if (!token) {
        throw new Error('从' + this.htmlBaseUrl + '获取不到token')
      }
      return token
    }

    private async getDNS (url: string, token: string, taskId: string, cookie: string): Promise<string[]> {
      let retry = 3
      while (retry > 0) {
        const form = this.initForm({
          host: url,
          type: 'http',
          _token: token,
          task_id: taskId,
          create_task: 0
        })
        const headers = this.initHeaders({
          cookie,
          referer: 'https://ping.cn/http/' + url,
          xRequestedWith: 'XMLHttpRequest'
        })
        const response = await fetch(this.jsonBaseUrl, {
          method: 'POST',
          body: form,
          headers
        })
        const json = await response.json()
        if (json.code === 1) {
          console.log('获取DNS成功, url:' + url)
          return (((json.data as any).initData as any).ipPre as any[]).map(item => item.ip as string)
        }
        await this.sleep(5000)
        retry--
      }
      throw new Error('获取DNS失败')
    }

    private sleep (ms: number): Promise<void> {
      return new Promise((resolve) => {
        setTimeout(() => resolve(), ms)
      })
    }
}
