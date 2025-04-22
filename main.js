function createElement(type, props, ...children) {
  return {
    type,
    props: props || {},
    children: children.flat(),
  };
}

// コンポーネント関数
function Hello(props) {
  return createElement('h1', {}, `Hello, ${props.name}`);
}

const vdom = createElement(Hello, { name: 'TinyReact' });

// 仮想DOMから本物のDOMを作成する関数
function render(vnode) {
  // テキストノード（文字列）
  if (typeof vnode === 'string') {
    return document.createTextNode(vnode);
  }

  // 関数コンポーネント
  if (typeof vnode.type === 'function') {
    return render(vnode.type({ ...vnode.props }));
  }

  // 通常のDOMノード
  const el = document.createElement(vnode.type);

  for (const [key, value] of Object.entries(vnode.props || {})) {
    el.setAttribute(key, value);
  }

  (vnode.children || []).forEach(child => {
    el.appendChild(render(child));
  });

  return el;
}

// 実際に描画
const root = document.getElementById('root');
root.appendChild(render(vdom));
