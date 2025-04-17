// 仮想DOMの定義（手で書く）
const vdom = {
    type: 'div',
    props: { id: 'app', class: 'container' },
    children: [
      {
        type: 'h1',
        props: {},
        children: ['Hello from TinyReact!']
      },
      {
        type: 'p',
        props: {},
        children: ['This is a very tiny React clone.']
      }
    ]
  };
  
  // 仮想DOMから本物のDOMを作成する関数
  function render(vnode) {
    // テキストノード（文字列）の場合
    if (typeof vnode === 'string') {
      return document.createTextNode(vnode);
    }
  
    // エレメントノード
    const el = document.createElement(vnode.type);
  
    // 属性を設定（props）
    for (const [key, value] of Object.entries(vnode.props || {})) {
      el.setAttribute(key, value);
    }
  
    // 子要素を再帰的に追加
    (vnode.children || []).forEach(child => {
      el.appendChild(render(child));
    });
  
    return el;
  }
  
  // 実際に描画（マウント）
  const root = document.getElementById('root');
  root.appendChild(render(vdom));
  