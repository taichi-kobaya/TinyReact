// ========== TinyReact の内部状態 ==========
let hooks = [];
let currentHook = 0;
let rootComponent = null;
let rootElement = null;

const TinyReact = {
  useState(initialValue) {
    const hookIndex = currentHook;

    // 初回だけ初期値を入れる
    hooks[hookIndex] = hooks[hookIndex] ?? initialValue;

    function setState(newValue) {
      hooks[hookIndex] = newValue;
      renderRoot(); // 再レンダー
    }

    currentHook++;
    return [hooks[hookIndex], setState];
  }
};

// ========== JSX風の構文サポート ==========

function createElement(type, props = {}, ...children) {
  return { type, props, children };
}

// ========== 仮想DOM → 本物のDOM ==========

function render(vnode) {
  // テキストノード
  if (typeof vnode === 'string') {
    return document.createTextNode(vnode);
  }

  // 関数コンポーネント
  if (typeof vnode.type === 'function') {
    currentHook = 0; // 各コンポーネントの呼び出しごとにリセット
    return render(vnode.type(vnode.props));
  }

  // 通常のDOMノード
  const el = document.createElement(vnode.type);

  // 属性の設定
  for (const [key, value] of Object.entries(vnode.props || {})) {
    if (key.startsWith('on') && typeof value === 'function') {
      el.addEventListener(key.slice(2).toLowerCase(), value);
    } else {
      el.setAttribute(key, value);
    }
  }

  // 子ノードの再帰レンダリング
  vnode.children.forEach(child => {
    el.appendChild(render(child));
  });

  return el;
}

// ========== 状態付きコンポーネントの描画 ==========
function renderRoot() {
  currentHook = 0; // 再描画時にフックの位置をリセット
  rootElement.innerHTML = '';
  rootElement.appendChild(render(rootComponent));
}

// ========== サンプル：useState を使ったボタン ==========
function Counter() {
  const [count, setCount] = TinyReact.useState(0);

  return createElement(
    'button',
    { onclick: () => setCount(count + 1) },
    `Clicked ${count} times`
  );
}

// ========== エントリーポイント ==========
const vdom = createElement(Counter, {});
rootComponent = vdom;
rootElement = document.getElementById('root');
rootElement.appendChild(render(vdom));
