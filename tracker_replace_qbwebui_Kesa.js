// ==UserScript==
// @name         qB_WebUI_标签批量替换tracker
// @version      1.0.0
// @author       Kesa
// @description  利用 qBitorrent WebUI 的 tag API 批量替换 Tracker
// @license      MIT
// @null     ----------------------------
// @run-at       document-end
// @match        http://192.168.31.107:9091/
// @match        http://192.168.31.99:9092/
// @match        http://127.0.0.1:8080/
// @require      https://cdn.bootcdn.net/ajax/libs/jquery/3.6.3/jquery.min.js
// ==/UserScript==

/**
 * 参考: https://greasyfork.org/zh-CN/scripts/391688-水水-qbittorrent-管理脚本-qq-群-189574683
 * 感谢这位大佬, 本脚本是参考了一下这个大佬的脚本进行简化而来的
 * ----------------
 * 流程:
 * 1. 在 UI 界面开个 button 调出页面
 * 2. 检测所有指定 tag 的种子 hash
 * 3. 将所有指定 hash 的种子的 tracker 改为 指定的 tracker
 */

// NOTE: 0. 顶层配置
const host = window.location.href;
const baseURL = 'api/v2/torrents/';
const prevURL = host + baseURL;

/**fetch 封装
 * @param {*} route 路由
 * @returns Promise
 */
async function getFetch(route) {
  try {
    const response = await fetch(prevURL + route);
    if (!response.ok) { throw new Error('请求失败'); }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(error);
    return null;
  }
}
// NOTE: 1. 在 UI 界面开个 button 调出页面
const jq = jQuery;
const $ = jQuery;
// 添加菜单栏按钮
jq("#desktopNavbar > ul").append(
  "<li><a class='js-modal'><b>→批量替换 Tracker←</b></a></li>",
);

// js-modal 绑定点击事件
jq(".js-modal").click(async function () {

  // 请求 tag 列表
  const tagList = await getFetch('tags')
  console.log(tagList);
  // 没有 tag 就提示新建
  if (tagList.length == 0) { alert('请新建一个标签, 否则无法使用!'); return }

  // 构建编辑框 html
  let select = `<select id='js-select'><option value='empty'>无</option>`;
  for (const tag of tagList) {
    select += `<option value=${tag}>${tag}</option>`;
  }
  select += `</select>`;
  const strHtml = (select) => {
    return `
<div style="padding:13px 23px;">
  <h2>标签：${select} </h2><br>
  <h2>预览: <span id="torrent-count"></span><select id='torrent-select'><option value='empty'>无</option></select></h2><br>
  <h2>新 Tracker:</h2>
  <input class="js-input" type="text" name="newUrl" style="width: 97%;">
  <hr>
  <button class="js-replace">替换</button>
  <span class="js-tip-btn"></span>
</div>
`};

  // 用 qB_WebUI 自带的 MochaUI 调消息框出来
  new MochaUI.Window({
    id: "js-modal",
    title: "批量替换 Tracker",
    content: '',
    scrollbars: true,
    resizable: true,
    maximizable: false,
    closable: true,
    paddingVertical: 0,
    paddingHorizontal: 0,
    width: 800,
    height: 230,
    draggable: true,
  });
  jq("#js-modal_content").append(strHtml(select));
  jq("#js-modal_contentWrapper").css({
    height: "auto",
  });


  // NOTE: 2. 检测所有指定 tag 的种子 hash
  let selectedTag;
  let torrentList;
  let selectedList;
  const _dom = document.getElementById('js-select');
  _dom.onchange = async () => {
    // 改变标签
    selectedTag = _dom.value;
    console.log('选择的标签: ', selectedTag)

    // 获取改变标签的种子列表
    torrentList = await getFetch(`info`)
    // console.log(torrentList)
    selectedList = torrentList.filter(el => el.tags.includes(selectedTag))
    console.log('所选标签种子: ', selectedList);

    // 显示所需种子列表个数
    jq('#torrent-count').text(`数量: ${selectedList.length} `)

    // 显示在 select 里
    let html = ``;
    for (const seed of selectedList) {
      html += `<option value=${seed.hash}>${seed.tracker}</option>`;
    }
    jq('#torrent-select').html(html)
  }





});


