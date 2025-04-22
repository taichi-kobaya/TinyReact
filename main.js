// JSX風に仮想DOMを構築できる createElement 関数
function createElement(type, props, ...children) {
  return {
    type,
    props: props || {},
    children: children.flat()
  };
}

// 仮想DOMの構築（今まで手で書いていたもの）
const vdom = createElement(
  'div',
  { id: 'app', class: 'container' },
  createElement('h1', null, 'Hello from TinyReact!'),
  createElement('p', null, 'This is a very tiny React clone.')
);

// 仮想DOMから本物のDOMを作成する関数（変更なし）
function render(vnode) {
  if (typeof vnode === 'string') {
    return document.createTextNode(vnode);
  }

  const el = document.createElement(vnode.type);

  for (const [key, value] of Object.entries(vnode.props || {})) {
    el.setAttribute(key, value);
  }

  (vnode.children || []).forEach(child => {
    el.appendChild(render(child));
  });

  return el;
}

// 実際に描画（マウント）
const root = document.getElementById('root');
root.appendChild(render(vdom));
