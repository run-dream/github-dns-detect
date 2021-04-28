### 背景
GitHub在国内访问速度慢的原因其实有很多，但最主要的原因就是GitHub的分发加速网络域名遭到DNS的污染。 
为了解决这个问题，可以通过修改Hosts文件，绕过国内的DNS解析，直接访问GitHub的CDN节点，从而达到加速的目的。  

### 实现思路
1. 列出github相关的所有域名  
2. 从 https://www.ping.cn/ 上查询到域名对应的ip
3. 通过ping命令来计算本地到各个ip的连通情况，选取最好的一个ip
4. 生成hosts文件
5. 用户手动或自动的修改本机hosts

### 使用
``` bash
git clone https://github.com/run-dream/github-dns-detect.git
npm install
npm run start
// for windows
ipconfig /flushdns
// for mac
sudo dscacheutil -flushcache
```
